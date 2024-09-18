import json
import psycopg2
import os
from openai import OpenAI
from lambda_decorators import json_http_resp, cors_headers , load_json_body
from datetime import datetime
import pytz
# Set up OpenAI client

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])


DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': 5432
}

def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(**DB_PARAMS)

def check_and_add_email(email):
    """Check if email exists, add if it doesn't."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Check if email exists
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            if cur.fetchone() is not None:
                return {'success': False, 'message': 'Email already in the system'}

            # If email doesn't exist, insert it
            cur.execute(
                "INSERT INTO users (email, status) VALUES (%s, %s)",
                (email, 'pre')
            )
            conn.commit()
            return {'success': True, 'message': 'Email added successfully'}
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success': False, 'message': 'An error occurred'}
    finally:
        conn.close()

def add_itinerary_to_user(email, itinerary, destination, days, budget):
    """Add the itinerary to the user's itinerary."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO itinerarys (email, itinerary, destination, days, budget,itinerary_order,created_at) VALUES (%s, %s, %s, %s, %s,%s,%s)",
                (email, itinerary, destination, days, budget,0,datetime.now(pytz.utc) ) 
            )   
            conn.commit()
            return {'success': True, 'message': 'Itinerary updated successfully'}
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success': False, 'message': 'An error occurred'}
    finally:
        conn.close()


@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    # Parse the incoming JSON from API Gateway
    body = event.get('body', {})
    destination = body.get('destination', '')
    days = body.get('days', '')
    budget = body.get('budget', '')
    themes = body.get('themes')
    print(event)
    if 'requestContext' in event and 'authorizer' in event['requestContext']:
        claims = event['requestContext']['authorizer']['claims']
        to_email = claims.get('email')

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
    Lunch: [Lunch recommendation]
    Afternoon: [Afternoon activity]
    Dinner: [Dinner recommendation]
    Evening: [Evening activity]
    Costs: [Estimated costs for the day, if applicable]

    Please ensure each section is on a new line and follows this exact structure.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        print(content)
        
        # print(json.dumps(formatted_itinerary, indent=2))
        add_itinerary_to_user(to_email, content, destination, days, budget)
       
        return {
            'statusCode': 200,
            'body': json.dumps({'itinerary': content}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
            }
        }


if __name__ == "__main__":
    result = lambda_handler({"body": {"destination": "Paris", "days": "3", "budget": "1000","email":"maxvengelhard@gmail.com"}}, None)
    print(result)