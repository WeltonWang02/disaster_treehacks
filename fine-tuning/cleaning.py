import os
import json

# ------------- Configuration -------------
data_dir = "data"
output_json = "data.json"

prompt = """Given an image of this disaster, create a CSV filling out the following characteristics. Provide numeric estimates of events, or brief descriptions or yes/no. Do not be vague, and specify a reasonable number or number range. Do not include the information section if one exists for a certain parameter, and just the parameter with its value.

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

Make your first row the parameters, and the second row its values. Please output your csv in <csv></csv> tags."""

# ------------- Data Conversion -------------
data_entries = []

def sort_key(x):
    base = os.path.splitext(x)[0]
    if base.isdigit():
        return (0, int(base))
    return (1, x)

# Process files in sorted order (from 76 to 1200, assuming numeric names)
for file in sorted(os.listdir(data_dir), key=sort_key):
    if file.endswith(".png"):
        base_name = os.path.splitext(file)[0]
        png_path = os.path.join(data_dir, file)
        csv_path = os.path.join(data_dir, f"{base_name}.csv")
        if os.path.exists(csv_path):
            with open(csv_path, "r") as cf:
                csv_content = cf.read().strip()
            # Wrap CSV content in tags
            wrapped_csv = f"<csv>\n{csv_content}\n</csv>"
            entry = {
                "image": png_path,  # This path should be accessible during training
                "prompt": prompt,
                "response": wrapped_csv
            }
            data_entries.append(entry)
        else:
            print(f"Warning: CSV file for {file} not found.")

# Save the list of entries to a JSON file.
with open(output_json, "w") as out_f:
    json.dump(data_entries, out_f, indent=2)

print(f"Successfully saved {len(data_entries)} entries to {output_json}")
