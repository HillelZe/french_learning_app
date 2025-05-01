import json
import boto3
from datetime import datetime


def lambda_handler(event, context):
    word_id = event['wordID']
    new_rate = event['newRate']
    last_time_wrong = event['lastTimeWrong']
    current_date = datetime.today().strftime("%-d.%-m.%Y")

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('words-set')

    try:
        table.update_item(
            Key={'ID': word_id},
            UpdateExpression="SET rate = :r, updateDate = :d, lastTimeWrong = :l",
            ExpressionAttributeValues={
                ':r': new_rate,
                ':d': current_date,
                ':l': last_time_wrong
            }
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Update successful'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f'Update failed: {str(e)}'})
        }
