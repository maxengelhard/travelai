import json
import os
import boto3
from openai import OpenAI
from lambda_decorators import json_http_resp, cors_headers, load_json_body
from datetime import datetime
import pytz
import uuid
import requests

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
s3 = boto3.client('s3')
BUCKET_NAME = os.environ['S3_DB']

def save_itinerary(email, itinerary_data):
    key = f'itineraries/{email}/{itinerary_data["itinerary_id"]}.json'
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=json.dumps(itinerary_data),
        ContentType='application/json'
    )

def get_user_credits(email):
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=f'users/{email}.json')
        user_data = json.loads(response['Body'].read().decode('utf-8'))
        return user_data.get('credits', 0)
    except s3.exceptions.NoSuchKey:
        return 0

def update_user_credits(email, new_credit_amount):
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=f'users/{email}.json')
        user_data = json.loads(response['Body'].read().decode('utf-8'))
    except s3.exceptions.NoSuchKey:
        user_data = {}
    
    user_data['credits'] = new_credit_amount
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=f'users/{email}.json',
        Body=json.dumps(user_data),
        ContentType='application/json'
    )

def get_getyourguide_suggestions(destination):
    url = "https://partner.getyourguide.com/en-us/api/get-autocomplete-suggestions"
    params = {
        "limit": 20,  # Increase limit to get more results
        "query": destination
    }
    headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'referer': 'https://partner.getyourguide.com/en-us/solutions/city',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
    }
    response = requests.get(url, params=params, headers=headers)
    suggestions = response.json()['suggestions']
    
    # Parse the destination to handle different formats
    destination_parts = destination.split(',')
    destination_city = destination_parts[0].strip().lower()
    
    # If there's a state/province, add it to the search terms
    if len(destination_parts) > 1:
        destination_state = destination_parts[1].strip().lower()
        destination_search = f"{destination_city} {destination_state}"
    else:
        destination_search = destination_city

    # Filter for POIs in the specified destination
    pois = [
        suggestion for suggestion in suggestions
        if suggestion['locationType'] == 'poi' and
        (destination_search in suggestion['suggestion'].lower() or
         destination_city in suggestion['suggestion'].lower())
    ]
    
    return pois[:5]

@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    body = event.get('body', {})
    destination = body.get('destination', '')
    days = body.get('days', '')
    budget = body.get('budget', '')
    themes = body.get('themes', [])
    
    if 'requestContext' in event and 'authorizer' in event['requestContext']:
        claims = event['requestContext']['authorizer']['claims']
        to_email = claims.get('email')

    base_cost = 10
    theme_cost = 4 if themes else 0
    if len(themes) > 1:
        theme_cost = 6
    total_cost = base_cost + theme_cost

    user_credits = get_user_credits(to_email)
    if user_credits < total_cost:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Insufficient credits'}),
            'headers': {    
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

    # Get GetYourGuide suggestions
    gyg_suggestions = get_getyourguide_suggestions(destination)

    prompt_parts = ["Create a detailed itinerary for a trip"]
    
    if destination:
        prompt_parts.append(f"to {destination}")
    
    if days:
        prompt_parts.append(f"for {days} days")
    
    if budget:
        prompt_parts.append(f"with a budget of {budget}")

    if themes:
        themes_str = ", ".join(themes)
        prompt_parts.append(f"focusing on the following themes: {themes_str}")
    
    # Add GetYourGuide suggestions to the prompt
    if gyg_suggestions:
        prompt_parts.append("Consider including some of these popular attractions:")
        for suggestion in gyg_suggestions[:5]:  # Limit to top 5 suggestions
            prompt_parts.append(f"- {suggestion['suggestion']}")

    prompt = f"{' '.join(prompt_parts)}. " + """
    For each day, provide the following information in this exact format:
    Day X:
    Morning: [Morning activity]
    Lunch: [Lunch recommendation] (Estimated cost: $XX)
    Afternoon: [Afternoon activity]
    Dinner: [Dinner recommendation] (Estimated cost: $XX)
    Evening: [Evening activity]
    Costs: [Detailed breakdown of estimated costs for the day, including meals and activities]

    Please ensure each section is on a new line and follows this exact structure.
    IMPORTANT: 
    1. Make sure that no activities or restaurants repeat across the entire itinerary. Each activity and meal should be unique throughout the trip.
    2. Include estimated costs for lunch and dinner in parentheses next to each recommendation.
    3. Provide a detailed breakdown of all costs in the 'Costs' section, including meals and activities.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        
        itinerary_id = str(uuid.uuid4())
        itinerary_data = {
            'itinerary_id': itinerary_id,
            'email': to_email,
            'destination': destination,
            'days': days,
            'budget': budget,
            'themes': themes,
            'content': content,
            'created_at': datetime.now(pytz.utc).isoformat()
        }
        save_itinerary(to_email, itinerary_data)

        update_user_credits(to_email, user_credits - total_cost)
       
        return {
            'statusCode': 200,
            'body': {'itinerary': content, 'itinerary_id': itinerary_id},
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }









############################## RDS OLD CODE
# import json
# import psycopg2
# import os
# from openai import OpenAI
# from lambda_decorators import json_http_resp, cors_headers , load_json_body
# from datetime import datetime
# import pytz
# # Set up OpenAI client

# client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])


# DB_PARAMS = {
#     'dbname': os.getenv('DB_NAME'),
#     'user': os.getenv('DB_USER'),
#     'password': os.getenv('DB_PASSWORD'),
#     'host': os.getenv('DB_HOST'),
#     'port': 5432
# }

# def get_db_connection():
#     """Create a database connection."""
#     return psycopg2.connect(**DB_PARAMS)


# def add_itinerary_to_user(email, itinerary, destination, days, budget,themes):
#     """Add the itinerary to the user's itinerary."""
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:

#             cur.execute(
#                 "SELECT MAX(itinerary_order) FROM itinerarys WHERE email = %s",
#                 (email,)
#             )
#             max_order = cur.fetchone()[0]
            
#             # If there are no existing itineraries, set the order to 0, otherwise increment
#             new_order = 0 if max_order is None else max_order + 1
#             cur.execute(
#                 "INSERT INTO itinerarys (email, itinerary, destination, days, budget,itinerary_order,created_at,themes) VALUES (%s, %s, %s, %s, %s,%s,%s,%s)",
#                 (email, itinerary, destination, days, budget,new_order,datetime.now(pytz.utc),themes ) 
#             )   
#             conn.commit()
#             return {'success': True, 'message': 'Itinerary updated successfully','itinerary_id':new_order}
#     except psycopg2.Error as e:
#         conn.rollback()
#         print(f"Database error: {e}")
#         return {'success': False, 'message': 'An error occurred'}
#     finally:
#         conn.close()


# def get_user_credits(email):
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute("SELECT credits FROM users WHERE email = %s", (email,))
#             result = cur.fetchone()
#             return result[0] if result else 0
#     except psycopg2.Error as e:
#         print(f"Database error: {e}")
#         return 0
#     finally:
#         conn.close()

# def update_user_credits(email, new_credit_amount):
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute(
#                 "UPDATE users SET credits = %s WHERE email = %s",
#                 (new_credit_amount, email)
#             )
#             conn.commit()
#     except psycopg2.Error as e:
#         conn.rollback()
#         print(f"Database error: {e}")
#     finally:
#         conn.close()

# @cors_headers
# @load_json_body
# @json_http_resp
# def lambda_handler(event, context):
#     print(event)
#     # Parse the incoming JSON from API Gateway
#     body = event.get('body', {})
#     destination = body.get('destination', '')
#     days = body.get('days', '')
#     budget = body.get('budget', '')
#     themes = body.get('themes', [])
    
#     if 'requestContext' in event and 'authorizer' in event['requestContext']:
#         claims = event['requestContext']['authorizer']['claims']
#         to_email = claims.get('email')

#     base_cost = 10
#     theme_cost = 4 if themes else 0
#     if len(themes) > 1:
#         theme_cost = 6
#     total_cost = base_cost + theme_cost

#     # Check if user has enough credits
#     user_credits = get_user_credits(to_email)
#     if user_credits < total_cost:
#         return {
#             'statusCode': 400,
#             'body': json.dumps({'error': 'Insufficient credits'}),
#             'headers': {    
#                 'Content-Type': 'application/json',
#                 'Access-Control-Allow-Origin': '*'
#             }
#         }


#     prompt_parts = ["Create a detailed itinerary for a trip"]
    
#     if destination:
#         prompt_parts.append(f"to {destination}")
    
#     if days:
#         prompt_parts.append(f"for {days} days")
    
#     if budget:
#         prompt_parts.append(f"with a budget of {budget}")

#     if themes:
#         themes_str = ", ".join(themes)
#         prompt_parts.append(f"focusing on the following themes: {themes_str}")
    
#     prompt = f"{' '.join(prompt_parts)}. " + """
#     For each day, provide the following information in this exact format:
#     Day X:
#     Morning: [Morning activity]
#     Lunch: [Lunch recommendation]
#     Afternoon: [Afternoon activity]
#     Dinner: [Dinner recommendation]
#     Evening: [Evening activity]
#     Costs: [Estimated costs for the day, if applicable]

#     Please ensure each section is on a new line and follows this exact structure.
#     IMPORTANT: Make sure that no activities or restaurants repeat across the entire itinerary. Each activity and meal should be unique throughout the trip.
#     """

#     try:
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=1000,
#             temperature=0.7,
#         )
#         content = response.choices[0].message.content
#         print(content)
        
#         # print(json.dumps(formatted_itinerary, indent=2))
#         added_response = add_itinerary_to_user(to_email, content, destination, days, budget,themes)

#         update_user_credits(to_email, user_credits - total_cost)
       
#         return {
#             'statusCode': 200,
#             'body': {'itinerary': content,'itinerary_id':added_response['itinerary_id']},
#             'headers': {
#                 'Content-Type': 'application/json',
#                 'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
#             }
#         }
#     except Exception as e:
#         return {
#             'statusCode': 500,
#             'body': json.dumps({'error': str(e)}),
#             'headers': {
#                 'Content-Type': 'application/json',
#                 'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
#             }
#         }


if __name__ == "__main__":
    result = get_getyourguide_suggestions("Sydney NSW, Australia")