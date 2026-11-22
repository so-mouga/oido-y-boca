#!/usr/bin/env python3
"""Recopie la structure du livre (PROGRAMME.md) dans l'appli : appli/livre.js.

À relancer chaque fois que PROGRAMME.md change :
    python3 appli/outils/livre.py
"""
import json
import re
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
SOURCE = RACINE / "PROGRAMME.md"
CIBLE = RACINE / "appli" / "livre.js"

parties, partie, unite = [], None, None

for ligne in SOURCE.read_text(encoding="utf-8").splitlines():
    if m := re.match(r"^# Partie (\d+) : (.+)$", ligne):
        partie = {"n": int(m[1]), "titre": m[2].strip(), "unites": []}
        parties.append(partie)
        unite = None
    elif m := re.match(r"^## Unité (\d+) : (.+)$", ligne):
        unite = {"id": f"U{m[1]}", "n": int(m[1]), "titre": m[2].strip(), "objectif": "", "lecons": [], "controle": ""}
        partie["unites"].append(unite)
    elif m := re.match(r"^## Unité à date fixe : (.+?)(?: \(.*\))?$", ligne):
        unite = {"id": "Noël", "n": None, "titre": m[1].strip(), "objectif": "", "lecons": [], "controle": "", "dateFixe": "semaine du 21 déc."}
        partie["unites"].append(unite)
    elif ligne.startswith("## "):
        unite = None  # bilan de partie, bilan final…
    elif unite is None:
        continue
    elif m := re.match(r"^\*\*Objectif :\*\* « (.+) »$", ligne):
        unite["objectif"] = m[1]
    elif m := re.match(r"^### ((?:U\d+|Noël)-L\d+) : (.+)$", ligne):
        unite["lecons"].append({"id": m[1], "titre": m[2].strip(), "grammaire": "", "phrase": "", "soir": ""})
    elif m := re.match(r"^- \*\*(Grammaire|Phrase clé|Ce soir)\*\* : (.+)$", ligne):
        cle = {"Grammaire": "grammaire", "Phrase clé": "phrase", "Ce soir": "soir"}[m[1]]
        valeur = m[2].strip()
        if cle == "phrase":
            valeur = valeur.strip("*")
        unite["lecons"][-1][cle] = valeur
    elif m := re.match(r"^\*\*➜ Contrôle de l'unité \d+\*\* : (.+)$", ligne):
        unite["controle"] = m[1]

nb = sum(len(u["lecons"]) for p in parties for u in p["unites"])
entete = (
    "// Le livre : structure recopiée de PROGRAMME.md par appli/outils/livre.py.\n"
    "// Ne pas modifier à la main : relancer le script quand le programme change.\n\n"
)
CIBLE.write_text(entete + "export const PARTIES = " + json.dumps(parties, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
print(f"{len(parties)} parties, {sum(len(p['unites']) for p in parties)} unités, {nb} leçons → {CIBLE.relative_to(RACINE)}")
