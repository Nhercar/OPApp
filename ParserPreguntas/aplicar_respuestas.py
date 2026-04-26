from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

LETTER_TO_INDEX = {
    "A": 0,
    "B": 1,
    "C": 2,
    "D": 3,
}


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: Any) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="AarserPreguntasctualiza el campo 'correcta' en preguntas.json usando Respuestas.json"
    )
    parser.add_argument(
        "--preguntas",
        type=Path,
        default=Path("preguntas.json"),
        help="Ruta a preguntas.json",
    )
    parser.add_argument(
        "--respuestas",
        type=Path,
        default=Path("../PasrserRespuestas/Respuestas.json"),
        help="Ruta a Respuestas.json",
    )
    parser.add_argument(
        "--match-by",
        choices=["position", "id"],
        default="id",
        help=(
            "'position': usa el orden 1..N de preguntas; "
            "'id': usa el campo id de cada pregunta"
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="No guarda cambios, solo muestra resumen",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not args.preguntas.exists():
        raise FileNotFoundError(f"No existe: {args.preguntas}")
    if not args.respuestas.exists():
        raise FileNotFoundError(f"No existe: {args.respuestas}")

    preguntas_data = load_json(args.preguntas)
    respuestas_data = load_json(args.respuestas)

    if not isinstance(preguntas_data, list):
        raise ValueError("El preguntas.json debe ser una lista de preguntas")

    respuestas_map = respuestas_data.get("respuestas")
    if not isinstance(respuestas_map, dict):
        raise ValueError("Respuestas.json debe contener un objeto 'respuestas'")

    updated = 0
    missing = 0
    invalid_letter = 0

    for idx, pregunta in enumerate(preguntas_data, start=1):
        if not isinstance(pregunta, dict):
            continue

        if args.match_by == "id":
            key = str(pregunta.get("id"))
        else:
            key = str(idx)

        letter = respuestas_map.get(key)
        if letter is None:
            missing += 1
            continue

        letter = str(letter).strip().upper()
        if letter not in LETTER_TO_INDEX:
            invalid_letter += 1
            continue

        pregunta["correcta"] = LETTER_TO_INDEX[letter]
        updated += 1

    total = len(preguntas_data)

    print("Resumen:")
    print(f"- Total preguntas: {total}")
    print(f"- Actualizadas: {updated}")
    print(f"- Sin respuesta encontrada: {missing}")
    print(f"- Letra inválida: {invalid_letter}")
    print(f"- Modo de cruce: {args.match_by}")

    if args.dry_run:
        print("\nDry-run activado: no se han guardado cambios.")
        return

    backup_path = args.preguntas.with_suffix(args.preguntas.suffix + ".bak")
    backup_path.write_text(args.preguntas.read_text(encoding="utf-8"), encoding="utf-8")
    save_json(args.preguntas, preguntas_data)

    print(f"\nBackup creado en: {backup_path}")
    print(f"Archivo actualizado: {args.preguntas}")


if __name__ == "__main__":
    main()
