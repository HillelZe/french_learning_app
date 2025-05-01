import json
import boto3

dynamodb = boto3.client('dynamodb')
table_name = 'words-set'


def lambda_handler(event, context):

    hebrew_word = event['hebrew']
    french_word = event['french']
    userID = event['userID']
    ID = event['ID']

    # check if the word belongs to the user
    response = dynamodb.scan(
        TableName=table_name,
        FilterExpression='userID = :userID AND ID = :ID',
        ExpressionAttributeValues={
            ':userID': {'S': userID},
            ':ID': {'N': ID}
        }
    )
    # if the word doesnt belong the the user return an error
    if (len(response['Items']) == 0):
        return {
            'statusCode': 400,
            'body': json.dumps('The word you are trying to modify doesnt match userID')
        }

    # modify the word
    response = dynamodb.update_item(
        TableName=table_name,
        Key={'ID': {'N': ID}},
        UpdateExpression='SET french = :french_word, hebrew = :hebrew_word',
        ExpressionAttributeValues={
            ':french_word': {'S': french_word},
            ':hebrew_word': {'S': hebrew_word},
        }
    )

    if response['ResponseMetadata']['HTTPStatusCode'] == 200:
        return {
            'statusCode': 200,
            'body': json.dumps('Update successful!')
        }
    else:
        return {
            'statusCode': 500,
            'body': json.dumps('Update failed!')
        }
