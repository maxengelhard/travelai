import json
import boto3
import os
from lambda_decorators import json_http_resp, cors_headers, load_json_body
from datetime import datetime

s3 = boto3.client('s3')
BUCKET_NAME = os.environ['S3_DB']

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    if 'requestContext' in event and 'authorizer' in event['requestContext']:
        claims = event['requestContext']['authorizer']['claims']
        email = claims.get('email')

    if not email:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Email is required'}),
            'headers': {    
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }

    try:
        # Get user data
        user_response = s3.get_object(Bucket=BUCKET_NAME, Key=f'users/{email}.json')
        user_data = json.loads(user_response['Body'].read().decode('utf-8'))

        return {
            'statusCode': 200,
            'body': user_data,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except s3.exceptions.NoSuchKey:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'User not found'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An error occurred'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }









# # OLD RDS CODE
# import json
# import psycopg2
# import os
# from lambda_decorators import json_http_resp, cors_headers, load_json_body
# from datetime import datetime

# DB_PARAMS = {
#     'dbname': os.getenv('DB_NAME'),
#     'user': os.getenv('DB_USER'),
#     'password': os.getenv('DB_PASSWORD'),
#     'host': os.getenv('DB_HOST'),
#     'port': 5432
# }

# def get_db_connection():
#     """Create a database connection."""
#     return psycopg2.connect(**DB_PARAMS)

# def json_serial(obj):
#     """JSON serializer for objects not serializable by default json code"""
#     if isinstance(obj, datetime):
#         return obj.isoformat()
#     raise TypeError ("Type %s not serializable" % type(obj))

# @cors_headers
# @load_json_body
# @json_http_resp
# def lambda_handler(event, context):
#     print(event)
#     query_strings = event.get('queryStringParameters', {})
#     itinerary_id = query_strings.get('itinerary_id') if query_strings else None
#     if 'requestContext' in event and 'authorizer' in event['requestContext']:
#         claims = event['requestContext']['authorizer']['claims']
#         email = claims.get('email')

#     if not email:
#         return {
#             'statusCode': 400,
#             'body': json.dumps({'error': 'Email is required'}),
#             'headers': {    
#                 'Content-Type': 'application/json',
#                 'Access-Control-Allow-Origin': '*'
#             }
#         }

#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             if itinerary_id and itinerary_id.lower() != 'undefined' and itinerary_id.isdigit():
#                 query = """
#                     SELECT 
#                         u.email,
#                         u.credits,
#                         i.id,
#                         i.destination,
#                         i.days,
#                         i.budget,
#                         i.itinerary_order AS itinerary_id,
#                         i.themes,
#                         i.prompt,
#                         i.created_at AS itinerary_created_at,
#                         i.itinerary
#                     FROM users u
#                     LEFT JOIN itinerarys i ON u.email = i.email
#                     WHERE u.email = %s AND i.itinerary_order = %s
#                     LIMIT 1
#                 """
#                 cur.execute(query, (event['requestContext']['authorizer']['claims']['email'], itinerary_id))
#             else:
#                 query = """
#                     SELECT 
#                         u.email,
#                         u.credits,
#                         i.id,
#                         i.destination,
#                         i.days,
#                         i.budget,
#                         i.itinerary_order itinerary_id,
#                         i.themes,
#                         i.prompt,
#                         i.created_at AS itinerary_created_at,
#                         i.itinerary
#                     FROM users u
#                     LEFT JOIN itinerarys i ON u.email = i.email
#                     WHERE u.email = %s
#                     ORDER BY i.created_at DESC
#                     LIMIT 1
#                 """
#                 cur.execute(query, (event['requestContext']['authorizer']['claims']['email'],))  
#             columns = [desc[0] for desc in cur.description]
#             result = cur.fetchone()
#             if result:
#                 user_dict = dict(zip(columns, result))
#                 for key, value in user_dict.items():
#                     if isinstance(value, datetime):
#                         user_dict[key] = value.isoformat()
#                 return {
#                     'statusCode': 200,
#                     'body': user_dict,
#                     'headers': {
#                         'Content-Type': 'application/json',
#                         'Access-Control-Allow-Origin': '*'
#                     }
#                 }
#             else:
#                 return {
#                     'statusCode': 404,
#                     'body': json.dumps({'error': 'User not found'}),
#                     'headers': {
#                         'Content-Type': 'application/json',
#                         'Access-Control-Allow-Origin': '*'
#                     }
#                 }
#     except psycopg2.Error as e:
#         print(f"Database error: {e}")
#         return {
#             'statusCode': 500,
#             'body': json.dumps({'error': 'Database error occurred'}),
#             'headers': {
#                 'Content-Type': 'application/json',
#                 'Access-Control-Allow-Origin': '*'
#             }
#         }
#     finally:
#         conn.close()