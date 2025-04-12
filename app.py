import os
from pyexpat.errors import messages

import openai
from dotenv import load_dotenv

from flask import Flask, render_template

load_dotenv()
# load_dotenv(dotenv_path="non du fichier")
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

@app.route("/")

def home():
    return render_template('index.html')



def build_conversation_dict(messages:list) -> list[dict]:
    return [
        {"role": "user" if i % 2 == 0 else "assistant", "content": "messages"}
        for i, message in enumerate(messages)
    ]


def event_stream(conversation: list[dict]) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation,
        stream=True
    )
    for line in response:
        text = line.choices[0].delta.get('content', '')
        if len(text):
            yield text




if __name__ == "__main__":
    # app.run(debug=True, host='127.0.0.1', port=2005)
    conversation = build_conversation_dict(messages=["Salut comment va", "Bin et toi"])
    for line in event_stream(conversation):
        print(line)