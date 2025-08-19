import os
import jwt
import requests
from functools import wraps
from flask import request, jsonify, g
from dotenv import load_dotenv

# Load environment variables, specifically the Clerk issuer URL
load_dotenv()

# Clerk provides a JWKS (JSON Web Key Set) endpoint.
# A JWKS is a standard way for an auth provider to publish the public keys
# that can be used to verify their JWTs.
CLERK_JWKS_URL = os.environ.get("CLERK_JWKS_URL")

# We'll cache the keys to avoid fetching them on every single API request.
# This is a simple in-memory cache. For production, a more robust cache
# like Redis could be used.
jwks_cache = {}

def get_public_key(token: str):
    """
    Fetches the appropriate public key from the JWKS endpoint to verify the token.
    It uses the 'kid' (Key ID) from the token header to find the matching key.
    """
    try:
        # The 'kid' is a unique identifier for the key.
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header['kid']
    except jwt.exceptions.DecodeError as e:
        raise ValueError(f"Invalid token header: {e}")

    # Check our cache first
    if kid in jwks_cache:
        return jwks_cache[kid]

    # If not in cache, fetch the full JWKS from Clerk
    if not CLERK_JWKS_URL:
        raise ValueError("CLERK_JWKS_URL environment variable is not set.")
        
    response = requests.get(CLERK_JWKS_URL)
    response.raise_for_status()
    jwks = response.json()

    # Find the key with the matching 'kid'
    for key in jwks['keys']:
        if key['kid'] == kid:
            # Convert the key to a format PyJWT understands and cache it
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
            jwks_cache[kid] = public_key
            return public_key
    
    raise ValueError("Public key not found in JWKS.")


def token_required(f):
    """
    A decorator to protect Flask endpoints.
    It checks for a valid Clerk JWT in the Authorization header.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the token from the "Bearer <token>" header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({'message': 'Authorization header is missing or invalid'}), 401
        
        token = auth_header.split(' ')[1]

        try:
            # Get the public key needed to verify this specific token
            public_key = get_public_key(token)
            
            # Decode and verify the JWT.
            # This function checks:
            # 1. The signature is valid (signed by Clerk's private key).
            # 2. The token has not expired ('exp' claim).
            # 3. The token is issued by Clerk ('iss' claim).
            # 4. The token is intended for this application ('azp' claim).
            decoded_token = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                # The 'issuer' is provided in your Clerk dashboard API keys page
                issuer=os.environ.get("CLERK_ISSUER") 
            )

            # The 'sub' (subject) claim contains the unique user ID.
            # We store it in Flask's global 'g' object, so the endpoint
            # can access it easily.
            g.current_user_uid = decoded_token['sub']

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired.'}), 401
        except Exception as e:
            return jsonify({'message': f'Token validation failed: {str(e)}'}), 403
        
        # If verification is successful, call the actual endpoint function
        return f(*args, **kwargs)
    return decorated_function