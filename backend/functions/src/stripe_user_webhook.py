import stripe
import json
import string
import random
import os
import psycopg2
from psycopg2 import sql
from datetime import datetime, timedelta
import os
import boto3
from botocore.exceptions import ClientError

stripe.api_key = os.environ['STRIPE_SECRET_KEY']
cognito_client = boto3.client('cognito-idp')
ses_client = boto3.client('ses')
USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
SES_SENDER_EMAIL = 'tripjourneyai@gmail.com'
LOGIN_URL = 'appdev.tripjourney.co'  # URL where users can log in

DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': 5432
}


def generate_temp_password(length=12):
    """Generate a temporary password."""
    characters = string.ascii_letters + string.digits + "!@#$%^&*()_+-="
    return ''.join(random.choice(characters) for i in range(length))

def send_login_email(email, temp_password):
    """Send an email with login instructions."""
    SUBJECT = "Your Account Has Been Created"
    BODY_TEXT = (f"Welcome to our service!\r\n\n"
                 f"Your account has been created with the following credentials:\r\n"
                 f"Email: {email}\r\n"
                 f"Temporary Password: {temp_password}\r\n\n"
                 f"Please log in at {LOGIN_URL} and change your password as soon as possible.\r\n"
                 "For security reasons, this temporary password will expire in 7 days.")
    BODY_HTML = f"""<html>
    <head></head>
    <body>
      <h1>Welcome to our service!</h1>
      <p>Your account has been created with the following credentials:</p>
      <ul>
        <li>Email: {email}</li>
        <li>Temporary Password: {temp_password}</li>
      </ul>
      <p>Please <a href="{LOGIN_URL}">log in</a> and change your password as soon as possible.</p>
      <p>For security reasons, this temporary password will expire in 7 days.</p>
    </body>
    </html>
    """

    try:
        response = ses_client.send_email(
            Destination={'ToAddresses': [email]},
            Message={
                'Body': {
                    'Html': {'Charset': "UTF-8", 'Data': BODY_HTML},
                    'Text': {'Charset': "UTF-8", 'Data': BODY_TEXT},
                },
                'Subject': {'Charset': "UTF-8", 'Data': SUBJECT},
            },
            Source=SES_SENDER_EMAIL
        )
    except ClientError as e:
        print(f"An error occurred: {e.response['Error']['Message']}")
        return False
    else:
        print(f"Email sent! Message ID: {response['MessageId']}")
        return True

def create_or_update_cognito_user(email, plan_type):
    """Create or update a user in Cognito with the given plan type."""
    try:
        # Check if the user already exists
        try:
            user = cognito_client.admin_get_user(
                UserPoolId=USER_POOL_ID,
                Username=email
            )
            # User exists, update attributes
            cognito_client.admin_update_user_attributes(
                UserPoolId=USER_POOL_ID,
                Username=email,
                UserAttributes=[
                    {'Name': 'custom:plan_type', 'Value': plan_type},
                    {'Name': 'custom:is_pro', 'Value': str(plan_type != 'free').lower()}
                ]
            )
        except cognito_client.exceptions.UserNotFoundException:
            # User doesn't exist, create new user
            temp_password = generate_temp_password()
            cognito_client.admin_create_user(
                UserPoolId=USER_POOL_ID,
                Username=email,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'email_verified', 'Value': 'true'},
                    {'Name': 'custom:plan_type', 'Value': plan_type},
                    {'Name': 'custom:is_pro', 'Value': str(plan_type != 'free').lower()}
                ],
                TemporaryPassword=temp_password,
                MessageAction='SUPPRESS'
            )
            # Send login email with temporary password
            send_login_email(email, temp_password)
        
        return True
    except Exception as e:
        print(f"Error creating or updating Cognito user: {str(e)}")
        return False


def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(**DB_PARAMS)

def update_user_plan(stripe_customer_id, plan_type, email, duration_months=1):
    """
    Update user's plan information in the database.
    
    :param stripe_customer_id: Stripe customer ID
    :param plan_type: New plan type ('starter', 'pro', 'jet_setter', etc.)
    :param email: User's email address
    :param duration_months: Duration of the plan in months (default 1)
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Check if the user exists
            cur.execute(
                "SELECT email FROM users WHERE email = %s",
                (email,)
            )
            result = cur.fetchone()
            
            if result:
                # User exists, update their plan and stripe_customer_id
                plan_start_date = datetime.now()
                plan_end_date = plan_start_date + timedelta(days=30*duration_months)
                
                cur.execute(
                    sql.SQL("""
                    UPDATE users
                    SET plan_type = %s,
                        is_pro = %s,
                        plan_start_date = %s,
                        plan_end_date = %s,
                        stripe_customer_id = %s
                    WHERE email = %s
                    """),
                    (plan_type, plan_type != 'free', plan_start_date, plan_end_date, stripe_customer_id, email)
                )
            else:
                # User doesn't exist, create a new user
                plan_start_date = datetime.now()
                plan_end_date = plan_start_date + timedelta(days=30*duration_months)
                
                cur.execute(
                    sql.SQL("""
                    INSERT INTO users (email, plan_type, is_pro, plan_start_date, plan_end_date, stripe_customer_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """),
                    (email, plan_type, plan_type != 'free', plan_start_date, plan_end_date, stripe_customer_id)
                )
            
            conn.commit()
            print(f"Updated plan for user {email} to {plan_type} with Stripe customer ID: {stripe_customer_id}")
            return True
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return False
    finally:
        conn.close()


def lambda_handler(event, context):
    print(event)  # Log the entire event for debugging
    try:
        # Parse the Stripe webhook event
        stripe_event = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
        
        # Check if it's a checkout.session.completed event
        if stripe_event['type'] != 'checkout.session.completed':
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Unsupported event type'})
            }
        
        # Extract customer details from the event
        session = stripe_event['data']['object']
        customer_details = session.get('customer_details', {})
        email = customer_details.get('email')
        
        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email not found in the event data'})
            }
        
        # Determine the plan type based on the amount paid or other criteria
        amount_total = session.get('amount_total', 0)
        plan_type = 'pro' if amount_total >= 2000 else 'free'  # Adjust this logic as needed
        
        # Get the Stripe customer ID
        stripe_customer_id = session.get('customer')
        if not stripe_customer_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Stripe customer ID not found in the event data'})
            }
        
        # Update user's plan in the database
        db_success = update_user_plan(stripe_customer_id, plan_type, email)
        if not db_success:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Failed to update user plan in database'})
            }
        
        # If this is a new user, create them in Cognito
        cognito_success = create_or_update_cognito_user(email, plan_type)
        if not cognito_success:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Failed to create or update user account in Cognito'})
            }
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User plan updated successfully.'})
        }
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An unexpected error occurred'})
        }