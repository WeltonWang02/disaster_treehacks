import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

# Directory for storing JSON outputs
OUTPUT_DIR = "api/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_json_from_response(response_text):
    """Extracts only the last <output></output> JSON block from the model response."""
    matches = re.findall(r"<output>(.*?)</output>", response_text, re.DOTALL)
    
    if matches:
        try:
            last_match = matches[-1]  # Get the last occurrence
            return json.loads(last_match)  # Convert string to JSON
        except json.JSONDecodeError:
            raise ValueError("Error: Could not decode JSON from response.")
    else:
        raise ValueError("Error: No valid JSON found in response.")

def analyze_disaster_image(image_url):
    """Sends an image to Groq AI and extracts structured characteristics in JSON."""
    
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing. Set it in the .env file.")

    prompt = (
        "I am making a spreadsheet detailing characteristics of a certain event "
        "(e.g. Type of natural disaster, type of region (urban, rural, etc.), Number of damaged buildings, "
        "Number of vehicles affected, Financial cost of affected region ($$ number), "
        "Number of people displaced, Number of people needed, "
        "What equipment is needed (water, cranes, etc.)). "
        "Provide additional relevant characteristics. "
        "Return in JSON format with fields: 'characteristic', 'description', and 'estimated value'. "
        "Wrap your JSON output, including brackets and commas as needed, in <output></output> tags."
    )

    # API request
    completion = client.chat.completions.create(
        model="llama-3.2-11b-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ],
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )

    # Extract and parse response
    response_text = completion.choices[0].message.content
    print(response_text)

    structured_data = extract_json_from_response(response_text)

    # Save JSON output to a file
    json_filename = os.path.join(OUTPUT_DIR, f"disaster_analysis.json")
    with open(json_filename, "w", encoding="utf-8") as json_file:
        json.dump(structured_data, json_file, indent=4)

    print(f"JSON output saved to: {json_filename}")
    return structured_data

if __name__ == "__main__":
    # Example image URL (Replace with actual image link)
    image_url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX7Z-CW4v_jWylNtQ-9HpeKRhOdCsCJQK4HQ&s"
    
    try:
        result = analyze_disaster_image(image_url)
        print(json.dumps(result, indent=4))  # Pretty-print JSON output
    except Exception as e:
        print(e)
