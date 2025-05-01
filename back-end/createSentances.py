import http.client
import json
import random
import boto3

LEVEL_DESCRIPTIONS = {
    "A1": (
        "Sentences must be in level A1, be simple and use basic vocabulary. "
        "They should focus on familiar topics such as daily routines, family, and introductions. "
        "use only words that a A1 level student should know"
        "For example: 'I like apples.', 'He is in the kitchen.', 'We live in a small house.', 'She has a red book.'"
    ),
    "A2": (
        "Sentences should be in level A2, describe everyday situations and actions. "
        "They should relate to common topics like shopping, traveling, or hobbies. "
        "use only words that a A2 level student should know"
        "For example: 'I went to the park yesterday.', 'She likes to read books in her free time.', "
        "'They are buying fruits at the market.', 'We had dinner with friends last night.'"
    ),
    "B1": (
        "Sentences should be in level B1, express opinions, describe events, or share plans. "
        "They can involve familiar topics such as travel, work, or aspirations. "
        "use only words that a B1 level student should know"
        "For example: 'I have never been to Spain, but I want to go.', 'If I had more time, I would learn another language.', "
        "'She works hard to achieve her goals.', 'We are planning a trip to the mountains this weekend.'"
    ),
    "B2": (
        "Sentences should be in level B2,  discuss abstract ideas, make comparisons, or explain details clearly. "
        "They can focus on topics like culture, personal reflections, or debates. "
        "use only words that a B2 level student should know"
        "For example: 'Although I enjoy my job, I sometimes wish for more free time.', "
        "'This movie was more interesting than I had expected.', "
        "'He explained the concept clearly, even though it was difficult to understand.', "
        "'If I had known about the event earlier, I would have participated.'"

    ),
    "C1": (
        "Sentences should be in level C1, express nuanced ideas and detailed explanations. "
        "They can involve abstract or professional topics requiring precision and clarity. "
        "use only words that a C1 level student should know"
        "For example: 'Despite the challenges, she managed to complete the project successfully.', "
        "'It is essential that everyone be informed of the new regulations.', "
        "'The decision, though controversial, was ultimately the right one.', "
        "'If the data had been analyzed more carefully, the error could have been avoided.'"
    )
}


def lambda_handler(event, context):
    print("DEBUG - Event received:", json.dumps(event))
    level = str(event.get("level"))
    num_of_questions = int(event.get("numOfQuestions"))
    topics = event.get("topics")
    words = event.get("words")

    instructions_list = []
    for i in range(num_of_questions):
        r = random.randint(0, len(words) - 1)
        instructions_list.append(
            f"A sentence appropriate for a {level} French student in {random.choice(topics)} that includes the word {words[r]}")
        del words[r]
    instructions = "\n".join(instructions_list)

    print(level)
    print(", ".join(topics))

    api_key = get_api_key()
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    prompt = (
        f"Create {num_of_questions} sentence(s) in French according to the following instructions:\n"
        f"{LEVEL_DESCRIPTIONS[level]}\n"
        f"{instructions}\n"
        f"the sentances should be such that a french student at {level} could have writen them"
        f"Translate and return all the sentences in English.\n"
        f"do not return the french sentances\n"
        f"Start each sentence on a new line.\n"
        f"Ensure the most plausible translation includes the chosen French word.\n"
        f"Focus on clear, well-structured sentences.\n"
        f"do not start a new line qfter the last sentence\n"
    )
    data = json.dumps({
        "model": "gpt-4o",
        "messages": [{"role": "user", "content":
                      prompt
                      }],
        "max_tokens": 500
    })
    print(data)
    conn = http.client.HTTPSConnection("api.openai.com")
    conn.request("POST", "/v1/chat/completions", body=data, headers=headers)
    response = conn.getresponse()
    result = response.read().decode()

    # Parse the JSON response
    response_json = json.loads(result)

    # Extract the translated sentence
    translated_sentence = response_json['choices'][0]['message']['content']

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(translated_sentence)
    }


def get_api_key():
    ssm = boto3.client('ssm')
    parameter = ssm.get_parameter(
        Name='/api-keys/openai',
        WithDecryption=True)
    return parameter['Parameter']['Value']
