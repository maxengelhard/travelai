import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
import os
import json

def send_itinerary_email(sender_creds, recipient_email, itinerary, destination, days, budget):
    # Email configuration
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = sender_creds['email']  # email
    sender_password = sender_creds['password']
    sender_name = sender_creds['name']    
    # Parse the ChatGPT response
    # Prepare email content
    destination = destination if destination else "Your chosen destination"
    days_text = f"{days} days" if days else "your trip"
    budget_text = f"{budget}" if budget else "your specified budget"

    # Format the itinerary content
    def format_itinerary_content(itinerary):
        day = itinerary.split('Day')[1:][0]  # Skip the first empty element and get the first day
        formatted_days = []

        day_content = day.strip()
        day_number = day_content.split(':')[0]
        activities = day_content.split('\n')[1:]  # Skip the day number line

        formatted_day = f"<div style='margin-bottom: 30px;'><h2 style='color: #3498db;'>Day {day_number}</h2>"
        for activity in activities:
            if activity.strip():
                if 'Estimated costs:' in activity:
                    formatted_day += f"<p style='font-weight: bold; color: #e74c3c;'>{activity.strip()}</p>"
                else:
                    formatted_day += f"<p style='margin-bottom: 15px;'>{activity.strip()}</p>"
        formatted_day += "</div>"
        formatted_days.append(formatted_day)

        return "".join(formatted_days)

    # Construct the email HTML
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
            h1 {{ color: #2c3e50; text-align: center; }}
            h2 {{ color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
            .day {{ background-color: #f9f9f9; padding: 20px; margin-bottom: 30px; border-radius: 5px; }}
            .activity {{ margin-bottom: 15px; }}
            .activity-title {{ font-weight: bold; color: #2980b9; }}
            .cost {{ color: #e74c3c; font-style: italic; }}
            .cta-button {{ display: block; width: 200px; margin: 20px auto; padding: 10px; background-color: #3498db; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold; }}
            .note {{ background-color: #ffffd9; padding: 10px; border-left: 5px solid #f1c40f; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <h1>Your Personalized {destination} Itinerary</h1>
        <p>Dear Traveler,</p>
        <p>We're excited to present your custom itinerary for {days_text} in {destination}, designed to fit within {budget_text}. Here's what we've planned for you:</p>
        
        {format_itinerary_content(itinerary)}

        <p>Want to see the full {days}-day itinerary?</p>
        <a href="https://tripjourney.co/pricing" class="cta-button">View Full Itinerary</a>
        
        <div class="note">
            <p><strong>Note:</strong> This is just a preview of your trip. To access the full {days}-day itinerary and unlock more features, sign up for a plan.</p>
        </div>
        
        <p>We hope you have a wonderful trip to {destination}!</p>
        <p>Safe travels!</p>
        <p>Trip Joureny AI</p>
    </body>
    </html>
    """

    # Create a multipart message and set headers
    message = MIMEMultipart('alternative')
    message['Subject'] = f"Your Personalized {destination} Itinerary"
    message["From"] = formataddr((sender_name, sender_email)) 
    message['To'] = recipient_email

    # Add HTML content to the email
    part = MIMEText(html_content, 'html')
    message.attach(part)


    # Try to send the email
    # Create a secure SSL/TLS connection
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(message)
        print("Email sent successfully")
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False


if __name__ == '__main__':
    # Example usage
    chatgpt_response = {'statusCode': 200, 'body': '{"body": "{\\"itinerary\\": \\"Day 1:\\\\nMorning activity:\\\\n- Visit the iconic Eiffel Tower and take in the stunning views of Paris from the top (cost: around 25 euros for elevator to the summit)\\\\n\\\\nLunch recommendation:\\\\n- Enjoy a traditional French meal at a local bistro near the Eiffel Tower (cost: around 20 euros)\\\\n\\\\nAfternoon activity:\\\\n- Explore the charming neighborhood of Montmartre and visit the Sacr\\\\u00e9-C\\\\u0153ur Basilica (cost: free)\\\\n\\\\nDinner recommendation:\\\\n- Dine at a cozy restaurant in Montmartre and try some delicious French cuisine (cost: around 30 euros)\\\\n\\\\nEstimated costs: 75 euros\\\\n\\\\nDay 2:\\\\nMorning activity:\\\\n- Visit the Louvre Museum and marvel at famous works of art such as the Mona Lisa (cost: 15 euros)\\\\n\\\\nLunch recommendation:\\\\n- Grab a quick bite at a local caf\\\\u00e9 near the Louvre (cost: around 10 euros)\\\\n\\\\nAfternoon activity:\\\\n- Stroll along the Seine River and visit Notre Dame Cathedral (cost: free)\\\\n\\\\nDinner recommendation:\\\\n- Indulge in a gourmet meal at a Michelin-starred restaurant in the city center (cost: around 50 euros)\\\\n\\\\nEvening activity:\\\\n- Take a sunset cruise along the Seine River to see Paris illuminated at night (cost: 15 euros)\\\\n\\\\nEstimated costs: 90 euros\\\\n\\\\nDay 3:\\\\nMorning activity:\\\\n- Explore the charming neighborhood of Le Marais and visit the Picasso Museum (cost: 12 euros)\\\\n\\\\nLunch recommendation:\\\\n- Enjoy a leisurely lunch at a trendy caf\\\\u00e9 in Le Marais (cost: around 15 euros)\\\\n\\\\nAfternoon activity:\\\\n- Visit the Palace of Versailles and wander through the stunning gardens (cost: 18 euros for entrance to the palace)\\\\n\\\\nDinner recommendation:\\\\n- Dine at a traditional French brasserie near your hotel (cost: around 25 euros)\\\\n\\\\nEstimated costs: 70 euros\\\\n\\\\nTotal estimated cost for 3 days: 235 euros\\\\n\\\\nThis itinerary allows you to experience the best of Paris while staying within your budget of 1000 euros. Enjoy your trip!\\"}"}', 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,PUT,POST,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Accept-Encoding,Content-Encoding,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Client-ID,key,secret,session'}}

    # Example form data
    destination = "Paris"
    days = "3"
    budget = "1000"
    email = "travelemail@gmail.com"

    send_itinerary_email(email, json.loads(chatgpt_response['body'])['body'], destination, days, budget)