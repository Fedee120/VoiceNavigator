import os

# Define las extensiones de archivo que consideras útiles
USEFUL_EXTENSIONS = {".py", ".js", ".html", ".css"}

def generate_prompt_from_directory(directory_path):
    # Inicializa el prompt con la jerarquía de carpetas completa, excluyendo carpetas que comienzan con "."
    prompt = "### Proyecto - Estructura Completa de Carpetas\n\n"
    for root, dirs, files in os.walk(directory_path):
        # Filtra las carpetas que comienzan con "."
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
        # Genera la estructura de jerarquía de carpetas
        level = root.replace(directory_path, "").count(os.sep)
        indent = '    ' * level
        folder_name = os.path.basename(root)
        prompt += f"{indent}- {folder_name}/\n"

        subindent = '    ' * (level + 1)
        for file_name in files:
            prompt += f"{subindent}- {file_name}\n"

    # Agrega una sección para los archivos útiles con sus contenidos
    prompt += "\n\n### Contenido de Archivos Útiles\n\n"
    
    for root, _, files in os.walk(directory_path):
        # Filtra las carpetas que comienzan con "."
        if any(part.startswith('.') for part in os.path.relpath(root, directory_path).split(os.sep)):
            continue

        # Crea una jerarquía con el nombre de la carpeta actual
        relative_path = os.path.relpath(root, directory_path)
        if relative_path != ".":
            prompt += f"\n## Carpeta: {relative_path}\n"
        
        for file_name in files:
            # Procesa solo los archivos con extensiones útiles
            file_extension = os.path.splitext(file_name)[1]
            if file_extension in USEFUL_EXTENSIONS:
                file_path = os.path.join(root, file_name)
                
                # Agrega el nombre del archivo
                prompt += f"\n### Archivo: {file_name}\n"
                
                # Lee y agrega el contenido del archivo
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    prompt += f"```\n{content}\n```\n"

    # Espacio para agregar instrucciones adicionales al final del prompt
    prompt += "\n### Instrucciones adicionales:\n\n"

    return prompt

# Uso del script
directory_path = './'
prompt = generate_prompt_from_directory(directory_path)

# Guarda el prompt en un archivo o úsalo como necesites
with open("generated_prompt.txt", "w", encoding='utf-8') as file:
    file.write(prompt)

print("Prompt generado y guardado en 'generated_prompt.txt'")
