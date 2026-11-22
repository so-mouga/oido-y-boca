// L'accueil « Aujourd'hui » : ma dernière leçon, la liste du jour, et le livre sur le bord droit.

import { esc, md, id, titre, dateCourte, ICONES, barreOnglets } from "../ui.js?v=21";
import { UNITES, uniteCourante } from "../position.js?v=21";
import { cases, leconsARevoir, niveauEcoute, derniereSauvegarde } from "../progression.js?v=21";
import { ECOUTES, MINUTES_ECOUTE } from "../ecoute.js?v=21";
import { controlePret, dernierResultat } from "./controle.js?v=21";

function ligne({ cle, coche, auto, titre, detail, href, externe, extra = "", cls = "" }) {
  const caseHtml = auto
    ? `<span class="case${coche ? " on" : ""}" aria-label="${coche ? "fait" : "pas encore fait"}">${coche ? ICONES.coche : ""}</span>`
    : `<button class="case${coche ? " on" : ""}" data-cocher="${cle}" aria-pressed="${coche}" aria-label="Cocher : ${esc(titre)}">${coche ? ICONES.coche : ""}</button>`;
  const corps = `<span class="txt"><b>${esc(titre)}</b><span>${detail}</span></span>`;
  const lien = href
    ? `<a class="aller" href="${href}"${externe ? ' target="_blank" rel="noopener"' : ""}>${corps}${externe ? ICONES.sortie : ICONES.chevron}</a>`
    : `<span class="aller">${corps}</span>`;
  return `<li class="tache${coche ? " faite" : ""}${cls ? ` ${cls}` : ""}">${caseHtml}${lien}${extra}</li>`;
}

// La tranche du livre : 25 onglets d'unité, groupés par partie.
function tranche(pos) {
  const courante = uniteCourante(pos);
  const parPartie = [1, 2, 3, 4].map(n => UNITES.filter(u => u.partie === n && u.n));
  return `<nav class="tranche" aria-label="Les 25 unités du livre">${parPartie.map((us, i) =>
    `<span class="p">P${i + 1}</span>${us.map(u => {
      const finie = u.lecons.every(l => pos.faites.has(l.id)) && (!u.controle || pos.controleReussi(u.id));
      const etat = u.id === courante.id ? "now" : finie ? "fini" : u.lecons.some(l => pos.faites.has(l.id)) ? "" : "fog";
      return `<a class="tab ${etat}" href="#/livre/${u.id}" aria-label="Unité ${u.n} : ${titre(u.titre)}">${u.n}</a>`;
    }).join("")}`).join("")}</nav>`;
}

// En bas, discret : sauvegarder la progression dans un fichier, ou la reprendre depuis un fichier.
function blocSauvegarde() {
  const le = derniereSauvegarde();
  return `<section class="sauvegarde" aria-label="Ma progression">
      <p>Ma progression${le ? ` · sauvegardée le ${esc(dateCourte(le))}` : " · jamais sauvegardée"}</p>
      <div><button class="lien" data-sauvegarder>Sauvegarder</button>
      <button class="lien" data-restaurer>Restaurer depuis un fichier</button></div>
      <input type="file" accept=".json,application/json" data-fichier hidden>
    </section>`;
}

// Le rappel : sans sauvegarde depuis 7 jours (ou jamais), un bandeau en haut propose d'en faire une.
const RAPPEL_JOURS = 7;
function rappelSauvegarde(jour) {
  const le = derniereSauvegarde();
  const ecart = le ? Math.round((new Date(jour + "T12:00:00") - new Date(le + "T12:00:00")) / 86400000) : Infinity;
  if (ecart < RAPPEL_JOURS) return "";
  const quand = le ? `Ta dernière sauvegarde date d'il y a ${ecart} jours.` : "Ta progression n'a jamais été sauvegardée.";
  return `<p class="bandeau rappel">${quand} <button class="lien" data-sauvegarder>Sauvegarder</button></p>`;
}

export function ecranAujourdhui(ctx) {
  const { pos, soir, motsParLecon, jour, apercu } = ctx;
  const c = cases(jour);
  const der = pos.derniere;
  const pro = pos.prochaine;

  let tete;
  if (der) {
    const quand = pos.dateFaite[der.id] === jour ? "faite aujourd'hui avec le prof" : "ta dernière leçon";
    tete = `<a class="tete" href="#/lecon/${der.id}">
        <h1>${esc(der.titre)}</h1>
        <p class="sous">${id(der.id)} · ${quand}</p>
        <p class="unite">Unité ${der.unite.n ?? "Noël"} · ${titre(der.unite.titre)}</p>
      </a>
      <div class="cle"><span>La phrase clé</span>${md(der.phrase)}</div>`;
  } else {
    tete = `<div class="tete">
        <h1>Bienvenue</h1>
        <p class="sous">Ta première leçon se fait avec le prof : ${pro ? `${id(pro.lecon.id)} · ${esc(pro.lecon.titre)}` : ""}.</p>
        <p class="unite">Ensuite, tu la retrouves ici pour la refaire et la pratiquer.</p>
      </div>`;
  }

  const prof = pos.seanceDuJour
    ? { coche: true, detail: der ? `${id(der.id)} faite aujourd'hui` : "séance notée aujourd'hui" }
    : { coche: false, detail: !pro ? "Le livre est terminé" : pro.type === "contrôle"
        ? `Contrôle de l'unité ${pro.unite.n}` : `${id(pro.lecon.id)} · ${esc(pro.lecon.titre)}` };

  const taches = [ligne({ cle: "prof", auto: true, titre: "Leçon avec le prof", ...prof })];

  // Le contrôle approche : les leçons de l'unité sont faites, le prochain pas est le contrôle.
  if (pro?.type === "contrôle" && controlePret(pro.unite, pos)) {
    const r = dernierResultat(pro.unite.id);
    taches.push(ligne({ cle: "controle", auto: true, cls: "ctl", titre: "Préparer le contrôle",
      detail: r ? `Partie écrite ${esc(r)}` : "Contrôle blanc : l'écrit, puis ta présentation", href: `#/controle/${pro.unite.id}` }));
  }

  if (der) {
    const aReviser = leconsARevoir([...pos.faites], der.id, motsParLecon, jour);
    taches.push(aReviser.length
      ? ligne({ cle: "revision", coche: c.revision, titre: "Révision", detail: aReviser.map(id).join(" · "), href: "#/revision" })
      : ligne({ cle: "revision", coche: true, auto: true, titre: "Révision", detail: "Rien à revoir aujourd'hui" }));
  }

  const e = ECOUTES[niveauEcoute()];
  const plusDur = niveauEcoute() < ECOUTES.length - 1 ? `<button class="mini" data-trop-facile>Trop facile ?</button>` : "";
  taches.push(ligne({ cle: "ecoute", coche: c.ecoute, titre: `Écoute · ${MINUTES_ECOUTE} min`, detail: `${esc(e.nom)}, ${esc(e.niveau)}`, href: e.lien, externe: true, extra: plusDur }));

  if (der && soir[der.id]) {
    taches.push(ligne({ cle: "soir", coche: c.soir, titre: "Ce soir avec Blanca", detail: esc(soir[der.id].kevin.split(";")[0]), href: "#/soir" }));
  }
  if (new Date(jour + "T12:00:00").getDay() === 0) {
    taches.push(ligne({ cle: "dimanche", coche: c.dimanche, titre: "Ton écoute de la semaine", detail: "envoie-la au prof (le lien ou le texte)" }));
  }

  const bandeau = apercu
    ? `<p class="bandeau">Aperçu : leçons jusqu'à ${esc(apercu)} faites pour l'exemple. Rien n'est enregistré.</p>`
    : (ctx.horsLigne ? `<p class="bandeau">Sans réseau : copie du tableau du ${esc(ctx.luLe)}.</p>` : "") + rappelSauvegarde(jour);

  return {
    onglet: "jour",
    html: `<div class="accueil">
        <main class="colonne">
          <p class="marque"><i></i>Oído y Boca</p>
          ${bandeau}
          ${tete}
          <section aria-labelledby="t-jour">
            <h2 id="t-jour">Aujourd'hui</h2>
            <ul class="taches">${taches.join("")}</ul>
          </section>
          ${blocSauvegarde()}
        </main>
        ${tranche(pos)}
      </div>${barreOnglets("jour")}`,
  };
}
