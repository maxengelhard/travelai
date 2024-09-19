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


def add_itinerary_to_user(email, itinerary, destination, days, budget,themes,prompt):
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
                "INSERT INTO itinerarys (email, itinerary, destination, days, budget,itinerary_order,created_at,themes,prompt) VALUES (%s, %s, %s, %s, %s,%s,%s,%s,%s)",
                (email, itinerary, destination, days, budget,new_order,datetime.now(pytz.utc),themes,prompt ) 
            )   
            conn.commit()
            return {'success': True, 'message': 'Itinerary updated successfully'}
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success': False, 'message': 'An error occurred'}
    finally:
        conn.close()

def select_itinerary_by_id(itinerary_id,email):
    """Select the itinerary by id."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM itinerarys WHERE itinerary_order = %s AND email = %s", (itinerary_id,email))
            columns = [desc[0] for desc in cur.description]
            result = cur.fetchone()
            if result:
                user_dict = dict(zip(columns, result))
                for key, value in user_dict.items():
                    if isinstance(value, datetime):
                        user_dict[key] = value.isoformat()
                return user_dict
            else:
                return None
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return None


@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    print(event)
    # Parse the incoming JSON from API Gateway
    body = event.get('body', {})
    themes = body.get('themes', [])
    edit_prompt = body.get('prompt', '')
    itinerary_id = body.get('itinerary_id', '')
    
    if 'requestContext' in event and 'authorizer' in event['requestContext']:
        claims = event['requestContext']['authorizer']['claims']
        to_email = claims.get('email')

    itinerary = select_itinerary_by_id(itinerary_id,to_email)
    
    destination = itinerary['destination']
    days = itinerary['days']
    budget = itinerary['budget']
    current_itinerary = itinerary['itinerary']

    prompt = f"""
    Current itinerary:
    {current_itinerary}

    Update the itinerary for a trip to {destination} for {days} days with a budget of {budget}.
    """
    if themes:
        prompt += f"The themes for this trip are: {', '.join(themes)}. "
    prompt += f"Please incorporate the following changes: {edit_prompt}"
    prompt += """
    
    Please provide the updated itinerary in the following format:
    Day X:
    Morning: [Morning activity]
    Lunch: [Lunch recommendation]
    Afternoon: [Afternoon activity]
    Dinner: [Dinner recommendation]
    Evening: [Evening activity]
    Costs: [Estimated costs for the day, if applicable]

    Ensure each section is on a new line and follows this exact structure for each day.
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
        add_itinerary_to_user(to_email, content, destination, days, budget,themes,edit_prompt)
       
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