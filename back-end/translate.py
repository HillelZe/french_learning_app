import json
import boto3
import requests


def lambda_handler(event, context):
    word = event.get('word')
    src_lang = event.get('src_lang')
    dest_lang = event.get('dest_lang')

    if not all([word, src_lang, dest_lang]):
        return {
            'statusCode': 400,
            'body': json.dumps('Missing parameters: word, src_lang, and dest_lang are required.')
        }

    api_key = get_secret()
    try:
        url = f"https://translation.googleapis.com/language/translate/v2"
        params = {
            'q': word,
            'source': src_lang,
            'target': dest_lang,
            'format': 'text',
            'key': api_key
        }

        response = requests.post(url, params=params)
        response.raise_for_status()

        translated_text = response.json(
        )['data']['translations'][0]['translatedText']

        return {
            'statusCode': 200,
            'body': json.dumps({'translated_word': translated_text})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error during translation: {str(e)}')
        }


def get_secret():
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId='google-translate-api-key')
    secret_string = response['SecretString']
    secret = json.loads(secret_string)
    return secret['api_key']
