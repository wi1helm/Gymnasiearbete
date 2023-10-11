import os
import json

# Function to format the name
def format_name(name):
    # Remove underscores and capitalize each word
    name = name.replace('_', ' ')
    name = ' '.join(word.capitalize() for word in name.split())
    return name

# Input folder path containing PNG files
input_folder = 'item'

# List to store the formatted data
formatted_data = []

# Loop through the PNG files in the folder
for filename in os.listdir(input_folder):
    if filename.endswith('.png'):
        # Extract the name (remove .png extension)
        name = filename[:-4]
        
        # Format the name
        formatted_name = format_name(name)
        
        # Create the data dictionary
        data = {"id": f"minecraft:{name}", "name": formatted_name}
        
        # Append to the formatted_data list
        formatted_data.append(data)

# Output JSON file path
output_file = 'minecraft_items.json'

# Write the formatted data to the JSON file
with open(output_file, 'w') as json_file:
    json.dump(formatted_data, json_file, indent=4)

print(f"Formatted data saved to {output_file}")
