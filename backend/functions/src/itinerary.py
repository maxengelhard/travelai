import json
import psycopg2
import os
from openai import OpenAI
from lambda_decorators import json_http_resp, cors_headers , load_json_body
from trip_journey_email import send_itinerary_email

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
                "INSERT INTO users (email, status, initial_itinerary, destination, days, budget) VALUES (%s, %s, %s, %s, %s, %s)",
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
                "UPDATE users SET initial_itinerary = %s WHERE email = %s",
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
    Include the following for each day:
    1. Morning activity
    2. Lunch recommendation
    3. Afternoon activity
    4. Dinner recommendation
    5. Evening activity (if applicable)
    """
    
    if budget:
        prompt += "6. Estimated costs for activities and meals\n"
    
    prompt += """
    Please format the itinerary in a clear, day-by-day structure.
    """
    
    if not destination:
        prompt += "If no specific destination is provided, suggest a popular travel destination and create an itinerary for it. "
    if not days:
        prompt += "If no specific duration is provided, create a 3-day itinerary. "
    if not budget:
        prompt += "If no budget is specified, assume a moderate budget. "

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7,
        )
        itinerary = response.choices[0].message.content.strip()
            
        print(itinerary)
        update_user_itinerary(to_email, itinerary)
        # Send the email
        email_sent = send_itinerary_email(to_email, itinerary, destination, days, budget)

        if email_sent:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Itinerary generated and sent to your email successfully!',
                    'itinerary': itinerary
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