import json
import re

def extraer_preguntas(ruta_txt):
    # 1. Leer el archivo
    with open(ruta_txt, "r", encoding="utf-8") as file:
        texto = file.read()

    # Limpiamos las etiquetas que a veces se cuelan en la lectura
    texto = re.sub(r'\'', '', texto)

    # 2. La magia de la Expresión Regular
    # Busca: Un número seguido de ".-", luego el texto hasta "a)", luego hasta "b)", etc.
    # El re.DOTALL permite que el script lea a través de los saltos de línea (enters)
    patron = r'(\d+)\.-(.*?)[aA]\)(.*?)[bB]\)(.*?)[cC]\)(.*?)[dD]\)(.*?)(?=\d+\.-|$)'
    
    coincidencias = re.findall(patron, texto, re.DOTALL)
    
    preguntas_json = []
    
    # 3. Formatear y limpiar los datos
    for match in coincidencias:
        id_pregunta = int(match[0].strip())
        
        # El truco " ".join(string.split()) elimina todos los saltos de línea 
        # y espacios dobles raros del PDF, dejando una frase limpia y continua.
        enunciado = " ".join(match[1].split())
        opcion_a = " ".join(match[2].split())
        opcion_b = " ".join(match[3].split())
        opcion_c = " ".join(match[4].split())
        opcion_d = " ".join(match[5].split())
        
        preguntas_json.append({
            "id": id_pregunta,
            "texto": enunciado,
            "opciones": [opcion_a, opcion_b, opcion_c, opcion_d],
            "correcta": None  # Lo dejamos vacío temporalmente
        })

    return preguntas_json

# Ejecutar
ruta_archivo = "ENFERMERIA_500_preguntas_cas.txt" 
datos = extraer_preguntas(ruta_archivo)

# Guardar en JSON
with open("preguntas.json", "w", encoding="utf-8") as f:
    json.dump(datos, f, ensure_ascii=False, indent=4)

print(f"¡Éxito total! Se han extraído {len(datos)} preguntas al archivo preguntas.json.")