import json
import psycopg2
import os
from lambda_decorators import json_http_resp, cors_headers , load_json_body
import boto3


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

    if not email:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Email is required'}),
            'headers': {    
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT status FROM users WHERE email = %s", (email,))   
            user = cur.fetchone()
            if user:
                if user[0] != 'pre':
                    return {'is_pro': True}
                else:
                    return {'is_pro': False}
            else:
                return {'is_pro': False}
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return {'is_pro': False}
    finally:
        conn.close()


