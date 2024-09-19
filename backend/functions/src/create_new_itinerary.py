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


def add_itinerary_to_user(email, itinerary, destination, days, budget,themes):
    """Add the itinerary to the user's itinerary."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:

            cur.execute(
                "SELECT MAX(itinerary_order) FROM itinerarys WHERE email = %s",
                (email,)
            )
            max_order = cur.fetchone()[0]
            
            # If there are no existing itineraries, set the order to 0, otherwise increment
            new_order = 0 if max_order is None else max_order + 1
            cur.execute(
                "INSERT INTO itinerarys (email, itinerary, destination, days, budget,itinerary_order,created_at,themes) VALUES (%s, %s, %s, %s, %s,%s,%s,%s)",
                (email, itinerary, destination, days, budget,new_order,datetime.now(pytz.utc),themes ) 
            )   
            conn.commit()
            return {'success': True, 'message': 'Itinerary updated successfully'}
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success': False, 'message': 'An error occurred'}
    finally:
        conn.close()


def get_user_credits(email):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT credits FROM users WHERE email = %s", (email,))
            result = cur.fetchone()
            return result[0] if result else 0
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return 0
    finally:
        conn.close()

def update_user_credits(email, new_credit_amount):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET credits = %s WHERE email = %s",
                (new_credit_amount, email)
            )
            conn.commit()
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
    finally:
        conn.close()

@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    print(event)
    # Parse the incoming JSON from API Gateway
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

    # Check if user has enough credits
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
    IMPORTANT: Make sure that no activities or restaurants repeat across the entire itinerary. Each activity and meal should be unique throughout the trip.
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
        add_itinerary_to_user(to_email, content, destination, days, budget,themes)

        update_user_credits(to_email, user_credits - total_cost)
       
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