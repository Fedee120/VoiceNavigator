import random
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Game state
objects = []
score = 0
current_word = ""

# Word list with difficulties
word_list = {
    'easy': ['cat', 'dog', 'hat', 'ball', 'tree'],
    'medium': ['elephant', 'computer', 'bicycle', 'umbrella', 'guitar'],
    'hard': ['xylophone', 'cryptocurrency', 'paradigm', 'juxtaposition', 'serendipity']
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
        word = random.choice(word_list[difficulty])
        x = random.randint(0, 7)
        y = random.randint(0, 7)
        objects.append({'word': word, 'x': x, 'y': y, 'difficulty': difficulty})
    return jsonify(objects)

@app.route("/collect_object", methods=['POST'])
def collect_object():
    global objects, current_word
    data = request.json
    knight_x, knight_y = data['x'], data['y']
    
    for obj in objects:
        if obj['x'] == knight_x and obj['y'] == knight_y:
            current_word = obj['word']
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
