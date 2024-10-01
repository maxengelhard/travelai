import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
import os
import json

def lambda_handler(event, context):
    # Parse the incoming JSON
    body = json.loads(event['body'])
    question = body['question']
    
    # Get the user's email from the JWT token
    user_email = event['requestContext']['authorizer']['claims']['email']

    # Email configuration
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = 'tripjourneyai@gmail.com'
    sender_password = os.getenv('EMAIL_PASSWORD')
    sender_name = "Trip Journey Support"
    recipient_email = "tripjourneyai@gmail.com"

    # Prepare email content
    subject = f"New Question from {user_email}"
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .question {{ background-color: #f9f9f9; padding: 15px; border-left: 5px solid #3498db; margin-bottom: 20px; }}
            .user-info {{ font-style: italic; color: #7f8c8d; }}
        </style>
    </head>
    <body>
        <h2>New Question Received</h2>
        <div class="question">
            <p>{question}</p>
        </div>
        <p class="user-info">From: {user_email}</p>
    </body>
    </html>
    """

    # Create a multipart message and set headers
    message = MIMEMultipart('alternative')
    message['Subject'] = subject
    message["From"] = formataddr((sender_name, sender_email))
    message['To'] = recipient_email

    # Add HTML content to the email
    part = MIMEText(html_content, 'html')
    message.attach(part)

    # Try to send the email
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(message)
        print("Email sent successfully")
        return {
            'statusCode': 200,
            'body': json.dumps('Question sent successfully')
        }
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error in sending email')
        }