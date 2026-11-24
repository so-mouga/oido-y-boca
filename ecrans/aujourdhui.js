// L'accueil « Aujourd'hui » : en haut, la seule chose à faire maintenant (un bouton) ;
// dessous, « Ta journée », un simple suivi sans case à cocher : ✓ fait, point jaune = maintenant, rond vide = à venir.
// Chaque ligne se touche pour faire cette chose-là plutôt que celle de la carte.

import { esc, id, dateCourte, ICONES, barreOnglets } from "../ui.js?v=58";
import { cases, niveauEcoute, derniereSauvegarde, fichesErreurs } from "../progression.js?v=58";
import { carnetActuel, cartesDuJour, faitesAujourdhui } from "../carnet.js?v=58";
import { ECOUTES, MINUTES_ECOUTE, SANS_TARRETER } from "../ecoute.js?v=58";
import { EXERCICES } from "../exercices.js?v=58";
import { controlePret, dernierResultat } from "./controle.js?v=58";
import { motsDus, PAQUET } from "./pratique.js?v=58";
import { BONUS } from "../bonus.js?v=58";
import { motsDeLaSemaine } from "./mesmots.js?v=58";
import { soirRepaso } from "./soir.js?v=58";
import { googleBranche, envoiRate } from "../sauvegarde-google.js?v=58";

const HEURE_SEANCE = "12 h"; // la séance orale du jeudi
const HEURE_SOIR = 18; // « Ce soir avec Blanca » ne monte dans la carte qu'à partir de 18 h
const mots = n => `${n} mot${n > 1 ? "s" : ""}`;

// Une ligne de « Ta journée ». t : { titre, detail, fait, href, externe, cle (bouton « C'est fait »), bouton (un autre bouton, en HTML) }.
function ligne(t, ici) {
  const etat = t.fait ? "fait" : ici ? "maintenant" : "à venir";
  const point = `<span class="pt${t.fait ? " ok" : ici ? " ici" : ""}" role="img" aria-label="${etat}">${t.fait ? ICONES.coche : ""}</span>`;
  const detail = ici && !t.fait ? `${t.detail} · maintenant` : t.detail;
  const corps = `<span class="txt"><b>${esc(t.titre)}</b><span>${detail}</span></span>`;
  const lien = t.href
    ? `<a class="aller" href="${t.href}"${t.externe ? ' target="_blank" rel="noopener"' : ""}>${corps}${t.externe ? ICONES.sortie : ICONES.chevron}</a>`
    : `<span class="aller">${corps}</span>`;
  const bouton = t.bouton ?? (t.cle && !t.fait ? `<button class="mini" data-cocher="${t.cle}">C'est fait</button>` : "");
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

// En bas, discret : la sauvegarde Google (automatique une fois branchée), et le fichier en secours.
function blocSauvegarde() {
  const le = derniereSauvegarde();
  const date = le ? `sauvegardée le ${esc(dateCourte(le))}` : "jamais sauvegardée";
  const etat = !googleBranche() ? date
    : envoiRate() ? `${date} · l'envoi à Google a échoué, l'appli réessaiera`
    : `${date} · automatique sur Google`;
  const google = googleBranche()
    ? `<button class="lien" data-google="restaurer">Restaurer depuis Google</button>
      <button class="lien" data-google="brancher">Changer le lien Google</button>`
    : `<button class="lien" data-google="brancher">Brancher la sauvegarde Google</button>`;
  const liens = `<div>${google}
      <button class="lien" data-sauvegarder>Sauvegarder dans un fichier</button>
      <button class="lien" data-restaurer>Restaurer depuis un fichier</button></div>`;
  // Une fois Google branché, tout est automatique : les liens ne servent qu'en cas de souci, on les replie.
  return `<section class="sauvegarde" aria-label="Ma progression">
      ${googleBranche()
        ? `<details><summary>Ma progression · ${etat} · <span>Options</span></summary>${liens}</details>`
        : `<p>Ma progression · ${etat}</p>${liens}`}
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
  // Le jeudi, c'est la séance orale (jeux de rôle, pas de nouvelle leçon) : la ligne propose de copier
  // tes mots depuis la dernière séance, à coller au début. La copie compte comme l'envoi (case « dimanche »).
  const numJour = new Date(jour + "T12:00:00").getDay();
  const semaine = [1, 2, 3, 4, 5].includes(numJour);
  if (numJour === 4) {
    const n = motsDeLaSemaine(jour).length;
    const copie = !!c.dimanche;
    journee.push({
      titre: "Séance orale avec le prof", fait: pos.seanceDuJour, href: "#/semaine",
      detail: pos.seanceDuJour ? "faite" : copie && n ? `${HEURE_SEANCE} · ${mots(n)} copié${n > 1 ? "s" : ""}, à coller au début`
        : `${HEURE_SEANCE} · jeux de rôle, pas de nouvelle leçon`,
      bouton: !n || pos.seanceDuJour ? "" : copie ? `<span class="mini copiee">Copié ✓</span>`
        : `<button class="mini" data-mm-copier>Copier ${mots(n)}</button>`,
    });
  } else if (pos.seanceDuJour || semaine) {
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
      // Faite : la ligne ouvre la page de la leçon (la refaire, ou « S'entraîner » si elle a un bonus).
      titre: "La leçon du jour", fait: !!r, href: r ? `#/lecon/${der.id}` : `#/pratique/${der.id}/jour`,
      detail: r ? `${r.sur ? `${r.ok} sur ${r.sur}` : "faite"}${BONUS[der.id] ? " · encore 6 si tu veux" : ""}` : id(der.id),
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

  // 3 bis. Mes erreurs (chantier 11) : les cartes du carnet du prof, 5 au plus par jour. Seulement si le carnet est déjà arrivé
  // (sauvegarde Google branchée, script à jour). Faite quand il ne reste rien à faire aujourd'hui.
  const carnet = carnetActuel();
  if (carnet && carnet.erreurs.length + carnet.phrases.length) {
    const fiches = fichesErreurs();
    const dues = cartesDuJour(carnet, fiches, jour);
    const faites = faitesAujourdhui(carnet, fiches, jour);
    const nE = dues.filter(x => x.type === "erreur").length, nP = dues.length - nE;
    const quoi = [nE && `${nE} à corriger`, nP && `${nP} phrase à dire`].filter(Boolean).join(", ");
    journee.push({
      titre: "Mes erreurs", fait: !dues.length, href: dues.length ? "#/erreurs" : null,
      detail: dues.length ? quoi : faites ? `${faites} carte${faites > 1 ? "s" : ""} faite${faites > 1 ? "s" : ""}` : "rien aujourd'hui",
      carte: { titre: "Mes erreurs",
        texte: `${nE ? `${nE} erreur${nE > 1 ? "s" : ""} notée${nE > 1 ? "s" : ""} par le prof, à corriger par écrit` : ""}${nE && nP ? ", et " : ""}${nP ? `${nE ? "t" : "T"}a phrase à redire` : ""}.`,
        bouton: "Commencer", href: "#/erreurs" },
    });
  }

  // 4. L'écoute : elle se fait dans une autre appli. La ligne l'ouvre, le bouton dit que c'est fait.
  const e = ECOUTES[niveauEcoute()];
  const plusDur = niveauEcoute() < ECOUTES.length - 1 ? `<button class="lien" data-trop-facile>Trop facile ?</button>` : "";
  journee.push({
    titre: `Écouter ${MINUTES_ECOUTE} min`, fait: !!c.ecoute, cle: "ecoute", href: e.lien, externe: true,
    detail: c.ecoute ? "fait" : `${esc(e.nom)}, ${esc(e.niveau)}`,
    carte: { titre: `Écouter ${MINUTES_ECOUTE} min`, texte: `${esc(e.nom)}, ${esc(e.niveau)}.${e.consigne ? ` ${esc(e.consigne)}` : ""} ${esc(SANS_TARRETER)}`,
      extra: `<p class="liens"><a class="lien" href="${e.lien}" target="_blank" rel="noopener">Ouvrir ${esc(e.nom)}</a>${plusDur}</p>`,
      bouton: "C'est fait", cle: "ecoute" },
  });

  // 5. Ce soir avec Blanca : toujours dans la liste, dans la carte seulement à partir de 18 h.
  const leSoir = new Date().getHours() >= HEURE_SOIR;
  if (der) {
    // Un soir de révision : la première chose à utiliser vient de la 1re leçon tirée.
    const repaso = soirRepaso(ctx);
    const aUtiliser = repaso ? (repaso.kevin[0]?.texte || "") : (soir[der.id]?.kevin || der.soir || "").split(";")[0].trim();
    journee.push({
      titre: "Ce soir avec Blanca", fait: !!c.soir, cle: "soir", href: "#/soir",
      detail: c.soir ? "fait" : leSoir && repaso ? "soir de révision" : leSoir && aUtiliser ? esc(aUtiliser) : `à partir de ${HEURE_SOIR} h`,
      carte: leSoir ? { titre: "Ce soir avec Blanca", texte: repaso ? "Soir de révision : 4 questions de tes anciennes leçons et un autre défi."
          : aUtiliser ? `À utiliser : ${esc(aUtiliser)}.` : "Ta fiche du soir est prête.",
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
