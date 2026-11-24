// « Le livre » : les 4 parties, les unités, les leçons. Le prof débloque en écrivant dans « Suivi » ;
// ici on n'ouvre que les leçons faites. Une unité à la fois est dépliée (#/livre/U3).

import { esc, id, titre, ICONES, barreOnglets } from "../ui.js?v=61";
import { PARTIES } from "../livre.js?v=61";
import { etatLecon, uniteCourante, LECONS } from "../position.js?v=61";
import { controlePret } from "./controle.js?v=61";
import { carteLectures } from "./lectures.js?v=61";

function ligneLecon(l, pos) {
  const etat = etatLecon(l.id, pos);
  const nom = `<span class="nom">${id(l.id.replace(/^U\d+-/, ""))} · ${esc(l.titre)}</span>`;
  if (etat === "faite" || etat === "ici") {
    return `<li><a class="lecon ${etat}" href="#/lecon/${l.id}"><span class="point" aria-hidden="true"></span>${nom}${ICONES.chevron}</a></li>`;
  }
  const tag = etat === "prochaine" ? `<em>prochaine avec le prof</em>` : "";
  return `<li><span class="lecon ${etat}"><span class="point" aria-hidden="true"></span>${nom}${tag}</span></li>`;
}

function ligneControle(u, pos) {
  if (!u.controle) return "";
  const score = pos.controles[u.id];
  const etat = score === undefined ? "" : pos.controleReussi(u.id) ? "reussi" : "rate";
  const texte = score === undefined ? `Contrôle de l'unité ${u.n}` : `Contrôle de l'unité ${u.n} · ${score} %`;
  const losange = `<span class="losange" aria-hidden="true"></span><span class="nom">${texte}</span>`;
  // Dès que les leçons de l'unité sont faites, le losange ouvre le contrôle blanc (et le reste, pour réviser).
  if (controlePret(u, pos)) return `<li><a class="lecon controle ouvert ${etat}" href="#/controle/${u.id}">${losange}${ICONES.chevron}</a></li>`;
  return `<li><span class="lecon controle ${etat}">${losange}</span></li>`;
}

function unite(u, pos, ouverte, courante) {
  const faites = u.lecons.filter(l => pos.faites.has(l.id)).length;
  const finie = faites === u.lecons.length && (!u.controle || pos.controleReussi(u.id));
  const etat = finie ? "finie" : u.id === courante.id ? "now" : faites ? "" : "fog";
  const num = u.n ?? "N";
  const detail = u.dateFixe ? `${u.lecons.length} leçons · ${u.dateFixe}`
    : faites ? `${faites} leçon${faites > 1 ? "s" : ""} sur ${u.lecons.length}` : `${u.lecons.length} leçons`;
  const cible = ouverte ? "#/livre/-" : `#/livre/${u.id}`;
  return `<li class="unite ${etat}${ouverte ? " ouverte" : ""}" id="u-${u.id}">
      <a class="uh" href="${cible}" aria-expanded="${ouverte}">
        <span class="num">${finie ? ICONES.coche : num}</span>
        <span class="txt"><b>${titre(u.titre)}</b><span>${detail}</span></span>
      </a>
      ${ouverte ? `<p class="objectif">${esc(u.objectif)}</p><ul class="lecons">${u.lecons.map(l => ligneLecon(l, pos)).join("")}${ligneControle(u, pos)}</ul>` : ""}
    </li>`;
}

export function ecranLivre(ctx, cible) {
  const { pos } = ctx;
  const courante = uniteCourante(pos);
  const ouverte = cible === "-" ? null : cible || courante.id;
  return {
    onglet: "livre",
    apres: () => ouverte && cible && document.getElementById(`u-${ouverte}`)?.scrollIntoView({ block: "start" }),
    html: `<main class="colonne livre">
        <header class="haut"><h1>Le livre</h1><span class="sous">${pos.nbFaites} leçon${pos.nbFaites > 1 ? "s" : ""} sur ${LECONS.length}</span></header>
        ${carteLectures(ctx)}
        ${PARTIES.map(p => `<section class="partie" aria-label="Partie ${p.n}">
            <h2>Partie ${p.n} · ${titre(p.titre)}</h2>
            <ul>${p.unites.map(u => unite({ ...u, partie: p.n }, pos, u.id === ouverte, courante)).join("")}</ul>
          </section>`).join("")}
      </main>${barreOnglets("livre")}`,
  };
}
