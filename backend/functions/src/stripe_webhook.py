import os
import json
import stripe
import psycopg2
import boto3
import psycopg2.extras
from botocore.exceptions import ClientError
import string
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr


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


sender_creds = {
            'email': 'tripjourneyai@gmail.com',
            'password': os.getenv('EMAIL_PASSWORD'),
            'name': "Trip Journey AI",
        }



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
        customer_id = payload_object['customer']
        description = payload_object['lines']['data'][0]['description'].lower()
        print('customer id:', customer_id)
        print('description:', description)
        
        plan_type = None
        is_pro = False
        is_yearly = False
        
        if 'pro' in description:
            plan_type = 'pro'
            is_pro = True
        elif 'jet setter' in description:
            plan_type = 'jet setter'
            is_pro = True
        
        if 'yearly' in description:
            is_yearly = True

        credits = 1000
        if plan_type == 'jet setter':
            credits = 20000

        if is_yearly:
            credits *= 12

        if plan_type:
            try:
                with psycopg2.connect(
                    host=host,
                    database=database,
                    user=user,
                    password=password,
                    port="5432",
                    sslmode='require') as conn:

                    with conn.cursor() as cur:
                        # Check if user exists
                        cur.execute("SELECT * FROM users WHERE stripe_customer_id = %s", (customer_id,))
                        update_user = cur.fetchone()
                        
                        if update_user is None:
                            # Fetch customer details from Stripe
                            stripe_customer = stripe.Customer.retrieve(customer_id)
                            email = stripe_customer.get('email', '')
                            
                            # Insert new user
                            insert_query = """
                            INSERT INTO users (email, status, stripe_customer_id, plan_type, is_pro, credits, is_yearly)
                            VALUES (%s, 'pre', %s, %s, %s, %s, %s)
                            """
                            cur.execute(insert_query, (email, customer_id, plan_type, is_pro, credits, is_yearly))
                            print(f"Inserted new user with plan {plan_type} for customer {customer_id}")
                        else:
                            # Update existing user
                            update_query = """
                            UPDATE users 
                            SET plan_type = %s, is_pro = %s, credits = %s, is_yearly = %s
                            WHERE stripe_customer_id = %s
                            """
                            cur.execute(update_query, (plan_type, is_pro, credits, is_yearly, customer_id))
                            print(f"Updated user plan to {plan_type} for customer {customer_id}")
                        
                        conn.commit()

            except (Exception, psycopg2.DatabaseError) as error:
                print(f"Error updating user plan: {error}")

        # try:
        #     # Retrieve the invoice
        #     invoice = stripe.Invoice.retrieve(invoice_id)
        #     subscription_id = invoice.get('subscription')

        #     if subscription_id:
        #         # Database operation to find associated account
        #         with psycopg2.connect(
        #             host=host,
        #             database=database,
        #             user=user,
        #             password=password,
        #             port="5432",
        #             sslmode='require') as conn:

        #             with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        #                 # Query to find the associated account for this subscription
        #                 query = "SELECT account_id FROM subscription_account_association WHERE subscription_id=%s"
        #                 cur.execute(query, (subscription_id,))
        #                 result = cur.fetchone()

        #                 if result:
        #                     account_id = result.get('account_id')
        #                     if invoice['billing_reason'] == 'subscription_cycle':
        #                         # Check if this is the payment after the start
        #                         # Calculate 20% of the payment
        #                         amount_to_transfer = int(invoice['amount_paid'] * 0.30)
        #                         if amount_to_transfer > 0:
        #                             # Create a transfer to the connected account
        #                             print('transfering to account')
        #                             stripe.Transfer.create(
        #                                 amount=amount_to_transfer,
        #                                 currency=invoice['currency'],
        #                                 destination=account_id,
        #                                 transfer_group=invoice_id,
        #                             )
        # except Exception as e:
        #     print(f"Error: {e}")

        

        
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
                    # Check if user exists
                    cur.execute("SELECT * FROM users WHERE email = %s", (customer_email,))
                    update_user = cur.fetchone()
                    
                    if update_user is None:
                        # Insert new user
                        insert_query = """
                        INSERT INTO users (email, status, stripe_customer_id, credits)
                        VALUES (%s, 'pre', %s, %s, 1000)
                        """
                        cur.execute(insert_query, (customer_email, stripe_customer))
                        print(f"Inserted new user data for email {customer_email}")
                    else:
                        # Update existing user
                        update_query = """
                        UPDATE users 
                        SET stripe_customer_id = %s
                        WHERE email = %s
                        """
                        cur.execute(update_query, (stripe_customer, customer_email))
                        print(f"Updated user data for email {customer_email}")
                    
                    conn.commit()

        except (Exception, psycopg2.DatabaseError) as error:
            print(f"Error updating user data: {error}")

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
                    # First, retrieve the email
                    select_query = "SELECT email FROM users WHERE stripe_customer_id = %s"
                    cur.execute(select_query, (stripe_customer,))
                    result = cur.fetchone()
                    
                    if result:
                        email = result[0]
                        
                        # Now delete from users table
                        delete_query = "DELETE FROM users WHERE stripe_customer_id = %s"
                        cur.execute(delete_query, (stripe_customer,))
                        
                        # Delete from the other table using the email
                        other_table_delete_query = "DELETE FROM other_table_name WHERE email = %s"
                        cur.execute(other_table_delete_query, (email,))
                        
                        conn.commit()
                        
                        print(f"Deleted user with email {email} from users and other_table_name")
                        # Delete user from Cognito
                        try:
                            cognito_client.admin_delete_user(
                                UserPoolId=USER_POOL_ID,
                                Username=email
                            )
                            print(f"Deleted user {email} from Cognito user pool")
                        except cognito_client.exceptions.UserNotFoundException:
                            print(f"User {email} not found in Cognito user pool")
                        except Exception as e:
                            print(f"Error deleting user from Cognito: {str(e)}")

                    else:
                        print(f"No user found with stripe_customer_id {stripe_customer}")

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

def create_or_update_cognito_user(email, plan_type,temp_password):
    """Create or update a user in Cognito with the given plan type."""
    try:
        # Check if the user already exists
        try:
            cognito_user = cognito_client.admin_get_user(
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
            # send_login_email(email, temp_password)
        
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
    message["From"] = formataddr((sender_creds['name'], sender_creds['email'])) 
    message['To'] = email

    part1 = MIMEText(BODY_TEXT, 'plain', 'utf-8')
    part2 = MIMEText(BODY_HTML, 'html', 'utf-8')

    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server: 
            server.starttls()
            server.login(sender_creds['email'], sender_creds['password'])
            server.send_message(message)
        print(f"Email sent successfully to {email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("SMTP Authentication Error: The username and/or password you entered is incorrect.")
        return False
    except smtplib.SMTPException as e:
        print(f"SMTP error occurred: {str(e)}")
        return False
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

