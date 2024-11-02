import random
from flask import Flask, render_template, jsonify, request, send_from_directory
import os

app = Flask(__name__)

# Estado del juego
objects = []
score = 0
current_word = ""

# Obtener todos los archivos de imagen del directorio 'words' y sus subdirectorios
words_dir = 'words'
image_files = []

for root, dirs, files in os.walk(words_dir):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            relative_path = os.path.relpath(os.path.join(root, file), words_dir)
            image_files.append(relative_path)

print(f"Found image files: {image_files}")  # Línea de depuración

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
    
    # Copiar image_files a una lista local
    available_images = image_files.copy()
    positions = []
    num_objects = min(5, len(image_files))
    for _ in range(num_objects):
        image = random.choice(available_images)
        available_images.remove(image)  # Asegurarse de no elegir la misma imagen nuevamente

        # Generar una posición única
        while True:
            x = random.randint(0, 7)
            y = random.randint(0, 7)
            if (x, y) not in positions and not (x == 0 and y == 0):  # Evitar la posición inicial
                positions.append((x, y))
                break

        # Extraer la palabra del nombre del archivo de imagen
        word = os.path.splitext(os.path.basename(image))[0]  # Eliminar la extensión
        objects.append({'image': image, 'x': x, 'y': y, 'word': word})
    
    print(f"Generated objects: {objects}")  # Línea de depuración
    return jsonify(objects)

@app.route('/check_for_object', methods=['POST'])
def check_for_object():
    global current_word
    position = request.get_json()
    x = position.get('x')
    y = position.get('y')

    # Buscar si hay un objeto en la posición
    for obj in objects:
        if obj['x'] == x and obj['y'] == y:
            current_word = obj['word']
            return jsonify({'success': True, 'word': current_word})

    current_word = ""  # Reiniciar current_word si no hay objeto
    return jsonify({'success': False})

@app.route("/check_pronunciation", methods=['POST'])
def check_pronunciation():
    global score, current_word, objects
    data = request.json
    if data is None or 'word' not in data:
        return jsonify({'correct': False, 'error': 'Invalid JSON data'})
    
    pronounced_word = data['word'].strip().lower()
    expected_word = current_word.strip().lower()
    
    if pronounced_word == expected_word and expected_word != "":
        score += 1
        print(f"Correct pronunciation: {pronounced_word}")  # Línea de depuración
        
        # Eliminar el objeto con current_word de objects
        objects = [obj for obj in objects if obj['word'].lower() != expected_word]
        
        # Reiniciar current_word
        current_word = ""
        
        return jsonify({'correct': True, 'score': score})
    else:
        print(f"Incorrect pronunciation: {pronounced_word}, expected: {current_word}")  # Línea de depuración
        return jsonify({'correct': False, 'score': score})
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
