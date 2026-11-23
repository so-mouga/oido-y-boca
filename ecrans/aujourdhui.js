// L'accueil « Aujourd'hui » : en haut, la seule chose à faire maintenant (un bouton) ;
// dessous, « Ta journée », un simple suivi sans case à cocher : ✓ fait, point jaune = maintenant, rond vide = à venir.
// Chaque ligne se touche pour faire cette chose-là plutôt que celle de la carte.

import { esc, id, dateCourte, ICONES, barreOnglets } from "../ui.js?v=26";
import { cases, cocheCetteSemaine, niveauEcoute, derniereSauvegarde } from "../progression.js?v=26";
import { ECOUTES, MINUTES_ECOUTE } from "../ecoute.js?v=26";
import { EXERCICES } from "../exercices.js?v=26";
import { controlePret, dernierResultat } from "./controle.js?v=26";
import { motsDus, PAQUET } from "./pratique.js?v=26";

const HEURE_SOIR = 18; // « Ce soir avec Blanca » ne monte dans la carte qu'à partir de 18 h
const mots = n => `${n} mot${n > 1 ? "s" : ""}`;

// Une ligne de « Ta journée ». t : { titre, detail, fait, href, externe, cle (bouton « C'est fait ») }.
function ligne(t, ici) {
  const etat = t.fait ? "fait" : ici ? "maintenant" : "à venir";
  const point = `<span class="pt${t.fait ? " ok" : ici ? " ici" : ""}" role="img" aria-label="${etat}">${t.fait ? ICONES.coche : ""}</span>`;
  const detail = ici && !t.fait ? `${t.detail} · maintenant` : t.detail;
  const corps = `<span class="txt"><b>${esc(t.titre)}</b><span>${detail}</span></span>`;
  const lien = t.href
    ? `<a class="aller" href="${t.href}"${t.externe ? ' target="_blank" rel="noopener"' : ""}>${corps}${t.externe ? ICONES.sortie : ICONES.chevron}</a>`
    : `<span class="aller">${corps}</span>`;
  const bouton = t.cle && !t.fait ? `<button class="mini" data-cocher="${t.cle}">C'est fait</button>` : "";
  return `<li class="tache${t.fait ? " faite" : ""}${ici ? " ici" : ""}">${point}${lien}${bouton}</li>`;
}

// La carte du haut. a : la chose à faire maintenant ({ carte: { titre, texte, bouton, href | cle, extra } }),
// ou rien : en attente du soir, ou tout est fait.
function carte(a, { attenteSoir, controle }) {
  if (a) {
    const c = a.carte;
    const bouton = c.href
      ? `<a class="btn" href="${c.href}">${c.bouton}</a>`
      : `<button class="btn" data-cocher="${c.cle}">${c.bouton}</button>`;
    return `<section class="action" aria-labelledby="t-action">
        <span class="k">À faire maintenant</span>
        <h2 id="t-action">${c.titre}</h2>
        <p class="d">${c.texte}</p>
        ${c.extra || ""}
        ${bouton}
      </section>`;
  }
  if (attenteSoir) {
    return `<section class="action attente" aria-labelledby="t-action">
        <span class="k">Plus rien pour l'instant</span>
        <h2 id="t-action">À ce soir</h2>
        <p class="d">Ce soir avec Blanca, à partir de ${HEURE_SOIR} h.</p>
      </section>`;
  }
  return `<section class="action fini" aria-labelledby="t-action">
      <span class="k">C'est tout pour aujourd'hui</span>
      <h2 id="t-action">Bien joué</h2>
      <p class="d">${controle ? "Le contrôle blanc t'attend quand tu veux, avant le vrai contrôle avec le prof." : "Tu as tout fait. À demain !"}</p>
    </section>`;
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
  const leconDuJour = der && pos.dateFaite[der.id] === jour ? der : null;
  const finUnite = pro?.type === "contrôle" && der?.unite.id === pro.unite.id ? ` · fin de l'unité&nbsp;${pro.unite.n}` : "";

  const tete = der
    ? `<a class="tete" href="#/lecon/${der.id}">
        <h1>${esc(der.titre)}</h1>
        <p class="sous">${id(der.id)} · ${leconDuJour ? "faite ce matin avec le prof" : "ta dernière leçon"}${finUnite}</p>
      </a>`
    : `<div class="tete">
        <h1>Bienvenue</h1>
        <p class="sous">Ta première leçon se fait avec le prof${pro ? ` : ${id(pro.lecon.id)} · ${esc(pro.lecon.titre)}` : ""}.
          Ensuite, tu la retrouves ici pour la refaire et la pratiquer.</p>
      </div>`;

  // Ta journée, dans l'ordre. Seules les lignes avec « carte » peuvent monter dans la carte du haut.
  const journee = [];

  // 1. La leçon avec le prof : cochée toute seule grâce à « Suivi ». Cachée le week-end s'il n'y en a pas eu.
  const semaine = [1, 2, 3, 4, 5].includes(new Date(jour + "T12:00:00").getDay());
  if (pos.seanceDuJour || semaine) {
    journee.push({
      titre: "Leçon avec le prof", fait: pos.seanceDuJour,
      detail: pos.seanceDuJour ? (leconDuJour ? `${id(der.id)}, ce matin` : "séance notée aujourd'hui")
        : !pro ? "le livre est terminé" : pro.type === "contrôle" ? `contrôle de l'unité ${pro.unite.n}`
        : `${id(pro.lecon.id)} · ${esc(pro.lecon.titre)}`,
    });
  }

  // 2. La leçon du jour : les exercices de la leçon du matin. Cochée toute seule à la fin de la série.
  if (leconDuJour) {
    const r = c[`exos:${der.id}`];
    const ex = EXERCICES[der.id];
    const n = (motsParLecon[der.id] || []).length;
    const minutes = ex ? Math.round((ex.ecrire.length + ex.dire.length) * 0.6 + n * 0.25) : Math.max(1, Math.round(n * 0.25));
    const contenu = ex
      ? `${ex.ecrire.length} phrases à écrire, ${ex.dire.length} à dire, ${n} cartes`
      : `les ${n} cartes de la leçon`;
    journee.push({
      titre: "La leçon du jour", fait: !!r, href: `#/pratique/${der.id}/jour`,
      detail: r ? (r.sur ? `${r.ok} sur ${r.sur}` : "faite") : id(der.id),
      carte: { titre: `La leçon du jour · ${id(der.id)}`, texte: `${contenu} · environ ${minutes} min.`,
        bouton: "Commencer", href: `#/pratique/${der.id}/jour` },
    });
  }

  // 3. Tes mots à revoir : faite dès qu'un paquet est fini, ou s'il n'y a rien à revoir.
  if (der) {
    const dus = motsDus(ctx).length;
    const revus = Number(c.revision) || 0;
    journee.push({
      titre: "Tes mots à revoir", fait: revus > 0 || dus === 0, href: dus ? "#/revision" : null,
      detail: revus ? `${mots(revus)} revus${dus ? ` · encore ${dus} si tu veux` : ""}`
        : dus ? mots(dus) : "rien à revoir aujourd'hui",
      carte: { titre: "Tes mots à revoir",
        texte: dus > PAQUET ? `${dus} mots en attente. Un paquet de ${PAQUET} cartes, en commençant par les plus oubliés.`
          : `${mots(dus)} en attente, en commençant par les plus oubliés.`,
        bouton: "Commencer", href: "#/revision" },
    });
  }

  // 4. L'écoute : elle se fait dans une autre appli. La ligne l'ouvre, le bouton dit que c'est fait.
  const e = ECOUTES[niveauEcoute()];
  const plusDur = niveauEcoute() < ECOUTES.length - 1 ? `<button class="lien" data-trop-facile>Trop facile ?</button>` : "";
  journee.push({
    titre: `Écouter ${MINUTES_ECOUTE} min`, fait: !!c.ecoute, cle: "ecoute", href: e.lien, externe: true,
    detail: c.ecoute ? "fait" : `${esc(e.nom)}, ${esc(e.niveau)}`,
    carte: { titre: `Écouter ${MINUTES_ECOUTE} min`, texte: `${esc(e.nom)}, ${esc(e.niveau)}. Quand c'est fait, touche « C'est fait ».`,
      extra: `<p class="liens"><a class="lien" href="${e.lien}" target="_blank" rel="noopener">Ouvrir ${esc(e.nom)}</a>${plusDur}</p>`,
      bouton: "C'est fait", cle: "ecoute" },
  });

  // Une fois par semaine, le jour de ton choix : la ligne reste tant qu'elle n'est pas faite,
  // disparaît le reste de la semaine une fois faite, et revient le lundi.
  if (!cocheCetteSemaine(jour, "dimanche")) {
    journee.push({
      titre: "Ton écoute de la semaine", fait: !!c.dimanche, cle: "dimanche",
      detail: c.dimanche ? "envoyée" : "envoie-la au prof (le lien ou le texte)",
      carte: { titre: "Ton écoute de la semaine", texte: "Envoie-la au prof : le lien ou le texte.", bouton: "C'est fait", cle: "dimanche" },
    });
  }

  // 5. Ce soir avec Blanca : toujours dans la liste, dans la carte seulement à partir de 18 h.
  const leSoir = new Date().getHours() >= HEURE_SOIR;
  if (der) {
    const aUtiliser = (soir[der.id]?.kevin || der.soir || "").split(";")[0].trim();
    journee.push({
      titre: "Ce soir avec Blanca", fait: !!c.soir, cle: "soir", href: "#/soir",
      detail: c.soir ? "fait" : leSoir && aUtiliser ? esc(aUtiliser) : `à partir de ${HEURE_SOIR} h`,
      carte: leSoir ? { titre: "Ce soir avec Blanca", texte: aUtiliser ? `À utiliser : ${esc(aUtiliser)}.` : "Ta fiche du soir est prête.",
        bouton: "Ouvrir la fiche du soir", href: "#/soir" } : null,
    });
  }

  // Le contrôle blanc, quand les leçons de l'unité sont faites : une ligne de plus, à faire quand tu veux.
  const controle = pro?.type === "contrôle" && controlePret(pro.unite, pos);
  if (controle) {
    const r = dernierResultat(pro.unite.id);
    journee.push({
      titre: `Contrôle blanc · unité ${pro.unite.n}`, href: `#/controle/${pro.unite.id}`,
      detail: r ? `partie écrite ${esc(r)}` : "l'écrit, puis ta présentation",
    });
  }

  const maintenant = journee.find(t => t.carte && !t.fait);
  const attenteSoir = !maintenant && der && !c.soir && !leSoir;

  const bandeau = apercu
    ? `<p class="bandeau">Aperçu : leçons jusqu'à ${esc(apercu)} faites pour l'exemple. Rien n'est enregistré.</p>`
    : (ctx.horsLigne ? `<p class="bandeau">Sans réseau : copie du tableau du ${esc(ctx.luLe)}.</p>` : "") + rappelSauvegarde(jour);

  return {
    onglet: "jour",
    html: `<main class="colonne accueil">
        <p class="marque"><i></i>Oído y Boca</p>
        ${bandeau}
        ${tete}
        ${carte(maintenant, { attenteSoir, controle })}
        <section aria-labelledby="t-jour">
          <h2 id="t-jour">Ta journée</h2>
          <ul class="taches journee">${journee.map(t => ligne(t, t === maintenant)).join("")}</ul>
        </section>
        ${blocSauvegarde()}
      </main>${barreOnglets("jour")}`,
  };
}
