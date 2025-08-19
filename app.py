import os
from flask import Flask, jsonify, request, g
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Import our custom authentication decorator
from auth import token_required

# We need these libraries for webhook signature verification
import hmac
import hashlib
import json

# --- Initialization ---
load_dotenv()
app = Flask(__name__)

# Configure CORS to allow requests from our frontend
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Initialize Firebase Admin SDK
try:
    # We will create this credentials file in the next step
    cred = credentials.Certificate("google-application-credentials.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"FATAL: Could not initialize Firebase: {e}")
    # In a real app, you'd want more robust error handling or logging
    db = None

# --- API Endpoints ---

@app.route("/api/health")
def health_check():
    """A simple endpoint to check if the server is running."""
    return jsonify({"status": "ok"}), 200

# Add this new endpoint to your app.py file,
# ideally after the health_check and before set_user_role.

@app.route('/api/get-user-profile', methods=['GET'])
@token_required # Protect this endpoint
def get_user_profile():
    """
    Fetches the user's document from Firestore, which contains their role.
    This is used by the frontend to determine which dashboard to display.
    """
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
    
    user_id = g.current_user_uid
    try:
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            # This is a fallback case, shouldn't happen in normal flow
            return jsonify({"error": "User profile not found."}), 404
        
        # Return the entire user document as JSON
        return jsonify(user_doc.to_dict()), 200
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


@app.route('/api/set-user-role', methods=['POST'])
@token_required  # This decorator protects the endpoint and verifies the user's JWT
def set_user_role():
    """
    Sets the user's role in Firestore. This can only be done once.
    """
    if not db:
        return jsonify({"error": "Database not initialized"}), 500

    data = request.get_json()
    role = data.get('role')

    # Validate the input from the frontend
    if role not in ['brand', 'executor']:
        return jsonify({"error": "Invalid role specified."}), 400

    # The user's ID is available via `g.current_user_uid` thanks to the @token_required decorator
    user_id = g.current_user_uid
    user_ref = db.collection('users').document(user_id)
    
    try:
        user_doc = user_ref.get()

        # IMPORTANT: Prevent users from changing their role after it's been set.
        if user_doc.exists and user_doc.to_dict().get('role'):
            return jsonify({"error": "Role has already been set."}), 403 # 403 Forbidden

        # Create or update the user document with their role and other initial data
        user_ref.set({
            'clerk_id': user_id,
            'role': role,
            'created_at': firestore.SERVER_TIMESTAMP,
            'balance_usd': 0 # Initialize balance for executors
        }, merge=True) # merge=True prevents overwriting other data if the doc exists

        return jsonify({"status": "success", "role": role}), 200

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

# Add this new endpoint after your other API routes

# @app.route('/api/create-campaign', methods=['POST'])
# @token_required
# def create_campaign():
#     """
#     Allows a 'brand' user to create and fund a new engagement campaign.
#     It saves the campaign to Firestore with a 'pending_payment' status
#     and then generates an IntaSend checkout URL for the Brand to pay.
#     """
#     if not db:
#         return jsonify({"error": "Database service is not available."}), 503

#     data = request.get_json()
#     # --- 1. Validate Input ---
#     required_fields = ['objective', 'budget', 'targetSubreddits']
#     if not all(key in data for key in required_fields):
#         return jsonify({"error": "Missing required campaign fields."}), 400

#     # --- 2. Create Campaign Document in Firestore ---
#     campaign_ref = db.collection('campaigns').document() # Create a new document with a unique ID
#     campaign_ref.set({
#         "brand_user_id": g.current_user_uid,
#         "objective": data['objective'],
#         "budget_usd": float(data['budget']),
#         "target_subreddits": data['targetSubreddits'],
#         "status": "pending_payment", # The campaign is not active until paid
#         "created_at": firestore.SERVER_TIMESTAMP
#     })
#     app.logger.info(f"Created pending campaign {campaign_ref.id} for user {g.current_user_uid}")

#     # --- 3. Initiate Payment with IntaSend ---
#     # TODO: In a real app, you'd get the user's email from their Clerk profile
#     payment_payload = {
#         "public_key": os.environ.get("NEXT_PUBLIC_INTASEND_PUBLISHABLE_KEY"),
#         "amount": data['budget'],
#         "currency": "KES", # Or USD, depending on your IntaSend setup
#         "email": "brand.user@example.com", 
#         "first_name": "Brand",
#         "last_name": "User",
#         "country": "KE",
#         # CRITICAL: This links the payment to our campaign ID.
#         # This is how the webhook will identify which campaign to activate.
#         "api_ref": campaign_ref.id 
#     }
#     headers = {
#         "Authorization": f"Bearer {os.environ.get('INTASEND_API_TOKEN')}",
#         "Content-Type": "application/json"
#     }

#     try:
#         response = requests.post("https://api.intasend.com/api/v1/checkout/", json=payment_payload, headers=headers)
#         response.raise_for_status() # Raise an exception for bad status codes
#         payment_data = response.json()
        
#         # --- 4. Return Payment URL to Frontend ---
#         return jsonify({"payment_url": payment_data['url']}), 200

#     except requests.exceptions.RequestException as e:
#         app.logger.error(f"IntaSend API Error for campaign {campaign_ref.id}: {e}")
#         # If payment initiation fails, we should delete the pending campaign to keep our DB clean.
#         campaign_ref.delete()
#         return jsonify({"error": "Failed to communicate with payment provider."}), 502 # 502 Bad Gateway

@app.route('/api/webhooks/intasend', methods=['POST'])
def intasend_webhook():
    """
    Handles payment confirmation webhooks from IntaSend.
    This is the most critical link in activating a campaign.
    """
    # --- 1. Security: Verify the Webhook Signature ---
    # This ensures the request is truly from IntaSend and not a malicious actor.
    intasend_signature = request.headers.get('X-IntaSend-Signature')
    webhook_secret = os.environ.get('INTASEND_WEBHOOK_SECRET')
    payload = request.data # Get the raw request body

    if not intasend_signature or not webhook_secret:
        app.logger.error("Webhook security credentials are not configured.")
        return jsonify(error="Webhook misconfigured"), 500

    # Calculate the expected signature
    expected_signature = hmac.new(
        key=webhook_secret.encode('utf-8'),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()

    # Compare the signatures. If they don't match, reject the request.
    if not hmac.compare_digest(intasend_signature, expected_signature):
        app.logger.warning("Invalid webhook signature received.")
        return jsonify(error="Invalid signature"), 403 # 403 Forbidden

    # --- 2. Process the Payload ---
    # If the signature is valid, we can safely process the data.
    data = json.loads(payload)
    app.logger.info(f"Received valid IntaSend webhook: {data}")

    # Check if the payment was successful
    if data.get('state') == 'COMPLETE':
        # Get the campaign ID we passed in the 'api_ref' field
        campaign_id = data.get('api_ref')
        if not campaign_id:
            app.logger.error("IntaSend webhook missing 'api_ref' (campaign_id).")
            return 'Webhook Error: Missing api_ref', 400

        # --- 3. Update the Database ---
        # Find the campaign document using the ID and activate it.
        campaign_ref = db.collection('campaigns').document(campaign_id)
        campaign_ref.update({"status": "active"})
        
        app.logger.info(f"Campaign {campaign_id} successfully funded. Status set to ACTIVE.")
        
        # TODO: This is where we will trigger the Celery task to start generating tasks
        # celery_app.send_task('tasks.generate_task_for_marketplace', args=[campaign_id])

    return jsonify(status='success'), 200


@app.route('/api/create-campaign', methods=['POST'])
@token_required
def create_campaign():
    """
    Allows a 'brand' user to create and fund a new engagement campaign.
    In "development" mode, it fakes a successful payment.
    In "production" mode, it generates a real IntaSend checkout URL.
    """
    if not db:
        return jsonify({"error": "Database service is not available."}), 503

    # ... (the first part of the function remains the same) ...
    data = request.get_json()
    required_fields = ['objective', 'budget', 'targetSubreddits']
    if not all(key in data for key in required_fields):
        return jsonify({"error": "Missing required campaign fields."}), 400

    campaign_ref = db.collection('campaigns').document()
    campaign_ref.set({
        "brand_user_id": g.current_user_uid,
        "objective": data['objective'],
        "budget_usd": float(data['budget']),
        "target_subreddits": data['targetSubreddits'],
        "status": "pending_payment",
        "created_at": firestore.SERVER_TIMESTAMP
    })
    app.logger.info(f"Created pending campaign {campaign_ref.id} for user {g.current_user_uid}")

    # --- THIS IS THE NEW "MOCKING" LOGIC ---
    app_mode = os.environ.get("APP_MODE", "production")

    if app_mode == "development":
        app.logger.warning(f"APP_MODE is 'development'. Faking successful payment for campaign {campaign_ref.id}")
        # In development, we skip IntaSend entirely.
        # We immediately mark the campaign as active...
        campaign_ref.update({"status": "active"})
        
        # ...and we create a fake success URL to send the user back to our app.
        # This simulates the user paying and IntaSend redirecting them back.
        fake_success_url = f"{os.environ.get('FRONTEND_URL')}/payment-success?campaign_id={campaign_ref.id}"
        
        # We'll also manually trigger our webhook logic for testing purposes
        # In a real scenario, the webhook would do this.
        # TODO: Trigger Celery task here in the future
        # celery_app.send_task('tasks.generate_task_for_marketplace', args=[campaign_ref.id])

        return jsonify({"payment_url": fake_success_url}), 200

    # --- The original IntaSend logic will now only run in "production" mode ---
    payment_payload = {
        # ... (payload remains the same) ...
    }
    headers = {
        # ... (headers remain the same) ...
    }

    try:
        response = requests.post("https://api.intasend.com/api/v1/checkout/", json=payment_payload, headers=headers)
        response.raise_for_status()
        payment_data = response.json()
        return jsonify({"payment_url": payment_data['url']}), 200

    except requests.exceptions.RequestException as e:
        app.logger.error(f"IntaSend API Error for campaign {campaign_ref.id}: {e}")
        campaign_ref.delete()
        return jsonify({"error": "Failed to communicate with payment provider."}), 502


# This allows us to run the Flask app directly for testing
if __name__ == '__main__':
    # Use port 5000 as planned
    app.run(debug=True, port=5000)