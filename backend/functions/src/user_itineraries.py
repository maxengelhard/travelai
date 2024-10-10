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
        # List all itineraries for the user
        itineraries = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=f'itineraries/{email}/')
        
        itinerary_list = []
        if 'Contents' in itineraries:
            for item in itineraries['Contents']:
                response = s3.get_object(Bucket=BUCKET_NAME, Key=item['Key'])
                itinerary_data = json.loads(response['Body'].read().decode('utf-8'))
                itinerary_list.append(itinerary_data)
        
        # Sort itineraries by created_at in descending order
        itinerary_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'body': itinerary_list,
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





### OLD RDS CODE
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
#             cur.execute("""
#                 SELECT 
#                     i.id,
#                     i.destination,
#                     i.days,
#                     i.budget,
#                     i.itinerary_order AS itinerary_id,
#                     i.themes,
#                     i.prompt,
#                     i.created_at AS itinerary_created_at,
#                     i.start_date,
#                     i.end_date
#                 FROM itinerarys i
#                 WHERE i.email = %s
#                 ORDER BY i.created_at DESC
#             """, (email,))   
#             columns = [desc[0] for desc in cur.description]
#             results = cur.fetchall()

#             print(results)
            
#             itineraries = []
#             if results:
#                 for result in results:
#                     itinerary = dict(zip(columns, result))
#                     for key, value in itinerary.items():
#                         if isinstance(value, datetime):
#                             itinerary[key] = value.isoformat()
#                         elif key == 'themes' and value is not None:
#                             itinerary[key] = list(value)  # Convert array to list
#                     itineraries.append(itinerary)
            
#             return {
#                 'statusCode': 200,
#                 'body': itineraries,
#                 'headers': {
#                     'Content-Type': 'application/json',
#                     'Access-Control-Allow-Origin': '*'
#                 }
#             }
            
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