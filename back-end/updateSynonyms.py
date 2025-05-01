import json
import boto3

dynamodb = boto3.client('dynamodb')
table_name = 'words-set'


def lambda_handler(event, context):

    newSynonyms = event['synonyms']
    ID = event['ID']

    # convert list of strings to db format
    formatted_synonyms = formatted_synonyms = [{'S': s} for s in newSynonyms]

    # update the synonyms list
    response = dynamodb.update_item(
        TableName=table_name,
        Key={'ID': {'N': ID}},
        UpdateExpression='SET synonyms = :newSynonyms',
        ExpressionAttributeValues={
            ':newSynonyms': {'L': formatted_synonyms},

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
