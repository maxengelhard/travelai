import os
import psycopg2
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import stripe

# Database configuration
DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': 5432
}

sender_creds = {
            'email': 'tripjourneyai@gmail.com',
            'password': os.getenv('EMAIL_PASSWORD'),
            'name': "Trip Journey AI"
        }


# SMTP configuration
smtp_server = "smtp.gmail.com"
smtp_port = 587
sender_email = sender_creds['email']  # email
sender_password = sender_creds['password']
sender_name = sender_creds['name']

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(**DB_PARAMS)

def create_promo_code():
    try:
        coupon = stripe.Coupon.create(
            percent_off=20,
            duration="once",
            max_redemptions=1,
            redeem_by=int((datetime.now() + timedelta(hours=24)).timestamp())
        )
        
        promo_code = stripe.PromotionCode.create(
            coupon=coupon.id,
            code=f"SIGNUP{datetime.now().strftime('%Y%m%d%H%M%S')}",
            max_redemptions=1
        )
        
        return promo_code.code
    except stripe.error.StripeError as e:
        print(f"An error occurred while creating the promo code: {str(e)}")
        return None

def send_promo_email(user_email,promo_code):
    subject = "You didn't complete your Trip Journey AI signup"
    body_text = f"""
    Hi!

    You tried to sign up to Trip Journey AI about an hour ago. Not sure what happened but you didn't complete.

    If you'd still like to become a member, I've given you 20% off on any plan when you sign up in the next 24 hours:

    https://tripjourney.co/?showPricing=true&prefilled_email={user_email}&prefilled_promo_code={promo_code}

    This is the last email I'll ever send (unless you sign up of course).

    -Trip Journey AI
    """

    body_html = f"""
    <html>
    <body>
    <p>Hi!</p>
    <p>You tried to sign up to Trip Journey AI 15 minutes ago. Not sure what happened but you didn't complete.</p>
    <p>If you'd still like to become a member, I've given you 20% off on any plan when you sign up in the next 24 hours:</p>
    <p><a href="https://tripjourney.co/?showPricing=true&prefilled_email={user_email}&prefilled_promo_code={promo_code}">Click here to complete your signup with 20% off</a></p>
    <p>This is the last email I'll ever send (unless you sign up of course).</p>
    <p>-Trip Journey AI</p>
    </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = sender_creds['email']
    msg['To'] = user_email

    part1 = MIMEText(body_text, 'plain')
    part2 = MIMEText(body_html, 'html')

    msg.attach(part1)
    msg.attach(part2)

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, user_email, msg.as_string())
        print(f"Email sent to {user_email}!")
    except Exception as e:
        print(f"An error occurred while sending email to {user_email}: {str(e)}")

def check_and_send_promo():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        hour_ago = datetime.utcnow() - timedelta(minutes=1)
        query = """
        SELECT email FROM users
        WHERE email IS NOT NULL
        AND stripe_customer_id IS NULL
        AND checkout_init = TRUE
        AND promo_emails_sent < 1
        AND created_at <= %s
        """
        cur.execute(query, (hour_ago,))
        users_to_email = cur.fetchall()

        print(users_to_email)

        for (user_email,) in users_to_email:
            promo_code = create_promo_code()

            if promo_code:
                send_promo_email(user_email, promo_code)
                update_query = """
                UPDATE users
                SET promo_emails_sent = promo_emails_sent + 1
                WHERE email = %s
                """
                cur.execute(update_query, (user_email,))
                print(f"Sent promo email to {user_email} with code {promo_code}")
            else:
                print(f"Failed to create promo code for {user_email}")


        conn.commit()
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def lambda_handler(event, context):
    print(event)
    check_and_send_promo()
    return {
        'statusCode': 200,
        'body': 'Promo email check completed'
    }