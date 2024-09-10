import json
import html
import os
from openai import OpenAI
from dotenv import load_dotenv
from lambda_decorators import json_http_resp, cors_headers , load_json_body
from trip_journey_email import send_itinerary_email

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
        itinerary ="""Day 1:
        Morning activity: Visit the iconic Eiffel Tower and take in the panoramic views of Paris from the top (cost: 25 euros for elevator to the summit)
        Lunch recommendation: Enjoy a picnic at the nearby Champ de Mars park with fresh baguettes, cheese, and wine from a local market (cost: 15 euros)
        Afternoon activity: Explore the charming streets of Montmartre and visit the Sacré-Cœur Basilica for stunning views of the city (free)
        Dinner recommendation: Dine at Le Relais Gascon for delicious French cuisine in a cozy setting (cost: 30 euros)
        Evening activity: Take a leisurely stroll along the Seine River and watch the sunset behind Notre Dame Cathedral (free)

        Total estimated cost for Day 1: 70 euros

        Day 2:
        Morning activity: Visit the Louvre Museum to see famous works of art such as the Mona Lisa and Venus de Milo (cost: 15 euros)
        Lunch recommendation: Grab a quick bite at a local boulangerie for a tasty sandwich or quiche (cost: 10 euros)
        Afternoon activity: Stroll through the beautiful Tuileries Garden and admire the sculptures, fountains, and flower beds (free)
        Dinner recommendation: Indulge in a traditional French dinner at Le Procope, the oldest cafe in Paris (cost: 35 euros)
        Evening activity: Attend a cabaret show at the famous Moulin Rouge for a memorable night out (cost: 80 euros for show ticket with a glass of champagne)

        Total estimated cost for Day 2: 140 euros

        Day 3:
        Morning activity: Explore the historic neighborhood of Le Marais and visit the Picasso Museum (cost: 12 euros)
        Lunch recommendation: Enjoy a leisurely meal at L'As du Fallafel for delicious falafel and Middle Eastern cuisine (cost: 10 euros)
        Afternoon activity: Take a boat cruise along the Seine River to see Paris landmarks from a different perspective (cost: 15 euros)
        Dinner recommendation: Dine at La Crêperie Josselin for savory and sweet crepes in a cozy setting (cost: 20 euros)
        Evening activity: Visit the Latin Quarter for live music at a jazz club or enjoy a nightcap at a trendy cocktail bar (cost: 20 euros)

        Total estimated cost for Day 3: 77 euros

        Overall estimated cost for the 3-day trip to Paris: 287 euros

        Note: Prices are approximate and may vary depending on the season and exchange rates. It's always a good idea to budget a little extra for unexpected expenses or souvenirs. Enjoy your trip to the City of Light!"""


        if not itinerary:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7,
            )
            itinerary = response.choices[0].message.content.strip()
            
        print(itinerary)
        # Send the email
        email_sent = send_itinerary_email('tripjourneyai@gmail.com', itinerary, destination, days, budget)

        if email_sent:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Itinerary generated and sent to your email successfully!',
                    'itinerary': itinerary
                }),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        else:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Failed to send email. Please try again.'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }

        # return {
        #     'statusCode': 200,
        #     'body': json.dumps({'itinerary': itinerary}),
        #     'headers': {
        #         'Content-Type': 'application/json',
        #         'Access-Control-Allow-Origin': '*'  # Allow CORS for all origins
        #     }
        # }
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