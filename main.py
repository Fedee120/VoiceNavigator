import random
from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

# Game state
objects = []
score = 0
current_word = ""

# Get all image files from the static/images directory
image_files = [f for f in os.listdir('static/images') if f.endswith('.png')]
print(f"Found image files: {image_files}")  # Debugging line

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate_objects", methods=['POST'])
def generate_objects():
    global objects
    objects = []
    for _ in range(5):
        image = random.choice(image_files)
        x = random.randint(0, 7)
        y = random.randint(0, 7)
        objects.append({'image': image, 'x': x, 'y': y})
    print(f"Generated objects: {objects}")  # Debugging line
    return jsonify(objects)

@app.route("/collect_object", methods=['POST'])
def collect_object():
    global objects, current_word
    data = request.json
    knight_x, knight_y = data['x'], data['y']
    
    for obj in objects:
        if obj['x'] == knight_x and obj['y'] == knight_y:
            current_word = obj['image'].split('.')[0]  # Remove file extension
            objects.remove(obj)
            print(f"Collected object: {current_word}")  # Debugging line
            return jsonify({'success': True, 'word': current_word})
    
    return jsonify({'success': False})

@app.route("/check_pronunciation", methods=['POST'])
def check_pronunciation():
    global score, current_word
    data = request.json
    pronounced_word = data['word'].lower()
    
    if pronounced_word == current_word.lower():
        score += 1
        print(f"Correct pronunciation: {pronounced_word}")  # Debugging line
        return jsonify({'correct': True, 'score': score})
    else:
        print(f"Incorrect pronunciation: {pronounced_word}, expected: {current_word}")  # Debugging line
        return jsonify({'correct': False, 'score': score})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
