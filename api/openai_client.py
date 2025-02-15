import openai
import os
from dotenv import load_dotenv

load_dotenv()  # Load API key from .env file

openai.api_key = os.getenv("OPENAI_API_KEY")
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("ERROR: OPENAI_API_KEY is missing. Make sure it's set in the .env file.")
else:
    print("API key found.")


def get_openai_response(text):
    client = openai.OpenAI()  # Initialize the client
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # Change this to your preferred model (e.g., "gpt-4", "gpt-3.5-turbo")
        messages=[{"role": "user", "content": text}]
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    print(get_openai_response("What is the meaning of life?"))