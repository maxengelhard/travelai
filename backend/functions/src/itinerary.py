import json
import psycopg2
import os
from openai import OpenAI
from lambda_decorators import json_http_resp, cors_headers , load_json_body
from trip_journey_email import send_itinerary_email
import re
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

def check_and_add_email(email, destination, days, budget, initial_itinerary=None):
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
                "INSERT INTO users (email, status, itinerary, destination, days, budget) VALUES (%s, %s, %s, %s, %s, %s)",
                (email, 'pre', initial_itinerary, destination, days, budget)
            )
            conn.commit()
            return {'success': True, 'message': 'Email added successfully'}
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success': False, 'message': 'An error occurred'}
    finally:
        conn.close()

def update_user_itinerary(email, itinerary):
    """Update the user's initial itinerary."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET itinerary = %s WHERE email = %s",
                (itinerary, email)
            )
            conn.commit()
            return {'success': True, 'message': 'Itinerary updated successfully'}
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'success': False, 'message': 'An error occurred'}
    finally:
        conn.close()


def parse_raw_itinerary(raw_itinerary, days):
    formatted_itinerary = {}
    for i in range(1, int(days) + 1):
        day_key = f"Day {i}"
        formatted_itinerary[day_key] = {
            "Morning": "",
            "Lunch": "",
            "Afternoon": "",
            "Dinner": "",
            "Evening": "",
            "Costs": ""
        }
    
    current_day = None
    for line in raw_itinerary.split('\n'):
        day_match = re.match(r'Day (\d+):', line)
        if day_match:
            current_day = f"Day {day_match.group(1)}"
            continue
        
        if current_day and current_day in formatted_itinerary:
            for key in formatted_itinerary[current_day]:
                if line.lower().startswith(key.lower()):
                    formatted_itinerary[current_day][key] = line.split(':', 1)[1].strip()
    
    return formatted_itinerary

@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    # Parse the incoming JSON from API Gateway
    body = event.get('body', {})
    destination = body.get('destination', '')
    days = body.get('days', '')
    budget = body.get('budget', '')
    to_email = body.get('email')

    psql_res = check_and_add_email(to_email, destination, days, budget)

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
    Lunch: [Lunch recommendation]
    Afternoon: [Afternoon activity]
    Dinner: [Dinner recommendation]
    Evening: [Evening activity or 'No specific evening activity planned']
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
        print(response.choices[0].message.content.strip())

        raw_itinerary = response.choices[0].message.content.strip()
        formatted_itinerary = parse_raw_itinerary(raw_itinerary, days or 3)
        print(json.dumps(formatted_itinerary, indent=2))

        update_user_itinerary(to_email, json.dumps(formatted_itinerary))
        # Send the email
        email_sent = send_itinerary_email(to_email, formatted_itinerary, destination, days, budget)

        if email_sent:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Itinerary generated and sent to your email successfully!',
                    'itinerary': formatted_itinerary
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

        # return {
        #     'statusCode': 200,
        #     'body': json.dumps({'itinerary': itinerary}),
        #     'headers': {
        #         'Content-Type': 'application/json',
        #         'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
        #     }
        # }
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
    result = lambda_handler({"body": {"destination": "Paris", "days": "3", "budget": "1000"}}, None)
    print(result)