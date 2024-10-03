import os
import psycopg2
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError

# Database configuration
DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': 5432
}

# AWS SES configuration
AWS_REGION = os.environ['AWS_REGION']
SENDER = os.environ['SENDER_EMAIL']
CHARSET = "UTF-8"

STRIPE_SIGNUP_URL = os.environ['STRIPE_SIGNUP_URL']
DISCOUNT_CODE = 'SIGNUP20'

sender_creds = {
    'email': 'tripjourneyai@gmail.com',
    'password': os.getenv('EMAIL_PASSWORD'),
    'name': "Trip Journey AI"
}

def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(**DB_PARAMS)

def send_promo_email(user_email):
    subject = "Don't miss out! 20% off when you sign up now"
    body_text = f"""
    Hello,

    We noticed you haven't completed your signup. Don't miss out on our amazing service!

    Sign up now and get 20% off with the code: {DISCOUNT_CODE}

    Click here to complete your signup: {STRIPE_SIGNUP_URL}?discount={DISCOUNT_CODE}

    Best regards,
    Trip Journey AI
    """

    body_html = f"""
    <html>
    <body>
    <p>Hello,</p>
    <p>We noticed you haven't completed your signup. Don't miss out on our amazing service!</p>
    <p>Sign up now and get 20% off with the code: <strong>{DISCOUNT_CODE}</strong></p>
    <p><a href="{STRIPE_SIGNUP_URL}?discount={DISCOUNT_CODE}">Click here to complete your signup</a></p>
    <p>Best regards,<br>Trip Journey AI</p>
    </body>
    </html>
    """

    client = boto3.client('ses', region_name=AWS_REGION)

    try:
        response = client.send_email(
            Destination={'ToAddresses': [user_email]},
            Message={
                'Body': {
                    'Html': {'Charset': CHARSET, 'Data': body_html},
                    'Text': {'Charset': CHARSET, 'Data': body_text},
                },
                'Subject': {'Charset': CHARSET, 'Data': subject},
            },
            Source=SENDER
        )
    except ClientError as e:
        print(f"An error occurred: {e.response['Error']['Message']}")
    else:
        print(f"Email sent to {user_email}! Message ID: {response['MessageId']}")

def check_and_send_promo():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        fifteen_minutes_ago = datetime.utcnow() - timedelta(minutes=15)
        query = """
        SELECT email FROM users
        WHERE email IS NOT NULL
        AND stripe_customer_id IS NULL
        AND promo_emails_sent < 1
        AND created_at <= %s
        """
        cur.execute(query, (fifteen_minutes_ago,))
        users_to_email = cur.fetchall()

        for (user_email,) in users_to_email:
            send_promo_email(user_email)
            update_query = """
            UPDATE users
            SET promo_emails_sent = promo_emails_sent + 1
            WHERE email = %s
            """
            cur.execute(update_query, (user_email,))
            print(f"Sent promo email to {user_email}")

        conn.commit()
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def lambda_handler(event, context):
    check_and_send_promo()
    return {
        'statusCode': 200,
        'body': 'Promo email check completed'
    }