import boto3
import os

def add_custom_attributes_to_user_pool(user_pool_id, custom_attributes):
    client = boto3.client('cognito-idp')
    
    try:
        response = client.add_custom_attributes(
            UserPoolId=user_pool_id,
            CustomAttributes=custom_attributes
        )
        print("Custom attributes added successfully:", response)
        return True
    except Exception as e:
        print("Error adding custom attributes:", str(e))
        return False

# Usage
user_pool_id = os.getenv('USER_POOL_ID')
custom_attributes = [
    {
        'Name': 'plan_type',
        'AttributeDataType': 'String',
        'DeveloperOnlyAttribute': False,
        'Mutable': True,
        'Required': False,
        'StringAttributeConstraints': {
            'MaxLength': '256',
            'MinLength': '1'
        }
    },
    {
        'Name': 'is_pro',
        'AttributeDataType': 'String',
        'DeveloperOnlyAttribute': False,
        'Mutable': True,
        'Required': False,
        'StringAttributeConstraints': {
            'MaxLength': '5',
            'MinLength': '1'
        }
    }
]

add_custom_attributes_to_user_pool(user_pool_id, custom_attributes)