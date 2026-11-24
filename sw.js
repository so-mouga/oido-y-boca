// Le service worker : garde l'appli sur le téléphone pour qu'elle s'ouvre sans réseau.
// Son numéro de version vient de son adresse (« sw.js?v=58 », écrite dans index.html) :
// passer les imports à la version suivante change cette adresse, le navigateur installe
// le nouveau service worker, qui remplace l'ancien et efface son cache. Rien à vider à la main.
// Le Google Sheet n'est pas concerné : donnees.js garde déjà sa propre copie.

const VERSION = new URL(location).searchParams.get("v") || "0";
const CACHE = `oyb-appli-v${VERSION}`;
const CACHE_POLICE = "oyb-police"; // Lexend ne change pas d'une version à l'autre

// ⚠ Tout fichier .js ou .css ajouté à l'appli doit être ajouté ici, sinon il manquera hors connexion.
const FICHIERS = [
  "app.js", "corriger.js", "donnees.js", "ecoute.js", "enregistrement.js", "exercices.js",
  "guide.js", "lecture.js", "livre.js", "position.js", "progression.js", "retours.js",
  "ui.js", "voix.js", "controles.js", "bonus.js", "dico.js", "sauvegarde-google.js", "verbes.js", "lectures.js", "clavier.js", "toucher.js", "jeux.js", "mascotte.js", "themes.js", "carnet.js", "style.css", "jeux.css",
  "ecrans/aujourdhui.js", "ecrans/controle.js", "ecrans/dico.js", "ecrans/lecon.js", "ecrans/mesmots.js", "ecrans/livre.js", "ecrans/pratique.js", "ecrans/soir.js", "ecrans/verbes.js", "ecrans/lectures.js", "ecrans/bulle.js", "ecrans/jeux.js", "ecrans/deux.js", "ecrans/caseta.js", "ecrans/chiringuito.js",
  "charla.js", "ecrans/charla.js", "charlas/index.js", "charlas/u01-05.js", "charlas/u06-10.js", "charlas/u11-15.js", "charlas/u16-20.js", "charlas/u21-25.js",
].map(f => `${f}?v=${VERSION}`);
const AUTRES = ["./", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-masquable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([...AUTRES, ...FICHIERS].map(f => new Request(f, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const nom of await caches.keys()) {
      if (nom !== CACHE && nom !== CACHE_POLICE) await caches.delete(nom);
    }
    await self.clients.claim();
  })());
});

// La page : le réseau d'abord (4 s au plus) pour avoir la dernière version publiée, sinon la copie.
async function page(requete) {
  const cache = await caches.open(CACHE);
  try {
    const rep = await Promise.race([
      fetch(requete),
      new Promise((_, non) => setTimeout(() => non(new Error("trop lent")), 4000)),
    ]);
    if (rep.ok) cache.put("./", rep.clone());
    return rep;
  } catch {
    return (await cache.match("./")) || Response.error();
  }
}

// Le reste : la copie d'abord, sinon le réseau (et on garde ce qu'il renvoie).
async function copieDabord(requete, nomCache) {
  const cache = await caches.open(nomCache);
  const copie = await cache.match(requete);
  if (copie) return copie;
  const rep = await fetch(requete);
  if (rep.ok || rep.type === "opaque") cache.put(requete, rep.clone());
  return rep;
}

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (r.mode === "navigate" && url.origin === location.origin) return e.respondWith(page(r));
  if (url.origin === location.origin) return e.respondWith(copieDabord(r, CACHE));
  if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") return e.respondWith(copieDabord(r, CACHE_POLICE));
  // Le reste (Google Sheet, liens d'écoute) passe sans être touché.
});
