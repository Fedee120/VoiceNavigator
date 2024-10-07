from PIL import Image, ImageDraw, ImageFont
import os

def create_image(filename, text, color):
    img = Image.new('RGB', (100, 100), color=color)
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((100 - text_width) / 2, (100 - text_height) / 2)
    draw.text(position, text, fill="black", font=font)
    
    if not os.path.exists('static/images'):
        os.makedirs('static/images')
    
    img.save(f'static/images/{filename}')
    print(f"Created {filename}")

create_image("easy.png", "Easy", "green")
create_image("medium.png", "Medium", "yellow")
create_image("hard.png", "Hard", "red")

print("All images created successfully.")
