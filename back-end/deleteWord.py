import json
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.client('dynamodb')
table_name = 'words-set'


def lambda_handler(event, context):
    try:
        # In case you're receiving the payload via API Gateway
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event

        userID = body['userID']
        ID = body['ID']

        # First, check if the word with given ID belongs to the user
        response = dynamodb.scan(
            TableName=table_name,
            FilterExpression='userID = :userID AND ID = :ID',
            ExpressionAttributeValues={
                ':userID': {'S': userID},
                ':ID': {'N': str(ID)}
            }
        )

        if len(response['Items']) == 0:
            return {
                'statusCode': 400,
                'body': json.dumps('The word you are trying to delete does not match the userID')
            }

        # Delete the item using ID as the key
        delete_response = dynamodb.delete_item(
            TableName=table_name,
            Key={'ID': {'N': str(ID)}}
        )

        if delete_response['ResponseMetadata']['HTTPStatusCode'] == 200:
            return {
                'statusCode': 200,
                'body': json.dumps('Delete successful!')
            }
        else:
            return {
                'statusCode': 500,
                'body': json.dumps('Delete failed!')
            }

    except KeyError as e:
        return {
            'statusCode': 400,
            'body': json.dumps(f'Missing parameter: {str(e)}')
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error accessing DynamoDB: {e.response["Error"]["Message"]}')
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Unhandled exception: {str(e)}')
        }
