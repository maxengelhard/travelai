import json
import psycopg2
import os
from lambda_decorators import json_http_resp, cors_headers, load_json_body
from datetime import datetime
from openai import OpenAI

DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': 5432
}

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])

def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(**DB_PARAMS)

@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    body = event.get('body', {})
    itinerary_id = body.get('itinerary_id')
    new_themes = body.get('themes')
    new_prompt = body.get('prompt')
    start_date = body.get('start_date')
    end_date = body.get('end_date')
    
    if not itinerary_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Itinerary ID is required'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # First, get the existing itinerary
            cur.execute("""
                SELECT destination, days, budget, themes, prompt, itinerary
                FROM itinerarys
                WHERE id = %s
            """, (itinerary_id,))
            existing_itinerary = cur.fetchone()
            
            if not existing_itinerary:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'Itinerary not found'}),
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            
            destination, days, budget, themes, prompt, old_itinerary = existing_itinerary
            
            # Prepare the prompt for ChatGPT
            prompt_parts = [f"Update the following itinerary for a trip to {destination} for {days} days with a budget of ${budget}."]
            
            if new_themes:
                themes = new_themes
                prompt_parts.append(f"Include the following themes: {', '.join(themes)}.")
            elif themes:
                prompt_parts.append(f"Keep the existing themes: {', '.join(themes)}.")
            
            if new_prompt:
                prompt = new_prompt
                prompt_parts.append(f"Additional instructions: {prompt}")
            elif prompt:
                prompt_parts.append(f"Keep in mind the original instructions: {prompt}")
            
            prompt_parts.append("Here's the existing itinerary:")
            prompt_parts.append(old_itinerary)
            prompt_parts.append("""
            Please provide an updated itinerary in the following format for each day:
            Day X:
            Morning: [Morning activity]
            Lunch: [Lunch recommendation]
            Afternoon: [Afternoon activity]
            Dinner: [Dinner recommendation]
            Evening: [Evening activity]
            Costs: [Estimated costs for the day, if applicable]

            Ensure each section is on a new line and follows this exact structure.
            """)
            
            full_prompt = " ".join(prompt_parts)
            
            # Call ChatGPT API
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": full_prompt}],
                max_tokens=1000,
                temperature=0.7,
            )
            new_itinerary = response.choices[0].message.content
            
            # Update the database with the new itinerary
            update_query = """
                UPDATE itinerarys
                SET themes = COALESCE(%s, themes),
                    prompt = COALESCE(%s, prompt),
                    itinerary = %s
                WHERE id = %s
                RETURNING id, destination, days, budget, itinerary_order, themes, prompt, created_at, start_date, end_date, itinerary
            """
            cur.execute(update_query, (new_themes, new_prompt, new_itinerary, itinerary_id))
            updated_itinerary = cur.fetchone()
            
            # Get column names
            columns = [desc[0] for desc in cur.description]
            
            # Create a dictionary from the updated itinerary
            itinerary_dict = dict(zip(columns, updated_itinerary))
            
            # Convert datetime objects to ISO format strings
            for key, value in itinerary_dict.items():
                if isinstance(value, datetime):
                    itinerary_dict[key] = value.isoformat()
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'body': json.dumps(itinerary_dict),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An error occurred while updating the itinerary'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    finally:
        conn.close()