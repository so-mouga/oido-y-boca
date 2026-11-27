// « Uno de dos » : la 3e forme des missions du jour (chantier 12 bis, maquette .impeccable/mocks/missions/duos.html).
// Une phrase à trou, deux camions : on touche le bon mot. Chaque duo a sa petite carte « La règle » (la première fois),
// et ses phrases écrites à la main.
//
// Le format d'une phrase : [espagnol avec {a|b}, la bonne (0 = a, 1 = b), le français, le mot nouveau (facultatif)].
// Règles d'écriture (décidées avec Kevin, Q12-9 à Q12-14) :
// - UNE SEULE bonne réponse possible : jamais « la paella {es|está} rica » (les deux sont justes).
// - Le français dit ce qui manque (demain ou le matin, ce lundi ou tous les lundis).
// - Les mots de Kevin (le Sheet) ; au plus un mot nouveau par phrase, avec son sens (« regalo = cadeau »).
// - Seulement sa vraie vie et sa vraie famille (Blanca, Léo, Dorian ; le mariage le samedi 19 juin 2027 ; le prof du lundi au vendredi).
// - por / para : seulement les cas nets (para + qui reçoit, para + un but, por + moment de la journée, gracias por, por favor).
// lecon : la leçon qui ouvre le duo (null = ouvert tout de suite, décidé avec Kevin : la Feria sert aussi à découvrir).
// À faire relire par Blanca.

export const DUOS = [
  {
    id: "ser", court: "ser o estar", nom: "être : ser ou estar", lecon: null,
    carte: ["<i>ser</i> : ce qu'on <b>est</b> : la nationalité, qui on est, ce qu'est une chose.", "<i>estar</i> : <b>où</b> on est, <b>comment</b> on va."],
    ex: ["Soy francés.", "Estoy en casa."],
    regle: ["<i>ser</i> : ce qu'on est (la nationalité, qui on est, ce qu'est une chose).", "<i>estar</i> : où on est, comment on va."],
    phrases: [
      ["Yo {soy|estoy} francés.", 0, "Je suis français."],
      ["Blanca {es|está} española.", 0, "Blanca est espagnole.", "española = espagnole"],
      ["Mi despacho {es|está} en casa.", 1, "Mon bureau est à la maison."],
      ["Hoy {soy|estoy} en el pueblo.", 1, "Aujourd'hui, je suis au village."],
      ["Huesca {es|está} una ciudad.", 0, "Huesca est une ville."],
      ["Mi jefe {es|está} en Francia.", 1, "Mon chef est en France."],
      ["¿Dónde {es|está} tu piso?", 1, "Où est ton appartement ?", "dónde = où"],
      ["Mi piso {es|está} en Huesca.", 1, "Mon appartement est à Huesca."],
      ["Hoy {soy|estoy} cansado.", 1, "Aujourd'hui, je suis fatigué.", "cansado = fatigué"],
      ["Dorian {es|está} el hijo de Blanca.", 0, "Dorian est le fils de Blanca.", "hijo = fils"],
      ["Léo {es|está} en casa con Blanca.", 1, "Léo est à la maison avec Blanca."],
      ["El ordenador {es|está} en el despacho.", 1, "L'ordinateur est dans le bureau."],
      ["{Soy|Estoy} el novio de Blanca.", 0, "Je suis le fiancé de Blanca.", "novio = fiancé"],
    ],
  },
  {
    id: "quecual", court: "qué o cuál", nom: "quel : qué ou cuál", lecon: null,
    carte: ["<i>qué</i> devant un <b>nom</b> ou un <b>verbe</b> : <i>¿qué hora?</i>, <i>¿qué significa?</i>", "<i>cuál</i> devant <i>es / son</i>, pour demander <b>lequel</b> : ton nom, ton numéro…"],
    ex: ["¿Qué hora es?", "¿Cuál es tu apellido?"],
    regle: ["<i>qué</i> devant un nom ou un verbe.", "<i>cuál</i> devant <i>es</i>, pour demander lequel (ton nom, ton numéro…)."],
    phrases: [
      ["¿{Qué|Cuál} es tu apellido?", 1, "Quel est ton nom de famille ?"],
      ["¿{Qué|Cuál} hora es?", 0, "Quelle heure est-il ?"],
      ["¿{Qué|Cuál} es tu número de teléfono?", 1, "Quel est ton numéro de téléphone ?"],
      ["¿{Qué|Cuál} día es hoy?", 0, "Quel jour sommes-nous ?"],
      ["¿En {qué|cuál} barrio vives?", 0, "Dans quel quartier tu habites ?"],
      ["¿{Qué|Cuál} es la fecha de la boda?", 1, "Quelle est la date du mariage ?"],
      ["¿En {qué|cuál} empresa trabajas?", 0, "Dans quelle entreprise tu travailles ?"],
      ["¿{Qué|Cuál} es el precio?", 1, "Quel est le prix ?"],
      ["¿{Qué|Cuál} es tu nombre?", 1, "Quel est ton prénom ?"],
      ["¿{Qué|Cuál} significa «piso»?", 0, "Que veut dire « piso » ?"],
      ["¿{Qué|Cuál} comes hoy?", 0, "Qu'est-ce que tu manges aujourd'hui ?"],
    ],
  },
  {
    id: "muy", court: "muy o mucho", nom: "très, beaucoup : muy ou mucho", lecon: null,
    carte: ["<i>muy</i> devant un <b>adjectif</b> ou un adverbe : <i>muy bonito</i>, <i>muy rápido</i>.", "<i>mucho</i> devant un <b>nom</b>, ou après un <b>verbe</b> : <i>mucho trabajo</i>, <i>trabajo mucho</i>."],
    ex: ["Hablas muy rápido.", "Tengo mucho trabajo."],
    regle: ["<i>muy</i> devant un adjectif ou un adverbe.", "<i>mucho</i> devant un nom, ou après un verbe (il s'accorde : <i>muchas reuniones</i>)."],
    phrases: [
      ["Huesca es {muy|mucho} bonita.", 0, "Huesca est très jolie.", "bonita = jolie"],
      ["Trabajo {muy|mucho}.", 1, "Je travaille beaucoup."],
      ["Hablas {muy|mucho} rápido.", 0, "Tu parles très vite.", "rápido = vite"],
      ["Tengo {muy|mucho} trabajo.", 1, "J'ai beaucoup de travail."],
      ["Blanca habla {muy|mucho} con su hermana.", 1, "Blanca parle beaucoup avec sa sœur."],
      ["El piso es {muy|mucho} pequeño.", 0, "L'appartement est très petit.", "pequeño = petit"],
      ["Hoy tengo {muy|muchas} reuniones.", 1, "Aujourd'hui, j'ai beaucoup de réunions."],
      ["Como {muy|mucho}.", 1, "Je mange beaucoup."],
      ["Mi barrio es {muy|mucho} tranquilo.", 0, "Mon quartier est très calme.", "tranquilo = calme"],
      ["No tengo {muy|mucho} dinero.", 1, "Je n'ai pas beaucoup d'argent."],
      ["Hablo español {muy|mucho} despacio.", 0, "Je parle espagnol très lentement."],
      ["Léo es {muy|mucho} pequeño.", 0, "Léo est très petit.", "pequeño = petit"],
    ],
  },
  {
    id: "porpara", court: "por o para", nom: "pour : por ou para", lecon: null,
    carte: ["<i>para</i> : <b>pour quelqu'un</b> (qui reçoit), ou <b>pour faire</b> quelque chose.", "<i>por</i> : <i>por la mañana / la tarde / la noche</i>, <i>gracias por</i>, <i>por favor</i>."],
    ex: ["Un regalo para Blanca.", "Por la mañana trabajo."],
    regle: ["<i>por</i> : <i>por la mañana / la tarde / la noche</i>, <i>gracias por</i>, <i>por favor</i>.", "<i>para</i> : pour quelqu'un (qui reçoit), ou pour faire quelque chose (le but)."],
    phrases: [
      ["{Por|Para} la mañana trabajo en casa.", 0, "Le matin, je travaille à la maison."],
      ["Un regalo {por|para} Blanca.", 1, "Un cadeau pour Blanca.", "regalo = cadeau"],
      ["Hablo español {por|para} hablar con la gente.", 1, "Je parle espagnol pour parler avec les gens."],
      ["{Por|Para} la noche hablo español con Blanca.", 0, "Le soir, je parle espagnol avec Blanca."],
      ["Gracias {por|para} todo.", 0, "Merci pour tout.", "todo = tout"],
      ["Javier trabaja {por|para} una empresa de Huesca.", 1, "Javier travaille pour une entreprise de Huesca."],
      ["{Por|Para} la tarde trabajo en casa.", 0, "L'après-midi, je travaille à la maison."],
      ["Una caña, {por|para} favor.", 0, "Une petite bière, s'il vous plaît.", "caña = petite bière"],
      ["Tengo dinero {por|para} pagar.", 1, "J'ai de l'argent pour payer."],
      ["Gracias {por|para} el regalo.", 0, "Merci pour le cadeau.", "regalo = cadeau"],
      ["El regalo es {por|para} Léo.", 1, "Le cadeau est pour Léo.", "regalo = cadeau"],
      ["Gracias {por|para} la cena.", 0, "Merci pour le dîner.", "cena = dîner"],
    ],
  },
  {
    id: "manana", court: "mañana o la mañana", nom: "demain ou le matin", lecon: null,
    carte: ["Sans article, <i>mañana</i> = <b>demain</b>.", "<i>la mañana</i> = <b>le matin</b> : <i>por la mañana</i>, <i>las diez de la mañana</i>."],
    ex: ["Mañana tengo una reunión.", "Trabajo por la mañana."],
    regle: ["Sans article, <i>mañana</i> = demain.", "<i>la mañana</i> = le matin (<i>por la mañana</i>)."],
    phrases: [
      ["{Mañana|La mañana} tengo una reunión.", 0, "Demain, j'ai une réunion."],
      ["Trabajo por {mañana|la mañana}.", 1, "Je travaille le matin."],
      ["{Mañana|La mañana} es sábado.", 0, "Demain, c'est samedi.", "sábado = samedi"],
      ["Por {mañana|la mañana} hablo con mi jefe.", 1, "Le matin, je parle avec mon chef."],
      ["¿Trabajas {mañana|la mañana}?", 0, "Tu travailles demain ?"],
      ["{Mañana|La mañana} como con Blanca.", 0, "Demain, je mange avec Blanca."],
      ["Son las diez de {mañana|la mañana}.", 1, "Il est dix heures du matin."],
      ["{Mañana|La mañana} no trabajo.", 0, "Demain, je ne travaille pas."],
      ["Hablo español por {mañana|la mañana} y por la noche.", 1, "Je parle espagnol le matin et le soir."],
    ],
  },
  {
    id: "lunes", court: "el lunes o los lunes", nom: "ce lundi ou tous les lundis", lecon: null,
    carte: ["<i>el lunes</i> = <b>ce lundi-ci</b>, le prochain.", "<i>los lunes</i> = <b>tous les lundis</b>. Pareil pour tous les jours : <i>el sábado</i>, <i>los sábados</i>."],
    ex: ["El lunes tengo una reunión.", "Los jueves hablo con mi profesor."],
    regle: ["<i>el</i> + le jour = ce jour-là, le prochain.", "<i>los</i> + le jour = tous les … (chaque semaine)."],
    phrases: [
      ["{El lunes|Los lunes} trabajo desde casa.", 1, "Le lundi (tous les lundis), je travaille à la maison.", "lunes = lundi"],
      ["{El lunes|Los lunes} tengo una reunión con mi jefe.", 0, "Lundi (ce lundi-ci), j'ai une réunion avec mon chef.", "lunes = lundi"],
      ["{El sábado|Los sábados} como con amigos.", 1, "Le samedi (tous les samedis), je mange avec des amis.", "sábado = samedi"],
      ["{El viernes|Los viernes} no trabajo.", 0, "Vendredi (ce vendredi-ci), je ne travaille pas.", "viernes = vendredi"],
      ["¿Trabajas {el sábado|los sábados}?", 0, "Tu travailles samedi (ce samedi-ci) ?", "sábado = samedi"],
      ["{El sábado|Los sábados} no hablo con mi profesor.", 1, "Le samedi (tous les samedis), je ne parle pas avec mon prof.", "sábado = samedi"],
      ["{El lunes|Los lunes} es fiesta.", 0, "Lundi (ce lundi-ci), c'est férié.", "fiesta = jour férié"],
      ["{El domingo|Los domingos} no trabajo.", 1, "Le dimanche (tous les dimanches), je ne travaille pas.", "domingo = dimanche"],
      ["{El miércoles|Los miércoles} tengo una reunión a las diez.", 0, "Mercredi (ce mercredi-ci), j'ai une réunion à dix heures.", "miércoles = mercredi"],
      ["La boda es {el sábado|los sábados}.", 0, "Le mariage est un samedi.", "sábado = samedi"],
    ],
  },
  {
    id: "tarde", court: "tarde o la tarde", nom: "tard ou l'après-midi", lecon: null,
    carte: ["Sans article, <i>tarde</i> = <b>tard</b>.", "<i>la tarde</i> = <b>l'après-midi</b> (jusqu'au soir) : <i>por la tarde</i>."],
    ex: ["La gente come tarde.", "Por la tarde trabajo."],
    regle: ["Sans article, <i>tarde</i> = tard.", "<i>la tarde</i> = l'après-midi (<i>por la tarde</i>)."],
    phrases: [
      ["Por {tarde|la tarde} trabajo en casa.", 1, "L'après-midi, je travaille à la maison."],
      ["Como {tarde|la tarde}.", 0, "Je mange tard."],
      ["La gente come {tarde|la tarde} en España.", 0, "Les gens mangent tard en Espagne."],
      ["Son las cinco de {tarde|la tarde}.", 1, "Il est cinq heures de l'après-midi."],
      ["Es muy {tarde|la tarde}.", 0, "Il est très tard."],
      ["Ceno {tarde|la tarde}.", 0, "Je dîne tard.", "cenar = dîner"],
      ["Por {tarde|la tarde} tengo una reunión.", 1, "L'après-midi, j'ai une réunion."],
      ["Hoy llego {tarde|la tarde}.", 0, "Aujourd'hui, j'arrive tard.", "llegar = arriver"],
    ],
  },
];
