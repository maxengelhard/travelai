import json
import psycopg2
import os
from openai import OpenAI
from lambda_decorators import json_http_resp, cors_headers , load_json_body

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


@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    body = event.get('body', {})
    email = body.get('email')

    # Check if the email exists in the database
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
            if user is None:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'User not found'}),
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            else:
                # Store the checkout ID in the database
                cur.execute("UPDATE users SET checkout_id = %s WHERE email = %s", (True, email))
                conn.commit()
                # Return the checkout ID to the frontend
                return {
                    'statusCode': 200,
                    'body': 'success',
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
    finally:
        conn.close()

if __name__ == "__main__":
    result = lambda_handler({"body": {"email": "maxvengelhard@gmail.com"}}, None)
    print(result)