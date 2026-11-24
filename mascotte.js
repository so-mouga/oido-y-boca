// Chispa, la mascotte de la Feria : une petite flamme, dessinée ici (rien à charger).
// humeur : "idle", "joie", "grimace". taille : 0 étincelle, 1 petite flamme, 2 belle flamme, 3 feu de joie avec ses bûches.
// En partie, la taille suit le combo (jeux.js, taille()). Le style et les animations sont dans jeux.css (.m).

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
const DESSIN = `<g class="buches"><rect x="26" y="100" width="68" height="12" rx="6" fill="#7A4A1E" transform="rotate(9 60 106)"/><rect x="26" y="100" width="68" height="12" rx="6" fill="#5C3512" transform="rotate(-9 60 106)"/></g>
  <g class="taille"><g class="danse">
    <path class="grand" d="M60 0C68 24 100 40 100 72A40 40 0 0 1 20 72C20 54 30 46 36 30 44 44 50 46 55 46 50 28 52 14 60 0Z" style="fill:var(--f1,#E2552B)"/>
    <g class="cotes" style="fill:var(--f1,#E2552B)"><g transform="translate(22 88) rotate(-20)">${LANGUE}</g><g transform="translate(98 88) rotate(20)">${LANGUE}</g></g>
    <g class="corps"><path d="M60 14C66 34 90 46 90 74A30 30 0 0 1 30 74C30 60 38 54 42 42 48 52 52 54 56 54 52 40 54 26 60 14Z" style="fill:var(--f2,#F0742B)"/>
    <path d="M60 46C68 56 78 64 78 80A18 18 0 0 1 42 80C42 68 52 60 60 46Z" style="fill:var(--f3,#FFC94A)"/>${VISAGE}</g>
  </g></g>`;

export const chispa = (humeur = "idle", taille = 1) =>
  `<span class="m" data-h="${humeur}" data-n="${taille}"><svg viewBox="0 0 120 120" aria-hidden="true">${DESSIN}</svg></span>`;
