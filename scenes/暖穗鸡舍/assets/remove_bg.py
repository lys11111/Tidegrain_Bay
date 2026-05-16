import os
from PIL import Image

def remove_background(image_path, output_path, bg_color=(255, 255, 255)):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # threshold for white
    threshold = 240
    for item in datas:
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == '__main__':
    directory = '.'
    for filename in os.listdir(directory):
        if filename.endswith(".png"):
            print(f"Processing {filename}...")
            remove_background(os.path.join(directory, filename), os.path.join(directory, filename))
            
    print("Done!")
