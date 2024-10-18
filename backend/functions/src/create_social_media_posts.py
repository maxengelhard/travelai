import requests
import json
import os
import time
from openai import OpenAI
import random
import boto3
from botocore.exceptions import ClientError
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

LEONARDO_API_KEY = os.environ['LEONARDO_API_KEY']
client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])

s3 = boto3.client('s3')
BUCKET_NAME = os.environ['S3_DB']
STAGE = os.environ['STAGE']

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "Trip Journey Social Media Intern"
SMTP_PASSWORD = os.environ['EMAIL_PASSWORD']
SENDER_EMAIL = 'tripjourneyai@gmail.com'
RECIPIENT_EMAIL = 'tripjourneyai@gmail.com'

def get_cities_from_s3():
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key='social-media/popular_cities.json')
        return json.loads(response['Body'].read().decode('utf-8'))
    except ClientError as e:
        print(f"Error reading cities from S3: {e}")
        return []

def city_exists_in_s3(city):
    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=f'social-media/{city}/')
        return True
    except ClientError:
        return False

def generate_prompt(city):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates very descriptive prompts for images."},
            {"role": "user", "content": f"Generate an extremely detailed prompt for an image that is a beautiful travel photo of {city}. Include refrences about people in the photo as well."}
        ]
    )
    prompt = response.choices[0].message.content
    print(f"Image generation prompt: {prompt}") 
    return prompt


def create_image(city):
    prompt = generate_prompt(city)
    url = "https://cloud.leonardo.ai/api/rest/v1/generations"

    payload = json.dumps({
        "height": 512,
        "prompt": prompt,
        "modelId": "aa77f04e-3eec-4034-9c07-d0f619684628",
        "width": 512,
        "alchemy": True,
        "photoReal": True,
        "photoRealVersion": "v2",
        "presetStyle": "CINEMATIC"
    })
    headers = {
        'accept': 'application/json',
        'authorization': f'Bearer {LEONARDO_API_KEY}',
        'content-type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    generation_resp = response.json()
    print(generation_resp)
    return generation_resp['sdGenerationJob']['generationId']

def get_images(generation_id):
    url = f"https://cloud.leonardo.ai/api/rest/v1/generations/{generation_id}"
    headers = {
        'accept': 'application/json',
        'authorization': f'Bearer {LEONARDO_API_KEY}'
    }
    response = requests.request("GET", url, headers=headers)
    print(response.json())
    return response.json()

def generate_caption(city):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a travel enthusiast creating engaging social media captions."},
            {"role": "user", "content": f"Write a short, engaging Instagram caption for a beautiful travel photo of {city}. Include relevant hashtags."}
        ]
    )
    return response.choices[0].message.content

def save_to_s3(city, image_urls, caption):
    timestamp = int(time.time())
    
    # Save caption
    caption_key = f'social-media/{city}/captions/caption_{timestamp}.txt'
    s3.put_object(Bucket=BUCKET_NAME, Key=caption_key, Body=caption.encode('utf-8'))

    # Save image URLs
    urls_key = f'social-media/{city}/image_urls/urls_{timestamp}.json'
    s3.put_object(Bucket=BUCKET_NAME, Key=urls_key, Body=json.dumps(image_urls).encode('utf-8'))

def send_email(city, caption, image_urls):
    msg = MIMEMultipart('alternative')
    msg['From'] = formataddr((SMTP_USERNAME, SENDER_EMAIL))
    msg['To'] = RECIPIENT_EMAIL
    msg['Subject'] = f"New Social Media Post Options for {city}"

    html_content = f"""
    <html>
    <body>
    <h2>Caption:</h2>
    <p>{caption}</p>
    <h2>Image URLs:</h2>
    <ul>
    {"".join(f"<li><a href='{url}'>{url}</a></li>" for url in image_urls)}
    </ul>
    </body>
    </html>
    """

    text = MIMEText(html_content, 'html')
    msg.attach(text)

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"Email sent successfully for {city}")
    except Exception as e:
        print(f"Failed to send email for {city}: {str(e)}")

def lambda_handler(event, context):
    if STAGE == "dev":
        return {
            'statusCode': 200,
            'body': json.dumps('Image generation, storage, and email sending complete')
        }
    
    popular_cities = get_cities_from_s3()
    
    for _ in range(1):  # Generate 1 set of images per run
        city = random.choice(popular_cities)
        
        if not city_exists_in_s3(city):
            generation_id = create_image(city)
            
            # Wait for image generation to complete
            image_data = None
            image_urls = []
            attempts = 0
            while attempts < 10 and not image_data:
                time.sleep(30)  # Wait 30 seconds between checks
                image_data = get_images(generation_id)
                if image_data['generations_by_pk']['generated_images']:
                    image_urls = [img['url'] for img in image_data['generations_by_pk']['generated_images']]
                    break
                attempts += 1
            
            if image_urls:
                caption = generate_caption(city)
                save_to_s3(city, image_urls, caption)
                send_email(city, caption, image_urls)
                print(f"Generated and saved content for {city}")
            else:
                print(f"Failed to generate images for {city}")
        else:
            print(f"Content for {city} already exists")

    return {
        'statusCode': 200,
        'body': json.dumps('Image generation, storage, and email sending complete')
    }