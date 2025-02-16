import os

def rename_images(folder_path):
    images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    images.sort()
    
    for index, image in enumerate(images, start=1):
        old_path = os.path.join(folder_path, image)
        new_path = os.path.join(folder_path, f"{index}.png")
        
        os.rename(old_path, new_path)
        print(f"Renamed {old_path} to {new_path}")

if __name__ == "__main__":
    folder = "data"
    if os.path.exists(folder):
        rename_images(folder)
    else:
        print(f"Folder '{folder}' does not exist.")
