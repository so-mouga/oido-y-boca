// Ce qui est en train de jouer : la voix du modèle (synthèse) ou ta voix enregistrée.
// Un seul son à la fois. Le bouton qui joue s'allume (barres de son qui bougent) ;
// le toucher à nouveau arrête la lecture ; il s'éteint tout seul à la fin.

import { dire, taire } from "./voix.js?v=17";
import { reecouterEnregistrement, arreterReecoute } from "./enregistrement.js?v=17";

let actif = null;

function allumer(bouton, oui) {
  bouton.classList.toggle("on", oui);
  bouton.setAttribute("aria-pressed", String(oui));
}

export function arreterLecture() {
  taire();
  arreterReecoute();
  if (actif) allumer(actif, false);
  actif = null;
}

export function lancerLecture(bouton) {
  arreterLecture();
  actif = bouton;
  allumer(bouton, true);
  const fin = () => { if (actif === bouton) { allumer(bouton, false); actif = null; } };
  const ok = "voix" in bouton.dataset ? reecouterEnregistrement(fin) : dire(bouton.dataset.dire, { fin });
  if (!ok) fin();
}

export function basculerLecture(bouton) {
  if (bouton === actif) arreterLecture();
  else lancerLecture(bouton);
}
