from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def shift_answer_key(items: list[dict[str, Any]], start_id: int = 309, end_id: int = 499) -> None:
    positions = {int(item["id"]): index for index, item in enumerate(items) if "id" in item}

    for current_id in range(start_id, end_id + 1):
        current_index = positions.get(current_id)
        next_index = positions.get(current_id + 1)

        if current_index is None or next_index is None:
            continue

        items[current_index]["correcta"] = items[next_index].get("correcta")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Shift correct answers so pregunta(i) takes correcta(i+1) for a given id range."
    )
    parser.add_argument("input", type=Path, help="Path to the source JSON file")
    parser.add_argument("output", type=Path, help="Path to the output JSON file")
    parser.add_argument("--start-id", type=int, default=309, help="First question id to update")
    parser.add_argument("--end-id", type=int, default=499, help="Last question id to update")
    args = parser.parse_args()

    raw = args.input.read_text(encoding="utf-8")
    items = json.loads(raw)

    if not isinstance(items, list):
        raise ValueError("The input JSON must be a list of question objects.")

    shift_answer_key(items, start_id=args.start_id, end_id=args.end_id)

    args.output.write_text(
        json.dumps(items, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
