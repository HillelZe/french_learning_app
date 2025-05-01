import boto3
from botocore.exceptions import ClientError

# Configure AWS credentials and region
dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')


def lambda_handler(event, context):
    word_to_check = event['word']

    table_name = 'french-nouns'
    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(Key={
            'noun': word_to_check,

        })
        if 'Item' in response:
            return {
                'statusCode': 200,
                'body': {

                    'gender': response['Item']['gender']
                }
            }
        else:
            return {
                'statusCode': 200,
                'body': {
                    'gender': "not a noun"
                }
            }
    except ClientError as e:
        print("Error:", e)
        return {
            'statusCode': 500,
            'body': {
                'message': 'Error checking word'  # Return error message
            }
        }
