import os
import re
import base64
import io
import time
import concurrent.futures
import random
from openai import OpenAI  
from PIL import Image 
from ratelimit import limits, sleep_and_retry  

API_KEY = "[INSERT API KEY]"

PROMPT = """Given an image of this disaster, create a CSV filling out the following characteristics. Provide numeric estimates of events, or brief descriptions or yes/no. Do not be vague, and specify a reasonable number or number range. Do not include the information section if one exists for a certain parameter, and just the parameter with its value.

Parameter, Information:
Description, One sentence description of event
Disaster Type, Type of disaster (water, fire, earthquake, drought, demolition, etc.)
Region, Type of region (urban, rural, etc.)
Damaged Buildings, Number of damaged buildings
Damaged Vehicles, Number of damaged vehicles
Financial Burden, Financial cost of affected region (in USD)
Displaced People, number of displaced people
Recovery Personnel 
Equipment, What equipment is needed (water, food, cranes etc.)
Response Time
Disaster Cause
Medical Aid Needed
Insurance Claims, estimated cost of insurance claims
Weather

Make your first row the parameters, and the second row its values. Please output your csv in <csv></csv> tags.

Example of some image:
Description, Disaster Type, Region, Damaged Buildings, Damaged Vehicles, Financial Burden, Displaced People, Recovery Personnel, Equipment, Response Time, Disaster Cause, Medical Aid Needed, Insurance Claims, Weather
"Severe flooding caused by torrential rains", "Water", "Urban", 150, 30, $5000000, 2000, "Emergency services, volunteers", "Water, food, medical supplies, rescue boats", "8-22 hours", "Heavy rainfall", "Yes", 2000000, "Rainy"
"""

client = OpenAI(api_key=API_KEY)

def extractor(text, tag):
    pattern = rf"<{tag}>(.*?)</{tag}>"
    matches = re.findall(pattern, text, re.DOTALL)
    return matches[0].strip() if matches else text

def resize_image(image_path, max_size=(300, 300)):
    with Image.open(image_path) as im:
        im.thumbnail(max_size)
        buffered = io.BytesIO()
        im = im.convert("RGB")
        im.save(buffered, format="JPEG", quality=70)
        return buffered.getvalue()

def b64_local(image_path):
    image_data = resize_image(image_path)
    base64_encoded = base64.b64encode(image_data).decode('utf-8')
    return base64_encoded

def call_api(messages):
    return client.chat.completions.create(
        messages=messages,
        model="gpt-4o-mini",
    )

def process_image(image_number):
    image_path = f"fine-tuning/data/{image_number}.png"
    
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return

    csv_filename = f"fine-tuning/data/{image_number}.csv"
    if os.path.exists(csv_filename):
        return

    try:
        encoded_image = b64_local(image_path)
        messages = [
            {"role": "user", "content": encoded_image},
            {"role": "user", "content": PROMPT},
        ]
        
        max_attempts = 3
        for attempt in range(1, max_attempts + 1):
            try:
                response = call_api(messages)
                break
            except Exception as e:
                print(f"Error on attempt {attempt} for image {image_number}: {e}")
                time.sleep(2 ** attempt)
        else:
            print(f"Failed to process image {image_number} after {max_attempts} attempts.")
            return

        response_text = response.choices[0].message.content
        csv_content = extractor(response_text, "csv")
        with open(csv_filename, "w") as csv_file:
            csv_file.write(csv_content)
        print(f"Processed image {image_number} -> {csv_filename}")

    except Exception as e:
        print(f"Error processing image {image_number}: {e}")

def main():
    total_images = 1200
    max_workers = 10
    start_image = 107
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_image, i) for i in range(start_image, total_images + 1)]
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    main()
