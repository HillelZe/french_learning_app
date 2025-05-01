import http.client
import json


def lambda_handler(event, context):
    print("DEBUG - Event received:", json.dumps(event))
    sentence = str(event.get("sentence"))
    answer = str(event.get("answer"))
    api_key = get_api_key()
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    prompt = (
        f"This is a practice translation exercise from English to French.\n"
        f"Provide feedback on the user's translation in the following format:\n\n"
        f"first line is simply the corrected sentance. dont add anything to it\n"
        f"afterwards Add short remarks explaining specific mistakes, focusing on grammar, vocabulary, and stylistic improvements.\n"
        f"number the correction (not including the first line) and start each one on a new line\n"
        f"Use clear and concise explanations suitable for a learner.\n\n"
        f"Original sentence: {sentence}\n"
        f"User's translation: {answer}\n"
    )

    data = json.dumps({
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": prompt
                      }],
        "max_tokens": 200
    })
    print(data)
    conn = http.client.HTTPSConnection("api.openai.com")
    conn.request("POST", "/v1/chat/completions", body=data, headers=headers)
    response = conn.getresponse()
    result = response.read().decode()

    # Parse the JSON response
    response_json = json.loads(result)

    feedback = response_json['choices'][0]['message']['content'].strip()

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "text/plain"
        },
        "body": feedback
    }
    def get_api_key():
    ssm = boto3.client('ssm')
    parameter = ssm.get_parameter(
        Name='/api-keys/openai',
        WithDecryption=True)
    return parameter['Parameter']['Value']
