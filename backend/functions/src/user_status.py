import json
import psycopg2
import os
from lambda_decorators import json_http_resp, cors_headers, load_json_body
from datetime import datetime

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

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

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
            cur.execute("""
                SELECT 
                    u.id AS user_id,
                    u.email AS user_email,
                    u.status,
                    u.credits,
                    u.created_at AS user_created_at,
                    u.plan_type,
                    u.is_pro,
                    u.stripe_customer_id,
                    i.id AS itinerary_id,
                    i.itinerary,
                    i.destination,
                    i.days,
                    i.budget,
                    i.itinerary_order,
                    i.created_at AS itinerary_created_at
                FROM users u
                INNER JOIN itinerarys i ON u.email = i.email
                WHERE u.email = %s
                ORDER BY i.created_at DESC
                LIMIT 1
            """, (email,))   
            columns = [desc[0] for desc in cur.description]
            result = cur.fetchone()
            if result:
                user_dict = dict(zip(columns, result))
                for key, value in user_dict.items():
                    if isinstance(value, datetime):
                        user_dict[key] = value.isoformat()
                return {
                    'statusCode': 200,
                    'body': user_dict,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'User not found'}),
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Database error occurred'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    finally:
        conn.close()