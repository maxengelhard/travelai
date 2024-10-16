import json
import os
import boto3
from openai import OpenAI
from lambda_decorators import json_http_resp, cors_headers, load_json_body
from trip_journey_email import send_itinerary_email
from datetime import datetime
import pytz
import uuid

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
s3 = boto3.client('s3')
BUCKET_NAME = os.environ['S3_DB']

sender_creds = {
    'email': 'tripjourneyai@gmail.com',
    'password': os.getenv('EMAIL_PASSWORD'),
    'name': "Trip Journey AI"
}

def check_and_add_email(email):
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=f'users/{email}.json')
        user_data = json.loads(response['Body'].read().decode('utf-8'))
        if user_data.get('stripe_customer_id'):
            return {'success': False, 'message': 'Email already in the system'}
        else:
            return {'success': False, 'message': 'No customer_id found'}
    except s3.exceptions.NoSuchKey:
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=f'users/{email}.json',
            Body=json.dumps({'email': email, 'status': 'pre'}),
            ContentType='application/json'
        )
        return {'success': True, 'message': 'Email added successfully'}

def save_itinerary(email, itinerary_data):
    key = f'itineraries/{email}/{itinerary_data["itinerary_id"]}.json'
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=json.dumps(itinerary_data),
        ContentType='application/json'
    )

@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    body = event.get('body', {})
    destination = body.get('destination', '')
    days = body.get('days', '')
    budget = body.get('budget', '')
    to_email = body.get('email')

    psql_res = check_and_add_email(to_email)

    if not psql_res['success']:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': psql_res['message']}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

    prompt_parts = ["Create a detailed itinerary for a trip"]
    
    if destination:
        prompt_parts.append(f"to {destination}")
    
    if days:
        prompt_parts.append(f"for {days} days")
    
    if budget:
        prompt_parts.append(f"with a budget of {budget}")
    
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
            'content': content,
            'created_at': datetime.now(pytz.utc).isoformat()
        }
        save_itinerary(to_email, itinerary_data)
        
        email_sent = send_itinerary_email(sender_creds, to_email, content, destination, days, budget)

        if email_sent:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Itinerary generated and sent to your email successfully!',
                    'itinerary': content
                }),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        else:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Failed to send email. Please try again.'}),
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
# from trip_journey_email import send_itinerary_email
# import re
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

# sender_creds = {
#             'email': 'tripjourneyai@gmail.com',
#             'password': os.getenv('EMAIL_PASSWORD'),
#             'name': "Trip Journey AI"
#         }

# def get_db_connection():
#     """Create a database connection."""
#     return psycopg2.connect(**DB_PARAMS)

# def check_and_add_email(email):
#     """Check if email exists, add if it doesn't."""
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             # Check if email exists
#             cur.execute("SELECT stripe_customer_id FROM users WHERE email = %s", (email,))
#             result = cur.fetchone()
            
#             if result is not None:
#                 stripe_customer_id = result[0]
#                 if stripe_customer_id:
#                     return {'success': False, 'message': 'Email already in the system'}
#                 else:
#                     return {'success': False, 'message': 'No customer_id found'}

#             # If email doesn't exist, insert it
#             cur.execute(
#                 "INSERT INTO users (email, status) VALUES (%s, %s)",
#                 (email, 'pre')
#             )
#             conn.commit()
#             return {'success': True, 'message': 'Email added successfully'}
#     except psycopg2.Error as e:
#         conn.rollback()
#         print(f"Database error: {e}")
#         return {'success': False, 'message': 'An error occurred'}
#     finally:
#         conn.close()

# def add_itinerary_to_user(email, itinerary, destination, days, budget):
#     """Add the itinerary to the user's itinerary."""
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute(
#                 "INSERT INTO itinerarys (email, itinerary, destination, days, budget,itinerary_order,created_at) VALUES (%s, %s, %s, %s, %s,%s,%s)",
#                 (email, itinerary, destination, days, budget,0,datetime.now(pytz.utc) ) 
#             )   
#             conn.commit()
#             return {'success': True, 'message': 'Itinerary updated successfully'}
#     except psycopg2.Error as e:
#         conn.rollback()
#         print(f"Database error: {e}")
#         return {'success': False, 'message': 'An error occurred'}
#     finally:
#         conn.close()


# @cors_headers
# @load_json_body
# @json_http_resp
# def lambda_handler(event, context):
#     # Parse the incoming JSON from API Gateway
#     body = event.get('body', {})
#     destination = body.get('destination', '')
#     days = body.get('days', '')
#     budget = body.get('budget', '')
#     to_email = body.get('email')

#     psql_res = check_and_add_email(to_email)

#     if not psql_res['success']:
#         return {
#             'statusCode': 400,
#             'body': json.dumps({'error': psql_res['message']}),
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
#         add_itinerary_to_user(to_email, content, destination, days, budget)
#         # Send the email
#         email_sent = send_itinerary_email(sender_creds, to_email, content, destination, days, budget)

#         if email_sent:
#             return {
#                 'statusCode': 200,
#                 'body': json.dumps({
#                     'message': 'Itinerary generated and sent to your email successfully!',
#                     'itinerary': content
#                 }),
#                 'headers': {
#                     'Content-Type': 'application/json',
#                     'Access-Control-Allow-Origin': '*'
#                 }
#             }
#         else:
#             return {
#                 'statusCode': 500,
#                 'body': json.dumps({'error': 'Failed to send email. Please try again.'}),
#                 'headers': {
#                     'Content-Type': 'application/json',
#                     'Access-Control-Allow-Origin': '*'
#                 }
#             }

#         # return {
#         #     'statusCode': 200,
#         #     'body': json.dumps({'itinerary': itinerary}),
#         #     'headers': {
#         #         'Content-Type': 'application/json',
#         #         'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
#         #     }
#         # }
#     except Exception as e:
#         return {
#             'statusCode': 500,
#             'body': json.dumps({'error': str(e)}),
#             'headers': {
#                 'Content-Type': 'application/json',
#                 'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
#             }
#         }


# if __name__ == "__main__":
#     result = lambda_handler({"body": {"destination": "Paris", "days": "3", "budget": "1000","email":"maxvengelhard@gmail.com"}}, None)
#     print(result)