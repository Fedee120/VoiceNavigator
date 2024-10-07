import random
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Game state
objects = []
score = 0
current_word = ""

# Image filenames with difficulties
image_files = {
    'easy': ['cat.png', 'dog.png', 'hat.png', 'ball.png', 'tree.png'],
    'medium': ['elephant.png', 'computer.png', 'bicycle.png', 'umbrella.png', 'guitar.png'],
    'hard': ['xylophone.png', 'cryptocurrency.png', 'paradigm.png', 'juxtaposition.png', 'serendipity.png']
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate_objects", methods=['POST'])
def generate_objects():
    global objects
    objects = []
    for _ in range(5):
        difficulty = random.choice(['easy', 'medium', 'hard'])
        image = random.choice(image_files[difficulty])
        x = random.randint(0, 7)
        y = random.randint(0, 7)
        objects.append({'image': image, 'x': x, 'y': y, 'difficulty': difficulty})
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
            return jsonify({'success': True, 'word': current_word})
    
    return jsonify({'success': False})

@app.route("/check_pronunciation", methods=['POST'])
def check_pronunciation():
    global score, current_word
    data = request.json
    pronounced_word = data['word'].lower()
    
    if pronounced_word == current_word.lower():
        score += 1
        return jsonify({'correct': True, 'score': score})
    else:
        return jsonify({'correct': False, 'score': score})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
