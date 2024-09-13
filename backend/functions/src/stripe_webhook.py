import os
import json
import stripe
import psycopg2
import boto3
import psycopg2.extras
from botocore.exceptions import ClientError
import string
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
import boto3


# Create a new SES client
cognito_client = boto3.client('cognito-idp')
ses_client = boto3.client('ses')
USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
SES_SENDER_EMAIL = 'tripjourneyai@gmail.com'
LOGIN_URL = 'appdev.tripjourney.co'  # URL where users can log in

user = os.getenv('DB_USER')
host = os.getenv('DB_HOST')
password = os.getenv('DB_PASSWORD')
database = os.getenv('DB_NAME')

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')





# ---------------- Stripe Webhook Setup ----------------
def lambda_handler(event,context):
    payload = event['body']
    sig_header = event['headers']['Stripe-Signature']
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        raise e
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise e
    
    payload = json.loads(payload)
    print(payload)
    print(payload['type'])
    if payload['type'] == 'checkout.session.completed':
        payload_object = payload['data']['object'] 
        session_id = payload_object['id']
        customer = payload_object['customer']
        retrieve_response = stripe.checkout.Session.retrieve(
        session_id,
        expand=['total_details.breakdown']
        )
        total_details = retrieve_response['total_details']['breakdown']
        discounts = total_details.get('discounts',[])
        if len(discounts) > 0:
            discount = discounts[0]
            promo_code_id = discount['discount']['promotion_code']
        else:
            return {
                'statusCode': 200,
                'body': json.dumps('Done!')
            }
        ## if there is already a connection you don't need to set it up
        metadata = payload_object['metadata']
        if 'account_id' in metadata:
            return {
                'statusCode': 200,
                'body': json.dumps('Done!')
            }
        try:
            with psycopg2.connect(
                host=host,
                database=database,
                user=user,
                password=password,
                port="5432",
                sslmode='require') as conn:

                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    query = "SELECT account_id FROM sellers WHERE promo_code_id=%s"
                    cur.execute(query, (promo_code_id,))
                    result = cur.fetchone() or {}
                    account_id = result.get('account_id')
                    if account_id:
                        print('setting up connection')
                        stripe.Customer.modify(
                        customer,
                        metadata={"account_id": account_id},
                        )

                        insert_query = "INSERT INTO subscription_account_association (subscription_id, account_id) VALUES (%s, %s)"
                        subscription_id = retrieve_response['subscription']
                        cur.execute(insert_query, (subscription_id, account_id))
                        conn.commit()

                        amount_to_transfer = int(payload_object['amount_total'] * 0.30)
                        if amount_to_transfer > 0:
                            # Create a transfer to the connected account
                            print('transfering to account')
                            stripe.Transfer.create(
                                amount=amount_to_transfer,
                                currency=payload_object['currency'],
                                destination=account_id,
                                transfer_group=payload_object['invoice'],
                            )

        
        except (Exception,psycopg2.DatabaseError) as error:
            print(error)
    
    if payload['type'] == 'invoice.payment_succeeded':
        payload_object = payload['data']['object'] 
        invoice_id = payload_object['id']

        try:
            # Retrieve the invoice
            invoice = stripe.Invoice.retrieve(invoice_id)
            subscription_id = invoice.get('subscription')

            if subscription_id:
                # Database operation to find associated account
                with psycopg2.connect(
                    host=host,
                    database=database,
                    user=user,
                    password=password,
                    port="5432",
                    sslmode='require') as conn:

                    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                        # Query to find the associated account for this subscription
                        query = "SELECT account_id FROM subscription_account_association WHERE subscription_id=%s"
                        cur.execute(query, (subscription_id,))
                        result = cur.fetchone()

                        if result:
                            account_id = result.get('account_id')
                            if invoice['billing_reason'] == 'subscription_cycle':
                                # Check if this is the payment after the start
                                # Calculate 20% of the payment
                                amount_to_transfer = int(invoice['amount_paid'] * 0.30)
                                if amount_to_transfer > 0:
                                    # Create a transfer to the connected account
                                    print('transfering to account')
                                    stripe.Transfer.create(
                                        amount=amount_to_transfer,
                                        currency=invoice['currency'],
                                        destination=account_id,
                                        transfer_group=invoice_id,
                                    )
        except Exception as e:
            print(f"Error: {e}")

        

        
    if payload['type'] == 'customer.created':
        print(payload)
        session = payload['data']['object']
        customer_email = session['email']
        customer_name = session['name']
        stripe_customer = session['id']
        
        try:
            with psycopg2.connect(
                host=host,
                database=database,
                user=user,
                password=password,
                port="5432",
                sslmode='require') as conn:

                with conn.cursor() as cur:
                    query = "UPDATE users SET stripe_customer_id = %s WHERE email = %s"
                    params = (stripe_customer,customer_email )
                    cur.execute(query, params)
                    conn.commit()
                    print('com')


        except (Exception, psycopg2.DatabaseError) as error:
            print(error)

        try:
            temp_password = generate_temp_password()
            create_or_update_cognito_user(customer_email, 'pro',temp_password)
            send_login_email(customer_email, temp_password)
        except Exception as e:
            raise e

    if payload['type'] == 'customer.subscription.deleted':
        stripe_customer = payload['data']['object']['customer']

        try:
            with psycopg2.connect(
                host=host,
                database=database,
                user=user,
                password=password,
                port="5432",
                sslmode='require') as conn:

                with conn.cursor() as cur:
                    # First, query the activated_codes table to get the email and activation code
                    query = "SELECT code FROM ActivationCodes WHERE customer_id = %s"
                    params = (stripe_customer,)
                    cur.execute(query, params)
                    activation_code = cur.fetchone()
                    if activation_code:

                        # Delete from activated_codes based on customer_id
                        query = "DELETE FROM ActivationCodes WHERE customer_id = %s"
                        params = (stripe_customer,)
                        cur.execute(query, params)

                        # Delete from activated_users based on the fetched email or activation code
                        query = "DELETE FROM ActivatedUsers WHERE customer_id = %s"
                        params = (activation_code,)
                        cur.execute(query, params)

                        conn.commit()

        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
        
    return {
        'statusCode': 200,
        'body': json.dumps('Done!')
    }


def generate_temp_password(length=12):
    """Generate a temporary password."""
    characters = string.ascii_letters + string.digits + "!@#$%^&*()_+-="
    return ''.join(random.choice(characters) for i in range(length))

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
            print(f"Updated Cognito user attributes for {email}")
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
            print(f"Created new Cognito user for {email}")
            # Send login email with temporary password
            send_login_email(email, temp_password)
        
        return True
    except Exception as e:
        print(f"Error creating or updating Cognito user: {str(e)}")
        return False

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

    message = MIMEMultipart('alternative')
    message['Subject'] = Header(SUBJECT, 'utf-8')
    message['From'] = SES_SENDER_EMAIL
    message['To'] = email

    part1 = MIMEText(BODY_TEXT, 'plain', 'utf-8')
    part2 = MIMEText(BODY_HTML, 'html', 'utf-8')

    message.attach(part1)
    message.attach(part2)

    try:
        response = ses_client.send_raw_email(
            Source=SES_SENDER_EMAIL,
            Destinations=[email],
            RawMessage={
                'Data': message.as_string(),
            }
        )
    except ClientError as e:
        print(f"An error occurred: {e.response['Error']['Message']}")
        return False
    else:
        print(f"Email sent! Message ID: {response['MessageId']}")
        return True

