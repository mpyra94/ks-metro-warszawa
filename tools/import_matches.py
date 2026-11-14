#!/usr/bin/env python3
"""Zamienia harmonogram meczowy z Excela na plik data/matches.json.

Użycie (w folderze projektu):
    pip install openpyxl            # tylko za pierwszym razem
    python3 tools/import_matches.py                       # czyta tools/HARMONOGRAM_MECZOWY.xlsx
    python3 tools/import_matches.py inny_plik.xlsx        # albo wskazany plik

Oczekiwany układ arkusza "ŁĄCZNIE" (pierwszy wiersz to nagłówki):
    kolejka | kategoria | zespol | data | godzina | (rola) | gospodarz | gość
Kolumna "data" musi zawierać datę (godzinę skrypt bierze z kolumny "godzina"
albo z samej daty). Puste wiersze są pomijane.

Pola wpisane ręcznie w panelu (miejsce, rozgrywki, wynik, uwagi) zostają
zachowane po ponownym imporcie, jeśli mecz ma ten sam termin i te same drużyny.
"""
import json
import re
import sys
from datetime import datetime, time
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_XLSX = ROOT / "tools" / "HARMONOGRAM_MECZOWY.xlsx"
OUT = ROOT / "data" / "matches.json"

CLUB = "metro"  # fragment nazwy naszych drużyn w kolumnach gospodarz / gość
CATEGORY = {"JUNIOR": "Juniorzy", "KADET": "Kadeci"}
KEEP = ("league", "venue", "result", "info")  # pola edytowane ręcznie


def clean(value):
    return str(value).strip() if value is not None else ""


def cell_time(value):
    if isinstance(value, datetime):
        return value.time()
    if isinstance(value, time):
        return value
    m = re.match(r"^(\d{1,2}):(\d{2})", clean(value))
    return time(int(m.group(1)), int(m.group(2))) if m else None


def squad(name):
    m = re.search(r"\b(I{1,3}|IV|V)\s*$", name)
    return m.group(1) if m else ""


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb["ŁĄCZNIE"] if "ŁĄCZNIE" in wb.sheetnames else wb.worksheets[0]

    old = {}
    if OUT.exists():
        for it in json.loads(OUT.read_text(encoding="utf-8")).get("items", []):
            old[(it.get("date"), it.get("home"), it.get("away"))] = it

    items = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        rnd, cat, _team, day, hour, _role, home, away = (list(row) + [None] * 8)[:8]
        home, away = clean(home), clean(away)
        if not isinstance(day, datetime) or not home or not away:
            continue
        when = datetime.combine(day.date(), cell_time(hour) or day.time())
        category = CATEGORY.get(clean(cat).upper(), clean(cat).title())
        ours = [n for n in (home, away) if CLUB in n.lower()]
        if len(ours) == 2:
            kind, team = "derby", f"{category} I i II"
        else:
            kind = "dom" if CLUB in home.lower() else "wyjazd"
            team = f"{category} {squad(ours[0]) if ours else ''}".strip()

        item = {
            "date": when.strftime("%Y-%m-%dT%H:%M"),
            "category": category,
            "team": team,
            "home": home,
            "away": away,
            "kind": kind,
            "league": "",
            "venue": "",
            "result": "",
            "info": "",
        }
        try:
            item["round"] = int(clean(rnd))
        except ValueError:
            pass
        prev = old.get((item["date"], home, away), {})
        for key in KEEP:
            if prev.get(key) and prev[key] != "Mecz wewnątrzklubowy":
                item[key] = prev[key]
        items.append(item)

    items.sort(key=lambda m: (m["date"], m["team"]))
    OUT.write_text(json.dumps({"items": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Zapisano {len(items)} meczów do {OUT}")


if __name__ == "__main__":
    main()
