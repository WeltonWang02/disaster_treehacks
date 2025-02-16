export const IMAGE_CLASSIFICATION_PROMPT = `Given an image of this disaster, create a json filling out the following characteristics. Provide numeric estimates of events, or brief descriptions or yes/no. Do not be vague, and specify a reasonable number or number range. Do not include the information section if one exists for a certain parameter, and just the parameter with its value.

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

Make your first row the parameters, and the second row its values. Please output your json in <json></json> tags.

Example of some image:
Description, Disaster Type, Region, Damaged Buildings, Damaged Vehicles, Financial Burden, Displaced People, Recovery Personnel, Equipment, Response Time, Disaster Cause, Medical Aid Needed, Insurance Claims, Weather
"Severe flooding caused by torrential rains", "Water", "Urban", 150, 30, $5000000, 2000, "Emergency services, volunteers", "Water, food, medical supplies, rescue boats", "8-22 hours", "Heavy rainfall", "Yes", 2000000, "Rainy"`;

export const CACHE_TTL = 3600; // 1 hour in seconds 
