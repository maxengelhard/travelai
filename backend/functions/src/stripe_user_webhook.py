import stripe
import os
import psycopg2
from psycopg2 import sql
from datetime import datetime, timedelta
import os
import boto3

stripe.api_key = os.environ['STRIPE_SECRET_KEY']
cognito_client = boto3.client('cognito-idp')
USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')

DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': 5432
}

def update_cognito_user_attributes(email, plan_type):
    """
    Update user attributes in Cognito.
    
    :param email: User's email
    :param plan_type: New plan type
    """
    try:
        # First, we need to get the user's Cognito username
        user_response = cognito_client.list_users(
            UserPoolId=USER_POOL_ID,
            Filter=f'email = "{email}"'
        )
        
        if not user_response['Users']:
            print(f"No Cognito user found with email: {email}")
            return False
        
        username = user_response['Users'][0]['Username']
        
        # Now update the user's attributes
        cognito_client.admin_update_user_attributes(
            UserPoolId=USER_POOL_ID,
            Username=username,
            UserAttributes=[
                {
                    'Name': 'custom:plan_type',
                    'Value': plan_type
                },
                {
                    'Name': 'custom:is_pro',
                    'Value': str(plan_type != 'free').lower()
                }
            ]
        )
        print(f"Updated Cognito attributes for user {email}")
        return True
    except Exception as e:
        print(f"Error updating Cognito user attributes: {str(e)}")
        return False

def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(**DB_PARAMS)

def update_user_plan(stripe_customer_id, plan_type, duration_months=1):
    """
    Update user's plan information in the database.
    
    :param stripe_customer_id: Stripe customer ID
    :param plan_type: New plan type ('starter', 'pro', 'jet_setter', etc.)
    :param duration_months: Duration of the plan in months (default 1)
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Find the user by Stripe customer ID
            cur.execute(
                "SELECT email FROM users WHERE stripe_customer_id = %s",
                (stripe_customer_id,)
            )
            result = cur.fetchone()
            if not result:
                print(f"No user found with Stripe customer ID: {stripe_customer_id}")
                return False

            email = result[0]
            
            # Calculate plan dates
            plan_start_date = datetime.now()
            plan_end_date = plan_start_date + timedelta(days=30*duration_months)
            
            # Update user's plan information
            cur.execute(
                sql.SQL("""
                UPDATE users
                SET plan_type = %s,
                    is_pro = %s,
                    plan_start_date = %s,
                    plan_end_date = %s
                WHERE email = %s
                """),
                (plan_type, plan_type != 'free', plan_start_date, plan_end_date, email)
            )
            
            conn.commit()
            print(f"Updated plan for user {email} to {plan_type}")
            return True
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return False
    finally:
        conn.close()



def lambda_handler(event, context):
    payload = event['body']
    sig_header = event['headers']['Stripe-Signature']
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ['STRIPE_WEBHOOK_SECRET']
        )
    except ValueError as e:
        return {'statusCode': 400, 'body': 'Invalid payload'}
    except stripe.error.SignatureVerificationError as e:
        return {'statusCode': 400, 'body': 'Invalid signature'}

    if event['type'] == 'customer.subscription.created':
        customer_id = event['data']['object']['customer']
        plan = event['data']['object']['plan']['nickname']
        update_user_plan(customer_id, plan)

    return {'statusCode': 200, 'body': 'Webhook received'}