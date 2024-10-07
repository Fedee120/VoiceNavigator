import random
from flask import Flask, render_template, jsonify, request, send_from_directory
import os

app = Flask(__name__)

# Game state
objects = []
score = 0
current_word = ""

# Get all image files from the words directory and its subdirectories
words_dir = 'words'
image_files = []

for root, dirs, files in os.walk(words_dir):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            image_files.append(os.path.relpath(os.path.join(root, file), words_dir))

print(f"Found image files: {image_files}")  # Debugging line

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/words/<path:filename>")
def serve_image(filename):
    return send_from_directory('words', filename)

@app.route("/generate_objects", methods=['POST'])
def generate_objects():
    global objects
    objects = []
    if not image_files:
        print("No image files found in the 'words' directory")
        return jsonify([])
    
    for _ in range(min(5, len(image_files))):
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
    if data is None:
        return jsonify({'success': False, 'error': 'Invalid JSON data'})
    
    knight_x, knight_y = data.get('x'), data.get('y')
    if knight_x is None or knight_y is None:
        return jsonify({'success': False, 'error': 'Invalid knight position'})
    
    for obj in objects:
        if obj['x'] == knight_x and obj['y'] == knight_y:
            current_word = os.path.splitext(os.path.basename(obj['image']))[0]  # Remove file extension and path
            objects.remove(obj)
            print(f"Collected object: {current_word}")  # Debugging line
            return jsonify({'success': True, 'word': current_word})
    
    return jsonify({'success': False})

@app.route("/check_pronunciation", methods=['POST'])
def check_pronunciation():
    global score, current_word
    data = request.json
    if data is None or 'word' not in data:
        return jsonify({'correct': False, 'error': 'Invalid JSON data'})
    
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
