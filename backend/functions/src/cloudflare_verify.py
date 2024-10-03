import json
import requests
import os
from lambda_decorators import json_http_resp, cors_headers , load_json_body

TURNSTILE_SECRET_KEY = os.environ.get('TURNSTILE_SECRET_KEY')
TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

@json_http_resp
@cors_headers
@load_json_body
def lambda_handler(event, context):
    print(event)
    try:
        # Parse the incoming JSON body
        body = event['body']
        token = body.get('token')

        if not token:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Token is required'})
            }

        # Prepare the data for Cloudflare verification
        data = {
            'secret': TURNSTILE_SECRET_KEY,
            'response': token
        }

        # Send the verification request to Cloudflare
        response = requests.post(TURNSTILE_VERIFY_URL, data=data)
        result = response.json()

        if result['success']:
            # Token is valid
            return {
                'statusCode': 200,
                'body': json.dumps({'success': True, 'message': 'Human verified'})
            }
        else:
            # Token is invalid
            return {
                'statusCode': 400,
                'body': json.dumps({'success': False, 'error': 'Invalid token'})
            }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Server error'})
        }