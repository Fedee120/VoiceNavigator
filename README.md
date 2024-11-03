
# English Adventure Game

Este proyecto es un juego interactivo diseñado para enseñar inglés a través de comandos de voz. Los jugadores deben moverse en el tablero siguiendo comandos en inglés para recolectar objetos, que representan palabras específicas. Al recolectar un objeto, deben pronunciar correctamente su nombre en inglés para obtener puntos.

---

## Estructura del Proyecto

La estructura principal del proyecto es la siguiente:

```
/
├── .gitignore
├── README.md               # Este archivo
├── main.py                 # Archivo principal de Flask que ejecuta el servidor
├── requirements.txt        # Lista de dependencias de Python
├── templates/
│   └── index.html          # Archivo HTML principal para la interfaz del juego
├── static/
│   ├── css/
│   │   └── styles.css      # Estilos de la interfaz del juego
│   ├── js/
│   │   ├── chessboard.js   # Lógica de renderización del tablero
│   │   └── voice_control.js # Lógica de control de voz
│   ├── sounds/
│   │   └── move.mp3        # Efectos de sonido para el juego
│   └── images/             # Imágenes del tablero y de los objetos
└── words/
    ├── animals/            # Imágenes de palabras en la categoría "Animales"
    ├── food/               # Imágenes de palabras en la categoría "Comida"
    └── ...                 # Otras categorías de palabras
```

---

## Instalación y Configuración

### 1. Requisitos previos

Este proyecto utiliza Python y Flask para el backend, y JavaScript en el frontend para la lógica del tablero y el control de voz. Asegúrate de tener Python 3.x y `pip` instalados en tu entorno.

### 2. Instalación de dependencias

Para instalar las dependencias necesarias, ejecuta:

```bash
pip install -r requirements.txt
```

### 3. Archivos necesarios

Este proyecto depende de las imágenes de palabras organizadas en categorías dentro de la carpeta `words/`. Cada categoría tiene su propia subcarpeta, y las imágenes deben estar en formato `.png` o similar.

---

## Ejecución del Proyecto

Para ejecutar el servidor Flask y probar el juego localmente, usa:

```bash
python main.py
```

Esto iniciará un servidor en `http://127.0.0.1:5000/`, donde podrás acceder al juego en el navegador.

---

## Descripción de Archivos Clave

### 1. `main.py`

Este archivo es el núcleo de la aplicación. Configura un servidor Flask que proporciona rutas para:

- **`/`**: Renderiza la página principal (`index.html`).
- **`/generate_objects`**: Genera una nueva ronda de objetos en el tablero.
- **`/collect_object`**: Registra la posición de un objeto recolectado y verifica si el jugador pronuncia correctamente la palabra.
- **`/check_pronunciation`**: Verifica la pronunciación del jugador y otorga puntos si es correcta.

### 2. `index.html`

Este archivo HTML contiene la estructura de la interfaz del juego y está vinculado a los archivos CSS y JavaScript en `static/`.

### 3. `static/css/styles.css`

Define los estilos para la interfaz. Incluye estilos para el tablero, panel de información y el modal de fin de juego.

### 4. `static/js/chessboard.js`

Contiene la lógica de renderización del tablero de juego. Administra la creación de objetos en el tablero y la posición del personaje.

### 5. `static/js/voice_control.js`

Maneja el reconocimiento de voz. Escucha comandos de movimiento (por ejemplo, "up", "down") y verifica si el jugador pronuncia correctamente las palabras al recolectar un objeto. Incluye el método de reinicio manual para garantizar que el reconocimiento de comandos repetidos funcione sin problemas.

### 6. `words/`

Contiene imágenes organizadas en subcarpetas (por ejemplo, `animals/`, `food/`). Estas imágenes son los objetos que aparecen en el tablero.

---

## Funcionalidades Principales

### 1. Movimiento en el Tablero mediante Comandos de Voz

El jugador usa comandos en inglés ("up", "down", "left", "right") para mover el personaje. La clase `VoiceControl` en `voice_control.js` maneja el reconocimiento de voz y la traducción de comandos en acciones.

### 2. Pronunciación de Palabras

Cuando el jugador recolecta un objeto, el juego le muestra una palabra y espera que la pronuncie correctamente. Al pronunciarla bien, el jugador recibe puntos y el objeto desaparece del tablero.

### 3. Modal de Fin de Juego

Al recolectar todos los objetos de una ronda, aparece un modal que permite al jugador continuar jugando o finalizar. Este modal está en `index.html` y su estilo se encuentra en `styles.css`.

### 4. Saltar Palabras

Para facilitar el aprendizaje, el jugador puede saltar palabras difíciles con el botón "Saltar", sin obtener puntos.

---

## Continuación del Desarrollo

Para continuar el desarrollo de este proyecto, considera los siguientes puntos:

### 1. Mejorar la Precisión del Reconocimiento de Voz

El reconocimiento de voz actualmente usa la API de reconocimiento de voz del navegador. Puedes explorar opciones de reconocimiento de voz más avanzadas o integrar servicios como Google Speech-to-Text para mejorar la precisión.

### 2. Ampliar el Vocabulario

Actualmente, el vocabulario está limitado a las imágenes en la carpeta `words/`. Puedes añadir nuevas categorías y palabras para hacer el juego más completo.

### 3. Guardado de Progreso

Implementa una función que permita al jugador guardar su progreso y continuar en otro momento.

### 4. Mejora de la Interfaz

Considera mejorar la interfaz y la experiencia del usuario, incluyendo animaciones y sonidos adicionales.

## Defectos Conocidos

El objeto no puede moverse más de dos veces en una dirección sin tener que moverse en otra dirección antes de continuar en la dirección original. Esto probablemente se deba a cómo se extrae el siguiente comando del arreglo.

---

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor realiza un fork del repositorio, crea una rama para tus cambios y envía un pull request.

---

## Licencia

Este proyecto está bajo la Licencia Apache 2.0.
