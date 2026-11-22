#!/usr/bin/env python3
"""Recopie GUIDE_BLANCA.md dans l'appli (appli/guide.js), en HTML simple.

À relancer chaque fois que GUIDE_BLANCA.md change :
    python3 appli/outils/guide.py
"""
import html
import json
import re
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
SOURCE = RACINE / "GUIDE_BLANCA.md"
CIBLE = RACINE / "appli" / "guide.js"


def enligne(texte):
    t = html.escape(texte, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    return re.sub(r"\*(.+?)\*", r"<i>\1</i>", t)


morceaux, liste, tableau = [], None, None


def fermer():
    global liste, tableau
    if liste:
        morceaux.append(f"<{liste[0]}>" + "".join(f"<li>{x}</li>" for x in liste[1]) + f"</{liste[0]}>")
    if tableau:
        tete, *corps = tableau
        morceaux.append("<table><thead><tr>" + "".join(f"<th>{c}</th>" for c in tete) + "</tr></thead><tbody>"
                        + "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in corps) + "</tbody></table>")
    liste, tableau = None, None


for ligne in SOURCE.read_text(encoding="utf-8").splitlines():
    s = ligne.strip()
    if s.startswith("|"):
        cellules = [enligne(c.strip()) for c in s.strip("|").split("|")]
        if all(re.fullmatch(r":?-+:?", c) for c in cellules):
            continue
        if tableau is None:
            fermer()
            tableau = []
        tableau.append(cellules)
        continue
    if m := re.match(r"^(-|\d+\.) (.+)$", s):
        genre = "ul" if m[1] == "-" else "ol"
        if not liste or liste[0] != genre:
            fermer()
            liste = (genre, [])
        liste[1].append(enligne(m[2]))
        continue
    fermer()
    if not s:
        continue
    if s.startswith("# "):
        continue  # le titre est donné par l'écran
    if s.startswith("## "):
        morceaux.append(f"<h2>{enligne(s[3:])}</h2>")
    else:
        morceaux.append(f"<p>{enligne(s)}</p>")
fermer()

CIBLE.write_text(
    "// Le guide de Blanca, recopié de GUIDE_BLANCA.md par appli/outils/guide.py.\n"
    "// Ne pas modifier à la main : relancer le script quand le guide change.\n\n"
    "export const GUIDE_HTML = " + json.dumps("\n".join(morceaux), ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print(f"{len(morceaux)} blocs → {CIBLE.relative_to(RACINE)}")
