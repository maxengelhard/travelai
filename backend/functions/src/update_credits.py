import json
import os
import boto3
from datetime import datetime, timedelta
import pytz

s3 = boto3.client('s3')
BUCKET_NAME = os.environ['S3_DB']

def update_credits():
    today = datetime.now(pytz.utc)
    monthly_users_updated = 0
    yearly_users_updated = 0

    # List all user files
    response = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix='users/')

    for obj in response.get('Contents', []):
        key = obj['Key']
        response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
        user_data = json.loads(response['Body'].read().decode('utf-8'))

        created_at = datetime.fromisoformat(user_data.get('created_at', today.isoformat()))
        last_credit_update = datetime.fromisoformat(user_data.get('last_credit_update', '2000-01-01T00:00:00+00:00'))

        if user_data.get('is_yearly'):
            if created_at.timetuple().tm_yday == today.timetuple().tm_yday and last_credit_update < today - timedelta(days=365):
                if user_data.get('plan_type') == 'pro':
                    user_data['credits'] = user_data.get('credits', 0) + 12000
                elif user_data.get('plan_type') == 'jet_setter':
                    user_data['credits'] = user_data.get('credits', 0) + 240000
                user_data['last_credit_update'] = today.isoformat()
                yearly_users_updated += 1
        else:
            if (created_at.day == today.day or (created_at.day >= 29 and today.day == 1)) and last_credit_update < today.replace(day=1):
                if user_data.get('plan_type') == 'pro':
                    user_data['credits'] = user_data.get('credits', 0) + 1000
                elif user_data.get('plan_type') == 'jet_setter':
                    user_data['credits'] = user_data.get('credits', 0) + 20000
                user_data['last_credit_update'] = today.isoformat()
                monthly_users_updated += 1

        # Save updated user data
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=json.dumps(user_data),
            ContentType='application/json'
        )

    return {
        'monthly_users_updated': monthly_users_updated,
        'yearly_users_updated': yearly_users_updated,
        'timestamp': today.isoformat()
    }

def lambda_handler(event, context):
    result = update_credits()
    
    return {
        'statusCode': 200,
        'body': json.dumps(result),
        'headers': {
            'Content-Type': 'application/json'
        }
    }















############################## RDS OLD CODE
# import json
# import psycopg2
# import os
# from datetime import datetime, timedelta
# import pytz

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

# def update_credits():
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cur:
#             today = datetime.now(pytz.utc)
            
#             # Update monthly subscribers
#             cur.execute("""
#                 UPDATE users
#                 SET credits = CASE
#                     WHEN plan_type = 'pro' THEN credits + 1000
#                     WHEN plan_type = 'jet_setter' THEN credits + 20000
#                     ELSE credits
#                 END,
#                 last_credit_update = %s
#                 WHERE NOT is_yearly
#                 AND (
#                     (EXTRACT(DAY FROM created_at) = %s)
#                     OR (EXTRACT(DAY FROM created_at) >= 29 AND %s = 1)
#                 )
#                 AND (last_credit_update IS NULL OR last_credit_update < %s)
#             """, (today, today.day, today.day, today.replace(day=1)))

#             monthly_users_updated = cur.rowcount

#             # Update yearly subscribers
#             cur.execute("""
#                 UPDATE users
#                 SET credits = CASE
#                     WHEN plan_type = 'pro' THEN credits + 12000
#                     WHEN plan_type = 'jet_setter' THEN credits + 240000
#                     ELSE credits
#                 END,
#                 last_credit_update = %s
#                 WHERE is_yearly
#                 AND EXTRACT(DOY FROM created_at) = EXTRACT(DOY FROM %s)
#                 AND (last_credit_update IS NULL OR last_credit_update < %s - INTERVAL '1 year')
#             """, (today, today, today))

#             yearly_users_updated = cur.rowcount

#             conn.commit()

#             return {
#                 'monthly_users_updated': monthly_users_updated,
#                 'yearly_users_updated': yearly_users_updated,
#                 'timestamp': today.isoformat()
#             }
#     except psycopg2.Error as e:
#         conn.rollback()
#         print(f"Database error: {e}")
#         return {'error': str(e)}
#     finally:
#         conn.close()

# def lambda_handler(event, context):
#     result = update_credits()
    
#     return {
#         'statusCode': 200 if 'error' not in result else 500,
#         'body': json.dumps(result),
#         'headers': {
#             'Content-Type': 'application/json'
#         }
#     }

# if __name__ == "__main__":
#     print(lambda_handler({}, None))