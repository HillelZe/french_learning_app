import json
import boto3
from botocore.exceptions import ClientError
dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
# function gets an userID, finds his current word in user-info and then return the matching word from words-stock


def advanceCounter(userID, current_word_num):
    table_name = "users_info"
    table = dynamodb.Table(table_name)
    try:
        response = table.update_item(
            Key={'userID': userID},
            UpdateExpression='SET current_word= :val',
            ExpressionAttributeValues={':val': current_word_num+1}
        )
    except ClientError as e:
        print("Error updating counter:", e)


def lambda_handler(event, context):
    table_name = "users_info"
    userID = event['userID']
    table = dynamodb.Table(table_name)
    current_word_num = None
    try:
        response = table.get_item(Key={'userID': userID})
        if 'Item' in response:
            current_word_num = response['Item']['current_word']

        else:
            return {
                'statusCode': 400,
                'body': json.dumps("couldn't find current word number")
            }
    except ClientError as e:
        print("Error:", e)
        return {
            'statusCode': 500,
            'body': {
                'message': "error finding current_word num"
            }
        }
    table = dynamodb.Table("words-stock")
    try:
        response = table.get_item(Key={'ID': current_word_num})
        if 'Item' in response:
            advanceCounter(userID, current_word_num)
            return {
                'statusCode': 200,
                'body': {"current_word": response['Item']}
            }

        else:
            return {
                'statusCode': 400,
                'body': json.dumps("couldn't find current word")
            }
    except ClientError as e:
        print("Error:", e)
        return {
            'statusCode': 500,
            'body': {
                'message': "error finding current_word"
            }
        }
