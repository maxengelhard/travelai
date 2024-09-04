import json
import os
from openai import OpenAI
from dotenv import load_dotenv
from lambda_decorators import json_http_resp, cors_headers , load_json_body

load_dotenv()


# Set up OpenAI client
client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])


@cors_headers
@load_json_body
@json_http_resp
def lambda_handler(event, context):
    # Parse the incoming JSON from API Gateway
    body = event.get('body', {})
    destination = body.get('destination', '')
    days = body.get('days', '')
    budget = body.get('budget', '')

    prompt_parts = ["Create a detailed itinerary for a trip"]
    
    if destination:
        prompt_parts.append(f"to {destination}")
    
    if days:
        prompt_parts.append(f"for {days} days")
    
    if budget:
        prompt_parts.append(f"with a budget of {budget}")
    
    prompt = f"{' '.join(prompt_parts)}. " + """
    Include the following for each day:
    1. Morning activity
    2. Lunch recommendation
    3. Afternoon activity
    4. Dinner recommendation
    5. Evening activity (if applicable)
    """
    
    if budget:
        prompt += "6. Estimated costs for activities and meals\n"
    
    prompt += """
    Please format the itinerary in a clear, day-by-day structure.
    """
    
    if not destination:
        prompt += "If no specific destination is provided, suggest a popular travel destination and create an itinerary for it. "
    if not days:
        prompt += "If no specific duration is provided, create a 3-day itinerary. "
    if not budget:
        prompt += "If no budget is specified, assume a moderate budget. "

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7,
        )
        itinerary = response.choices[0].message.content.strip()
        
        return {
            'statusCode': 200,
            'body': json.dumps({'itinerary': itinerary}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
            }
        }
    

if __name__ == "__main__":
    result = lambda_handler({"body": {"destination": "Paris", "days": "3", "budget": "1000"}}, None)
    print(result)