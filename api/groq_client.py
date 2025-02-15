import os
from groq import Groq
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

def get_groq_response(text, image_url=None):
    """Sends a query to Groq's LLaMA model with optional image input."""
    
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing. Set it in the .env file.")

    # Construct message payload
    messages = [{"role": "user", "content": [{"type": "text", "text": text}]}]

    if image_url:
        messages[0]["content"].append({
            "type": "image_url",
            "image_url": {"url": image_url}
        })

    # Call Groq API
    completion = client.chat.completions.create(
        model="llama-3.2-11b-vision-preview",
        messages=messages,
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )

    return completion.choices[0].message.content

if __name__ == "__main__":
    try:
        # Example: Text-only query
        print(get_groq_response("What is the capital of France?"))

        # Example: Image + Text query
        image_url = "https://upload.wikimedia.org/wikipedia/commons/f/f2/LPU-v1-die.jpg"
        print(get_groq_response("Describe this image:", image_url))
    except Exception as e:
        print(e)
