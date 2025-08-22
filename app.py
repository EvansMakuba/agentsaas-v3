import os
import logging
import json
import hmac
import hashlib
from flask import Flask, jsonify, request, g
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from dotenv import load_dotenv
import requests
from datetime import datetime, timezone
from flask.json.provider import JSONProvider
from cryptography.fernet import Fernet
from clerk_sdk import Clerk

# Import our custom authentication decorator and Celery tasks
from auth import token_required
from tasks import analyze_reddit_profile

# =====================================================================================
# CUSTOM JSON ENCODER
# =====================================================================================
class CustomJSONProvider(JSONProvider):
    def __init__(self, app):
        super().__init__(app)
        self._default_serializer = json.JSONEncoder().default

    def default(self, o):
        if isinstance(o, bytes):
            return o.decode('utf-8')
        if isinstance(o, datetime):
            return o.isoformat()
        return self._default_serializer(o)

    def dumps(self, obj, **kwargs):
        return json.dumps(obj, default=self.default, **kwargs)

    def loads(self, s, **kwargs):
        return json.loads(s, **kwargs)

# =====================================================================================
# INITIALIZATION
# =====================================================================================
load_dotenv()
app = Flask(__name__)
app.json = CustomJSONProvider(app) # Apply our custom JSON provider
logging.basicConfig(level=logging.INFO)
CORS(app, origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")], supports_credentials=True)

# --- SDK & Client Initialization ---
clerk_client = Clerk()
db = None
cipher_suite = None

try:
    cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "google-application-credentials.json")
    if not os.path.exists(cred_path):
        raise FileNotFoundError(f"'{cred_path}' not found.")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, name='flask_api')
    db = firestore.client(app=firebase_admin.get_app(name='flask_api'))
    app.logger.info("Firebase initialized successfully for Flask API.")
except Exception as e:
    app.logger.critical(f"FATAL: Could not initialize Firebase: {e}", exc_info=True)

ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    app.logger.critical("FATAL: ENCRYPTION_KEY is not set.")
else:
    cipher_suite = Fernet(ENCRYPTION_KEY.encode())

# =====================================================================================
# API ENDPOINTS
# =====================================================================================

@app.route("/api/health")
def health_check():
    if db:
        return jsonify({"status": "ok", "database": "connected"}), 200
    else:
        return jsonify({"status": "error", "database": "disconnected"}), 503

# --- User & Profile Management ---

@app.route('/api/get-user-profile', methods=['GET'])
@token_required
def get_user_profile():
    if not db: return jsonify({"error": "Database service is not available."}), 503
    user_id = g.current_user_uid
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            app.logger.info(f"User profile for {user_id} not found. Creating default.")
            default_profile = {
                'clerk_id': user_id, 'role': None, 'created_at': firestore.SERVER_TIMESTAMP,
                'balance_usd': 0, 'trust_tier': 1
            }
            user_ref.set(default_profile)
            profile_to_return = default_profile.copy()
            profile_to_return['created_at'] = datetime.now(timezone.utc).isoformat()
            return jsonify(profile_to_return), 200
        return jsonify(user_doc.to_dict()), 200
    except Exception as e:
        app.logger.error(f"Error in get_user_profile for {user_id}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route('/api/set-user-role', methods=['POST'])
@token_required
def set_user_role():
    if not db: return jsonify({"error": "Database service is not available."}), 503
    data = request.get_json()
    role = data.get('role')
    if role not in ['brand', 'executor']:
        return jsonify({"error": "Invalid role specified."}), 400
    user_id = g.current_user_uid
    user_ref = db.collection('users').document(user_id)
    try:
        user_doc = user_ref.get()
        if user_doc.exists and user_doc.to_dict().get('role'):
            return jsonify({"error": "Role has already been set."}), 403
        clerk_client.users.update_user_metadata(user_id, private_metadata={'role': role})
        user_ref.update({'role': role})
        return jsonify({"status": "success", "role": role}), 200
    except Exception as e:
        app.logger.error(f"Error setting role for {user_id}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route('/api/save-reddit-credentials', methods=['POST'])
@token_required
def save_reddit_credentials():
    if not db: return jsonify({"error": "Database service is not available."}), 503
    if not cipher_suite: return jsonify({"error": "Encryption service not configured."}), 500
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400
    if "u/" in username or " " in username or "@" in username:
        return jsonify({"error": "Please enter a valid Reddit username."}), 400
    try:
        encrypted_password = cipher_suite.encrypt(password.encode())
        encrypted_password_string = encrypted_password.decode('utf-8')
        user_ref = db.collection('users').document(g.current_user_uid)
        user_ref.update({
            'reddit_credentials': {'username': username, 'password_encrypted': encrypted_password_string},
            'reddit_profile_status': 'pending_analysis'
        })
        analyze_reddit_profile.delay(g.current_user_uid)
        return jsonify({"status": "success", "message": "Credentials saved. Profile analysis has begun."}), 200
    except Exception as e:
        app.logger.error(f"Error saving Reddit credentials for {g.current_user_uid}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

# --- Brand Campaign Management ---

@app.route('/api/create-campaign', methods=['POST'])
@token_required
def create_campaign():
    """Allows a 'brand' user to create and fund a new engagement campaign."""
    if not db: return jsonify({"error": "Database service is not available."}), 503

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

    # --- Payment Logic (Mocking vs. Production) ---
    app_mode = os.environ.get("APP_MODE", "production")
    if app_mode == "development":
        app.logger.warning(f"APP_MODE is 'development'. Faking successful payment for campaign {campaign_ref.id}")
        campaign_ref.update({"status": "active"})
        fake_success_url = f"{os.environ.get('FRONTEND_URL')}/payment-success?campaign_id={campaign_ref.id}"
        return jsonify({"payment_url": fake_success_url}), 200

    # --- Production IntaSend Logic ---
    # (This part is now clean and only runs in production mode)
    payment_payload = {
        "public_key": os.environ.get("NEXT_PUBLIC_INTASEND_PUBLISHKABLE_KEY"),
        "amount": data['budget'],
        "currency": "KES",
        "email": "brand.user@example.com", # TODO: Get from Clerk
        "api_ref": campaign_ref.id
    }
    headers = {"Authorization": f"Bearer {os.environ.get('INTASEND_API_TOKEN')}", "Content-Type": "application/json"}
    try:
        response = requests.post("https://api.intasend.com/api/v1/checkout/", json=payment_payload, headers=headers)
        response.raise_for_status()
        return jsonify({"payment_url": response.json()['url']}), 200
    except requests.exceptions.RequestException as e:
        app.logger.error(f"IntaSend API Error for campaign {campaign_ref.id}: {e}")
        campaign_ref.delete()
        return jsonify({"error": "Failed to communicate with payment provider."}), 502

# Add this endpoint inside the "Brand Campaign Management" section

@app.route('/api/get-my-campaigns', methods=['GET'])
@token_required
def get_my_campaigns():
    """
    Fetches all campaigns associated with the currently authenticated Brand user.
    """
    if not db:
        return jsonify({"error": "Database service is not available."}), 503
    
    user_id = g.current_user_uid
    try:
        campaigns_ref = db.collection('campaigns')
        # This query is the core of the logic: find all documents where the
        # 'brand_user_id' field matches the ID from the user's auth token.
        query = campaigns_ref.where(filter=FieldFilter("brand_user_id", "==", user_id))
        
        user_campaigns = query.stream()
        
        campaigns_list = []
        for campaign in user_campaigns:
            campaign_data = campaign.to_dict()
            # It's good practice to include the document ID in the response
            campaign_data['id'] = campaign.id
            # Convert Firestore timestamps to a JSON-friendly string format
            for key, value in campaign_data.items():
                if isinstance(value, datetime):
                    campaign_data[key] = value.isoformat()
            campaigns_list.append(campaign_data)
        
        return jsonify(campaigns_list), 200
    except Exception as e:
        app.logger.error(f"Error fetching campaigns for user {user_id}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

# --- Executor Task Management ---

@app.route('/api/get-available-tasks', methods=['GET'])
@token_required
def get_available_tasks():
    """Fetches tasks from the marketplace that an Executor is eligible for."""
    if not db: return jsonify({"error": "Database service is not available."}), 503
    
    try:
        query = db.collection('available_tasks').where(filter=FieldFilter("status", "==", "open")).limit(20)
        tasks_list = []
        for task in query.stream():
            task_data = task.to_dict()
            task_data['id'] = task.id
            if 'created_at' in task_data and hasattr(task_data['created_at'], 'isoformat'):
                task_data['created_at'] = task_data['created_at'].isoformat()
            tasks_list.append(task_data)
        return jsonify(tasks_list), 200
    except Exception as e:
        app.logger.error(f"Error fetching available tasks: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

# =====================================================================================
# WEBHOOKS
# =====================================================================================

@app.route('/api/webhooks/intasend', methods=['POST'])
def intasend_webhook():
    """Handles payment confirmation webhooks from IntaSend."""
    # ... (This webhook logic is clean and can remain as is)
    # ...
    return jsonify(status='success'), 200

# =====================================================================================
# MAIN EXECUTION
# =====================================================================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)