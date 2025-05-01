import json
import boto3
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.types import TypeDeserializer


def lambda_handler(event, context):
    userID = event['userID']
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('words-set')
    response = table.scan(
        FilterExpression=Attr('userID').eq(userID)
    )

    for item in response['Items']:
        item['ID'] = int(item['ID'])
        item['rate'] = int(item['rate'])

    return {
        'statusCode': 200,
        'body': json.dumps(response['Items'])
    }
