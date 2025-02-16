import os
import shutil

# Set your source directory (current folder in this example) and destination folder.
source_folder = '.'  # Adjust if your files are elsewhere.
destination_folder = 'labeled'

# Create the destination folder if it doesn't exist.
if not os.path.exists(destination_folder):
    os.makedirs(destination_folder)

# Gather all file names in the source folder.
files = os.listdir(source_folder)

# Collect pairs of (number, png filename, csv filename) for files that have both.
pairs = []
for file in files:
    if file.endswith('.png'):
        # Extract the base name (assumes the filename is just a number, e.g. "123.png")
        base = file[:-4]  # remove '.png'
        csv_file = base + '.csv'
        if csv_file in files:
            try:
                num = int(base)  # Ensure the base is a valid number.
                pairs.append((num, file, csv_file))
            except ValueError:
                # Skip files where the base name isn't a number.
                continue

# Sort pairs based on the numeric value.
pairs.sort(key=lambda x: x[0])

# Copy each pair to the destination folder with new sequential numbering.
for i, (original_num, png_file, csv_file) in enumerate(pairs, start=1):
    new_png_name = f"{i}.png"
    new_csv_name = f"{i}.csv"
    shutil.copy2(os.path.join(source_folder, png_file), os.path.join(destination_folder, new_png_name))
    shutil.copy2(os.path.join(source_folder, csv_file), os.path.join(destination_folder, new_csv_name))

print(f"Copied {len(pairs)} labeled image pairs to '{destination_folder}' with sequential numbering.")
