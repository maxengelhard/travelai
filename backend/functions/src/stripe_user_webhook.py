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

def create_cognito_user(email, temp_password, plan_type):
    """Create a user in Cognito with plan type."""
    try:
        response = cognito_client.admin_create_user(
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
        print(f"Cognito user created for email: {email} with plan: {plan_type}")
        return True
    except cognito_client.exceptions.UsernameExistsException:
        print(f"User already exists in Cognito: {email}")
        return False
    except Exception as e:
        print(f"Error creating Cognito user: {str(e)}")
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
    """Main Lambda handler function."""
    try:
        # Parse the incoming JSON from API Gateway
        body = json.loads(event['body'])
        email = body.get('email')
        initial_itinerary = body.get('initial_itinerary')
        plan_type = body.get('plan_type', 'free')  # Default to 'free' if not provided

        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email is required'})
            }

        # Generate temporary password
        temp_password = generate_temp_password()

        # Create user in Cognito with plan type
        cognito_success = create_cognito_user(email, temp_password, plan_type)
        if not cognito_success:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Failed to create user account or user already exists'})
            }

        # Add user to database with plan type
        db_success = update_user_plan(email, plan_type, initial_itinerary)
        if not db_success:
            # TODO: Consider deleting the Cognito user if database insertion fails
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Failed to add user to database'})
            }

        # Send login email
        email_sent = send_login_email(email, temp_password)
        if not email_sent:
            # TODO: Consider how to handle this scenario (e.g., retry logic, manual intervention)
            print(f"Warning: Failed to send login email to {email}")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User created successfully. Check your email for login instructions.'})
        }

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An unexpected error occurred'})
        }