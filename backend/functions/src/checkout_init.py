import json
import boto3
import os
from openai import OpenAI
from lambda_decorators import json_http_resp, cors_headers, load_json_body

s3 = boto3.client('s3')
BUCKET_NAME = os.environ['S3_DB']

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

    try:
        # Check if the user exists
        try:
            response = s3.get_object(Bucket=BUCKET_NAME, Key=f'users/{email}.json')
            user_data = json.loads(response['Body'].read().decode('utf-8'))
        except s3.exceptions.NoSuchKey:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'User not found'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }

        # Update the user data
        user_data['checkout_init'] = True
        
        # Save the updated user data
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=f'users/{email}.json',
            Body=json.dumps(user_data),
            ContentType='application/json'
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Checkout initialized successfully'}),
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

if __name__ == "__main__":
    result = lambda_handler({"body": {"email": "maxvengelhard@gmail.com"}}, None)
    print(result)








# OLD RDS CODE
# import json
# import psycopg2
# import os
# from openai import OpenAI
# from lambda_decorators import json_http_resp, cors_headers , load_json_body

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


# @cors_headers
# @load_json_body
# @json_http_resp
# def lambda_handler(event, context):
#     body = event.get('body', {})
#     email = body.get('email')

#     # Check if the email exists in the database
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute("SELECT * FROM users WHERE email = %s", (email,))
#             user = cur.fetchone()
#             if user is None:
#                 return {
#                     'statusCode': 404,
#                     'body': json.dumps({'error': 'User not found'}),
#                     'headers': {
#                         'Content-Type': 'application/json',
#                         'Access-Control-Allow-Origin': '*'
#                     }
#                 }
#             else:
#                 # Store the checkout ID in the database
#                 cur.execute("UPDATE users SET checkout_init = %s WHERE email = %s", (True, email))
#                 conn.commit()
#                 # Return the checkout ID to the frontend
#                 return {
#                     'statusCode': 200,
#                     'body': 'success',
#                     'headers': {
#                         'Content-Type': 'application/json',
#                         'Access-Control-Allow-Origin': '*'
#                     }
#                 }
#     except Exception as e:
#         return {
#             'statusCode': 500,
#             'body': json.dumps({'error': str(e)}),
#             'headers': {
#                 'Content-Type': 'application/json',
#                 'Access-Control-Allow-Origin': '*'
#             }
#         }
#     finally:
#         conn.close()

# if __name__ == "__main__":
#     result = lambda_handler({"body": {"email": "maxvengelhard@gmail.com"}}, None)
#     print(result)