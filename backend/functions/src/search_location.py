import json
import os
import urllib.parse
import urllib.request
from lambda_decorators import json_http_resp, cors_headers, load_json_body

GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
AUTOCOMPLETE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json"

@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    # Extract the 'input' query parameter
    query_params = event.get('queryStringParameters', {})
    input_text = query_params.get('input', '')

    if not input_text:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Input parameter is required'})
        }

    # Construct the URL for the Places API request
    params = {
        'input': input_text,
        'types': '(cities)',
        'key': GOOGLE_MAPS_API_KEY
    }
    url = f"{AUTOCOMPLETE_URL}?{urllib.parse.urlencode(params)}"

    try:
        # Make the request to the Google Places API
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())

        # Extract the relevant information from the response
        predictions = data.get('predictions', [])
        suggestions = [
            {
                'place_id': pred['place_id'],
                'description': pred['description']
            }
            for pred in predictions
        ]

        return {
            'statusCode': 200,
            'body': suggestions  # Ensure the body is JSON-encoded
        }

    except Exception as e:
        print(f"Error fetching place autocomplete: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to fetch suggestions'})
        }

if __name__ == '__main__':
    event = {
        'queryStringParameters': {
            'input': 'New York'
        }
    }
    context = {}
    resp = lambda_handler(event, context)
    print(resp)