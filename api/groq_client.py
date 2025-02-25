import os
import json
import re
from dotenv import load_dotenv
from api.groq_client import get_groq_response  # Importing from groq_client.py

# Load environment variables
load_dotenv()

# Directory for storing JSON outputs
OUTPUT_DIR = "api/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_json_from_response(response_text):
    """Extracts JSON from <output></output> tags in the model response."""
    match = re.search(r"<output>(.*?)</output>", response_text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            raise ValueError("Error: Could not decode JSON from response.")
    else:
        raise ValueError("Error: No valid JSON found in response.")

def analyze_disaster_image(image_url):
    """Sends an image to Groq AI via groq_client.py and extracts structured characteristics in JSON."""
    
    prompt = (
        "I am making a spreadsheet detailing characteristics of a certain event "
        "(e.g. Type of disaster, type of region (urban, rural, etc.), Number of damaged buildings, "
        "Number of vehicles affected, Financial cost of affected region ($$ number), "
        "Number of people displaced, Number of people needed, "
        "What equipment is needed (water, cranes, etc.)). "
        "Provide additional relevant characteristics. "
        "Return in JSON format with fields: 'characteristic', 'description', and 'estimated value'. "
        "Wrap your JSON output in <output></output> tags."
    )

    # Call Groq API via groq_client.py
    response_text = get_groq_response(prompt, image_url)

    # Extract and parse response
    structured_data = extract_json_from_response(response_text)

    # Save JSON output to a file
    json_filename = os.path.join(OUTPUT_DIR, "disaster_analysis.json")
    with open(json_filename, "w", encoding="utf-8") as json_file:
        json.dump(structured_data, json_file, indent=4)

    print(f"JSON output saved to: {json_filename}")
    return structured_data

if __name__ == "__main__":
    # Example image URL (Replace with actual disaster image)
    image_url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX7Z-CW4v_jWylNtQ-9HpeKRhOdCsCJQK4HQ&s"
    
    try:
        result = analyze_disaster_image(image_url)
        print(json.dumps(result, indent=4))  # Pretty-print JSON output
    except Exception as e:
        print(e)
