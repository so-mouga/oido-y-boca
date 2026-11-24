// Chispa, la mascotte de la Feria : une petite flamme, dessinée ici (rien à charger).
// humeur : "idle", "joie", "grimace". taille : 0 étincelle, 1 petite flamme, 2 belle flamme, 3 feu de joie avec ses bûches.
// En partie, la taille suit le combo (jeux.js, taille()). couleur : l'étape de Chispa (0 naranja à 5 arcoíris, jeux.js, etape()),
// qui suit les mots « attrapés ». Le style et les animations sont dans jeux.css (.m).

const TRAIT = `fill="none" stroke="#13294B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
const oeil = dx => `<g class="oeil"><ellipse cx="${dx}" cy="0" rx="3.6" ry="4.6" fill="#13294B"/><circle cx="${dx + 1.2}" cy="-1.6" r="1.2" fill="#fff"/></g>`;
const VISAGE = `<g transform="translate(60 80) scale(.8)">
  <g class="yn">${oeil(-11)}${oeil(11)}</g>
  <g class="yj"><path d="M-16 1q5-8 10 0M6 1q5-8 10 0" ${TRAIT}/></g>
  <g class="yg"><path d="M-16-4l8 4-8 4M16-4l-8 4 8 4" ${TRAIT}/></g>
  <path class="bn" d="M-6 10q6 6 12 0" ${TRAIT}/>
  <g class="bj"><path d="M-9 8h18q0 12-9 12t-9-12z" fill="#13294B"/><path d="M-4 16q4-4 8 0q-4 4-8 0z" fill="#D8472A"/></g>
  <path class="bg" d="M-9 13q3-5 6 0t6 0t6 0" ${TRAIT}/>
</g>`;
const LANGUE = `<path d="M0-24C8-11 12-4 12 4A12 12 0 0 1-12 4C-12-4-6-11 0-24Z"/>`;

// Les 6 couleurs : le bord, le corps, le cœur de la flamme. La dernière, arcoíris, a un corps en dégradé.
const COULEURS = [
  ["#E2552B", "#F0742B", "#FFC94A"], ["#A82A12", "#D8472A", "#FF9B54"], ["#8E1F5C", "#C2327E", "#FFB3D1"],
  ["#4B2A7A", "#7A4FC0", "#DCC4FF"], ["#0B4F8A", "#1F7FD1", "#9BE0FF"], ["#7A3F8F", "arc", "#FFF6E0"],
];
let n = 0; // chaque dégradé a son propre nom dans la page

export function chispa(humeur = "idle", taille = 1, couleur = 0) {
  const [bord, corps, coeur] = COULEURS[couleur] || COULEURS[0];
  const arc = corps === "arc" ? `chispa-arc-${++n}` : "";
  const defs = arc ? `<defs><linearGradient id="${arc}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D8472A"/><stop offset=".35" stop-color="#F7B91C"/><stop offset=".65" stop-color="#0F8A83"/><stop offset="1" stop-color="#1F7FD1"/></linearGradient></defs>` : "";
  const fCorps = arc ? `url(#${arc})` : corps;
  return `<span class="m" data-h="${humeur}" data-n="${taille}" data-couleur="${couleur}"><svg viewBox="0 0 120 120" aria-hidden="true">${defs}
  <g class="buches"><rect x="26" y="100" width="68" height="12" rx="6" fill="#7A4A1E" transform="rotate(9 60 106)"/><rect x="26" y="100" width="68" height="12" rx="6" fill="#5C3512" transform="rotate(-9 60 106)"/></g>
  <g class="taille"><g class="danse">
    <path class="grand" d="M60 0C68 24 100 40 100 72A40 40 0 0 1 20 72C20 54 30 46 36 30 44 44 50 46 55 46 50 28 52 14 60 0Z" fill="${bord}"/>
    <g class="cotes" fill="${bord}"><g transform="translate(22 88) rotate(-20)">${LANGUE}</g><g transform="translate(98 88) rotate(20)">${LANGUE}</g></g>
    <g class="corps"><path d="M60 14C66 34 90 46 90 74A30 30 0 0 1 30 74C30 60 38 54 42 42 48 52 52 54 56 54 52 40 54 26 60 14Z" fill="${fCorps}"/>
    <path d="M60 46C68 56 78 64 78 80A18 18 0 0 1 42 80C42 68 52 60 60 46Z" fill="${coeur}"/>${VISAGE}</g>
  </g></g></svg></span>`;
}
