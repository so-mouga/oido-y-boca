// Le clavier du téléphone. Selon le navigateur, Android raccourcit la page quand le clavier s'ouvre,
// ou bien la laisse entière et la fait glisser vers le haut : le haut (la phrase, le verbe) passe alors
// derrière le bord de l'écran. On suit donc la hauteur vraiment visible, au-dessus du clavier :
// - « --visible » (en px) : les écrans où l'on écrit (.ecrire-q) prennent cette hauteur, pas plus ;
// - la classe « clavier » sur <html> tant qu'il est ouvert : on cache ce qui ne sert pas pendant qu'on tape
//   (la barre « Quitter · 1/6 », la petite ligne « Entraînement · … ») pour garder la place à la phrase ;
// - la classe « deborde » sur une zone qui défile quand il reste du texte en dessous : un léger fondu le dit.

const vv = window.visualViewport;
let pleine = 0;   // la plus grande hauteur vue (clavier fermé), remise à zéro quand le téléphone tourne
let largeur = 0;

const estChamp = el => !!el?.matches?.('textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="button"]):not([type="submit"])');

export function marquerDebords() {
  for (const z of document.querySelectorAll(".defile, .tableau-q .grille")) {
    z.classList.toggle("deborde", z.scrollHeight - z.scrollTop - z.clientHeight > 2);
  }
}

function maj() {
  const h = Math.round(vv ? vv.height : innerHeight);
  if (innerWidth !== largeur) { largeur = innerWidth; pleine = 0; }
  pleine = Math.max(pleine, h);
  const ouvert = estChamp(document.activeElement) && h < pleine - 120;
  const racine = document.documentElement;
  racine.style.setProperty("--visible", `${h}px`);
  racine.classList.toggle("clavier", ouvert);
  // La page a glissé vers le haut pour montrer le champ : on la remet en place, le champ est déjà en vue.
  if (ouvert && document.querySelector(".ecrire-q") && (scrollY > 0 || (vv?.offsetTop ?? 0) > 0)) {
    requestAnimationFrame(() => scrollTo(0, 0));
  }
  requestAnimationFrame(marquerDebords);
}

export function suivreClavier() {
  vv?.addEventListener("resize", maj);
  vv?.addEventListener("scroll", maj);
  addEventListener("resize", maj);
  addEventListener("focusin", maj);
  addEventListener("focusout", () => setTimeout(maj, 50));
  addEventListener("scroll", e => { if (e.target.matches?.(".defile, .grille")) marquerDebords(); }, true);
  maj();
}
