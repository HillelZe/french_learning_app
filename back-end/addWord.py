import boto3

# Initialize the DynamoDB client
dynamodb = boto3.client('dynamodb')
table_name = 'words-set'

# gets an ID of an item in words-set and add a synonym to its synonyms list


def addSynonym(id, synonym):

    update_expression = "SET #attr = list_append(if_not_exists(#attr, :empty_list), :val)"
    expression_attribute_names = {'#attr': 'synonyms'}
    expression_attribute_values = {
        # Wrap the new string in a list format
        ':val': {'L': [{'S': synonym}]},
        # Empty list placeholder to handle if the attribute doesn't exist
        ':empty_list': {'L': []}
    }

# Update the item
    response = dynamodb.update_item(
        TableName=table_name,
        Key={'ID': {'N': str(id)}},
        UpdateExpression=update_expression,
        ExpressionAttributeNames=expression_attribute_names,
        ExpressionAttributeValues=expression_attribute_values,
    )


def lambda_handler(event, context):
    # Retrieve the Hebrew and French words from the event
    hebrew_word = event['hebrew']
    french_word = event['french']
    user_id = event['userID']

    # fetch the user's words
    response = dynamodb.scan(
        TableName=table_name,
        FilterExpression='userID = :user_id',
        ExpressionAttributeValues={
            ':user_id': {'S': user_id}
        }
    )

    # check if the word isn't already in the db
    for item in response['Items']:
        if item['french']['S'] == french_word and item['hebrew']['S'] == hebrew_word:
            return {
                'statusCode': 400,
                'body': 'word already exist.'
            }

    # check for synonyms
    synonymNames = []
    synonyms = list(
        filter(lambda item: item['hebrew']['S'] == hebrew_word, response['Items']))
    for item in synonyms:
        addSynonym(item['ID']['N'], french_word)
        synonymNames.append({'S': item['french']['S']})

    # create the new id number
    response = dynamodb.scan(
        TableName=table_name,
        ProjectionExpression='ID',
        Select='SPECIFIC_ATTRIBUTES'
    )

    max_id = 0
    for item in response['Items']:
        if int(item['ID']['N']) > max_id:
            max_id = int(item['ID']['N'])
    unique_id = str(max_id+1)

    # create the new item
    new_item = {
        'ID': {'N': unique_id},
        'hebrew': {'S': hebrew_word},
        'french': {'S': french_word},
        'userID': {'S': user_id},
        'rate': {'N': '0'},
        'synonyms': {'L': list(synonymNames)}
    }

    # Add the new word to the DynamoDB table
    try:
        response = dynamodb.put_item(TableName=table_name, Item=new_item)
        return {
            'statusCode': 200,
            'body': 'Item added to DynamoDB successfully.'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'Error: ' + str(e)
        }
