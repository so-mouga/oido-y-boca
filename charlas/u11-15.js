// La Charla, les conversations des unités 11 à 15. Le format est décrit dans charlas/index.js.
// Écrites par la session de contenu de ce bloc ; vérifiées par : node outils/test-charla.mjs <vocabulaire.csv>

// Les personnes du bloc (hors troupe). Luis, Nuria, Sergio, Pilar et Carmen reviennent des blocs d'avant (mêmes fiches).
const LUIS = { nom: "Luis", qui: "le voisin du dessus, un monsieur du quinto", couleur: ["#5B6B7A", "#D9A47A"] };
const NURIA = { nom: "Nuria", qui: "une maman de la classe de Léo", couleur: ["#2E7D4F", "#C68B5E"] };
const SERGIO = { nom: "Sergio", qui: "un ami de Blanca", couleur: ["#B5651D", "#D9A47A"] };
const PILAR = { nom: "Pilar", qui: "l'épicière du quartier", couleur: ["#8C2F39", "#E8B98E"] };
const CARMEN = { nom: "Carmen", qui: "une amie de Blanca", couleur: ["#1F6E43", "#F0C9A0"] };
const ROSA = { nom: "Rosa", qui: "la secrétaire du centre de santé", couleur: ["#5E548E", "#E8B98E"] };
const INES = { nom: "Inés", qui: "la pédiatre du centre de santé", couleur: ["#3A7CA5", "#E8B98E"] };
const AMPARO = { nom: "Amparo", qui: "la pharmacienne du quartier", couleur: ["#2A9D8F", "#F0C9A0"] };
const TOMAS = { nom: "Tomás", qui: "un papa de la classe de Dorian", couleur: ["#6D597A", "#C68B5E"] };

export const CHARLAS = [
  {
    id: "u11-rosa-cita", lecon: "U11-L1", perso: ROSA, lieu: "au guichet du centre de santé",
    echanges: [
      { lui: "Buenos días. ¿En qué puedo ayudarle?",
        ok: "Buenos días. Quería pedir cita con la pediatra para mi hijo Léo.",
        pieges: [
          ["Buenos días. Quería pedir cita con la pediatra por mi hijo Léo.", "¿Por su hijo? ¿Y él no puede venir? 😅", "Pour quelqu'un : <i>para mi hijo</i>.", "preposition"],
          ["Buenos días. Quería pedir cita con la pediatra para mi hija Léo.", "¿Su hija? ¿Léo es una niña? 😅", "Léo est un garçon : <i>mi hijo</i>.", "genre"],
        ],
        rires: [
          ["¿Me pones una caña, por favor?", "¡Uy! Esto es un centro de salud, no un bar. 😂", "Elle demande ce que tu veux : un rendez-vous."],
          ["Vivo en Huesca desde hace cinco años.", "Muy bien… 😄 ¿Y qué necesita?", "Elle demande ce que tu veux : un rendez-vous."],
        ],
        suite: "Muy bien, con la pediatra." },
      { lui: "¿Y para cuándo la quiere?",
        ok: "Para mañana, por favor.",
        pieges: [
          ["Por mañana, por favor.", "¿Por mañana? 😅 ¿Para mañana?", "Un moment prévu : <i>para mañana</i>.", "preposition"],
          ["Para ayer, por favor.", "¿Para ayer? ¡Eso es imposible! 😂", "<i>ayer</i> = hier. Demain : <i>mañana</i>."],
        ],
        rires: [
          ["Mañana trabajo desde casa.", "¡Qué suerte! 😄 Pero ¿para cuándo la cita?", "Elle demande pour quand tu veux le rendez-vous."],
          ["Me gusta mucho el pescado.", "Vale… 😅 ¿Y la cita?", "Elle demande pour quand tu veux le rendez-vous."],
        ],
        suite: "A ver… Mañana hay un hueco." },
      { lui: "Mañana a las diez y media. ¿Le va bien?",
        ok: "Sí, a las diez y media está bien.",
        pieges: [
          ["Sí, a la diez y media está bien.", "¿A la diez? 😅 A las diez.", "Pour l'heure : <i>a las diez</i>.", "heure"],
          ["Sí, a las diez y media es bien.", "¿Es bien? 😅 Está bien.", "« C'est bon » : <i>está bien</i>.", "ser-estar"],
        ],
        rires: [
          ["Me levanto a las siete.", "Muy bien, entonces llega a tiempo. 😄", "Elle te propose demain à dix heures et demie."],
          ["Hoy hace sol.", "Sí, ¡qué bien! 😄 ¿Y la hora?", "Elle te propose demain à dix heures et demie."],
        ],
        suite: "Perfecto, apuntado." },
      { lui: "¿Tiene la tarjeta sanitaria del niño?",
        ok: "Sí, aquí la tiene.",
        pieges: [
          ["Sí, aquí lo tiene.", "¿Lo? La tarjeta… 😅", "<i>tarjeta</i> est féminin : <i>la tiene</i>.", "genre"],
          ["Sí, aquí la tienes.", "¡Uy, qué confianza! 😄", "À la secrétaire, on dit <i>usted</i> : <i>aquí la tiene</i>.", "personne"],
        ],
        rires: [
          ["Prefiero pagar con tarjeta.", "¡Aquí no se paga! ¡Es la sanidad pública! 😂", "Elle demande la carte de santé de Léo."],
          ["Las llaves están en el coche.", "Vale… 😅 ¿Y la tarjeta?", "Elle demande la carte de santé de Léo."],
        ],
        suite: "Gracias. Pues mañana a las diez y media con la pediatra. ¡Hasta mañana!" },
    ],
  },
  {
    id: "u11-ines-pediatra", lecon: "U11-L4", perso: INES, lieu: "au centre de santé, dans le cabinet de la pédiatre, avec Léo",
    echanges: [
      { lui: "Hola, buenos días. A ver, ¿qué le pasa a Léo?",
        ok: "Tiene fiebre y le duele la tripa.",
        pieges: [
          ["Tiene fiebre y le duelen la tripa.", "¿Duelen? ¿Cuántas tripas tiene? 😄", "<i>la tripa</i>, c'est un singulier : <i>le duele</i>.", "gustar"],
          ["Tiene la fiebre y le duele la tripa.", "¿La fiebre? ¿Cuál? 😅", "Avoir de la fièvre : <i>tener fiebre</i>, sans article.", "article"],
        ],
        rires: [
          ["Léo tiene cuatro años.", "Sí, aquí lo pone. 😄 Pero ¿qué le pasa?", "Elle demande ce qu'a Léo."],
          ["Hoy hace mucho frío.", "Sí, por eso tengo tantos niños malos. 😅", "Elle demande ce qu'a Léo."],
        ],
        suite: "Vale. Léo, guapo, ¿dónde te duele? ¿Aquí?" },
      { lui: "¿Y desde cuándo tiene fiebre?",
        ok: "Desde ayer por la noche.",
        pieges: [
          ["Desde hace ayer por la noche.", "¿Desde hace ayer? 😅 Desde ayer.", "Un moment (<i>ayer</i>) : <i>desde</i>. <i>Desde hace</i>, c'est avec une durée (<i>desde hace dos días</i>).", "preposition"],
          ["Desde ayer en la noche.", "¿En la noche? 😄 Por la noche.", "En Espagne, le soir : <i>por la noche</i>.", "preposition"],
        ],
        rires: [
          ["Vivo en Huesca desde hace cinco años.", "¡Qué bien! 😄 Pero ¿y la fiebre de Léo?", "Elle demande depuis quand Léo a de la fièvre, pas depuis quand tu vis à Huesca."],
          ["Me acuesto a las once.", "¿Y Léo? 😄", "Elle demande depuis quand Léo a de la fièvre."],
        ],
        suite: "¿Y cuánta fiebre tiene?" },
      { lui: "¿Le has tomado la temperatura?",
        ok: "Sí, esta mañana ha tenido treinta y nueve.",
        pieges: [
          ["Sí, esta mañana ha tenido diecinueve.", "¿Diecinueve? ¡Entonces está helado! 😱", "<i>diecinueve</i> = 19. La fièvre : <i>treinta y nueve</i> (39).", "nombre"],
          ["Sí, esta mañana tiene treinta y nueve.", "¿Ahora o esta mañana? 😅", "C'est passé, mais c'est aujourd'hui : le passé composé, <i>ha tenido</i>.", "temps"],
        ],
        rires: [
          ["Abre la boca, Léo.", "¡Eh, eso lo digo yo! 😄", "Elle demande si tu as pris sa température."],
          ["El ordenador está en el salón.", "Vale… 😅 ¿Y el termómetro?", "Elle demande si tu as pris sa température."],
        ],
        suite: "Treinta y nueve… vale. ¿Ha vomitado?" },
      { lui: "¿Ha vomitado?",
        ok: "Sí, ha vomitado dos veces esta noche.",
        pieges: [
          ["Sí, ha vomitado dos vez esta noche.", "¿Dos vez? 😅 Dos veces.", "Au pluriel : <i>una vez, dos veces</i>."],
          ["Sí, vomita dos veces esta noche.", "¿Esta noche va a vomitar? ¿Cómo lo sabes? 😅", "C'est fait, cette nuit : le passé composé, <i>ha vomitado</i>.", "temps"],
        ],
        rires: [
          ["Me duele la cabeza.", "¿A ti también? 😅 ¡Uno por uno!", "Elle demande si Léo a vomi."],
          ["Dorian juega muy bien al fútbol.", "¡Qué bien! 😄 Pero hoy el paciente es Léo.", "Elle demande si Léo a vomi."],
        ],
        suite: "Pobre… ¿Y tos? Le oigo toser un poco." },
      { lui: "¿Y la tos? ¿Desde cuándo tiene tos?",
        ok: "Tiene tos desde hace tres días.",
        pieges: [
          ["Tiene tos desde tres días.", "¿Desde tres días? 😅 Desde hace tres días.", "« Depuis » + une durée : <i>desde hace</i>. <i>Desde</i> seul, c'est avec un moment (<i>desde ayer</i>).", "preposition"],
          ["Tiene tos hace tres días.", "¿Hace tres días? ¿Y ahora ya no? 😅", "<i>hace tres días</i> = il y a trois jours. Depuis : <i>desde hace tres días</i>.", "preposition"],
        ],
        rires: [
          ["La cuenta, por favor.", "¿La cuenta? ¡Esto no es un bar! 😂", "Tu es chez la pédiatre : elle demande depuis quand Léo tousse."],
          ["Me gusta mucho cocinar.", "¡Pues sopa para Léo! 😄 Pero ¿y la tos?", "Elle demande depuis quand Léo tousse."],
        ],
        suite: "Vale. Voy a mirarle los oídos y la garganta. Tranquilo, no parece nada grave." },
    ],
  },
  {
    id: "u11-amparo-farmacia", lecon: "U11-L6", perso: AMPARO, lieu: "à la pharmacie du quartier, avec l'ordonnance de Léo",
    echanges: [
      { lui: "Hola, buenas tardes. ¿Qué necesita?",
        ok: "Hola. La pediatra me ha dado una receta para Léo.",
        pieges: [
          ["Hola. La pediatra me da una receta para Léo.", "¿Ahora? ¿Está aquí la pediatra? 😅", "C'est fait, aujourd'hui : le passé composé, <i>me ha dado</i>.", "temps"],
          ["Hola. La pediatra me ha dado una receta por Léo.", "¿Por Léo? 😅 Para Léo.", "Pour quelqu'un : <i>para Léo</i>.", "preposition"],
        ],
        rires: [
          ["¿Tiene pan del pueblo?", "¿Pan? ¡Esto es una farmacia! 😂", "Elle demande ce qu'il te faut : tu as l'ordonnance de Léo."],
          ["Me encanta Huesca.", "¡Y a mí! 😄 ¿Qué necesita?", "Elle demande ce qu'il te faut : tu as l'ordonnance de Léo."],
        ],
        suite: "A ver… Un jarabe y un antibiótico." },
      { lui: "¿El niño tiene alguna alergia?",
        ok: "No, no tiene alergias.",
        pieges: [
          ["No, no tengo alergias.", "¿Usted? ¡Le pregunto por el niño! 😅", "<i>tengo</i> = j'ai. Pour Léo : <i>tiene</i>.", "personne"],
          ["No, no tiene las alergias.", "¿Las alergias? ¿Cuáles? 😅", "Pas d'article ici : <i>no tiene alergias</i>.", "article"],
        ],
        rires: [
          ["Léo come mucho pan.", "¡Qué bien! 😄 Pero ¿alergias?", "Elle demande si Léo a des allergies."],
          ["Tengo tos desde ayer.", "¿Usted también? 😅 Primero el niño.", "Elle demande si Léo a des allergies."],
        ],
        suite: "Muy bien." },
      { lui: "El jarabe tiene que tomarlo cada ocho horas.",
        ok: "¿Cada ocho horas? ¿Antes o después de comer?",
        pieges: [
          ["¿Cada ocho horas? ¿Antes o después de come?", "¿De come? 😅 De comer.", "Après <i>de</i>, le verbe à l'infinitif : <i>después de comer</i>."],
          ["¿Cada dieciocho horas? ¿Antes o después de comer?", "¡No, no! Ocho, ocho. 😅", "<i>dieciocho</i> = 18. Huit : <i>ocho</i>.", "nombre"],
        ],
        rires: [
          ["Hoy he trabajado todo el día.", "¡Pues a descansar! 😄 ¿Alguna pregunta?", "Elle t'explique quand donner le sirop."],
          ["Me acuesto a las once.", "Vale… 😄 ¿Y el jarabe?", "Elle t'explique quand donner le sirop."],
        ],
        suite: "Después de comer." },
      { lui: "Y el antibiótico, durante cinco días. ¿Vale?",
        ok: "Vale. ¿Cuál es la dosis para un niño de cuatro años?",
        pieges: [
          ["Vale. ¿Qué es la dosis para un niño de cuatro años?", "¿Qué es? ¡Pues la cantidad! 😄", "Pour demander laquelle : <i>¿cuál es la dosis?</i>", "question"],
          ["Vale. ¿Cuál es la dosis para un niño de cuatro año?", "¿Cuatro año? 😅 Años.", "Au pluriel : <i>cuatro años</i>."],
        ],
        rires: [
          ["Dorian juega muy bien al fútbol.", "¡Qué bien! 😄 ¿Y el antibiótico?", "Elle t'explique le traitement."],
          ["La cuenta, por favor.", "¡Ja! Aquí se dice: ¿cuánto es? 😄", "Elle t'explique le traitement."],
        ],
        suite: "Cinco mililitros, tres veces al día. Está escrito en la caja. ¡Que se mejore!" },
    ],
  },
  {
    id: "u12-nuria-parque", lecon: "U12-L2", perso: NURIA, lieu: "devant l'école, le lundi matin",
    echanges: [
      { lui: "¡Hola, Kevin! ¿Qué tal el sábado? ¿Qué hicisteis?",
        ok: "Los niños corrieron mucho en el parque.",
        pieges: [
          ["Los niños corren mucho en el parque.", "¿Ahora? ¿No están en clase? 😅", "C'était samedi, c'est fini : le passé simple, <i>corrieron</i>.", "temps"],
          ["Los niños corrió mucho en el parque.", "¿Corrió? ¿Quién? 😅", "Les enfants (ils) : <i>corrieron</i>.", "personne"],
        ],
        rires: [
          ["Me gusta leer.", "¡Qué bien! 😄 ¿Y el sábado?", "Elle demande ce que vous avez fait samedi."],
          ["Tiene que tomar el jarabe cada ocho horas.", "¿Quién? ¿Está malo? 😱", "Elle demande ce que vous avez fait samedi."],
        ],
        suite: "¡Qué bien! Nosotros también fuimos al parque." },
      { lui: "¿Y Léo subió al tobogán? Lucía tiene miedo.",
        ok: "Sí, Léo subió al tobogán diez veces.",
        pieges: [
          ["Sí, Léo subí al tobogán diez veces.", "¿Tú? ¿En el tobogán? 😂", "<i>subí</i> = je suis monté. Pour Léo : <i>subió</i>.", "personne"],
          ["Sí, Léo subió en el tobogán diez veces.", "¿En el tobogán? 😅 Al tobogán.", "Monter sur : <i>subir a</i> → <i>subió al tobogán</i>.", "preposition"],
        ],
        rires: [
          ["Anoche cené tarde.", "Yo también. 😄 ¿Y Léo?", "Elle demande si Léo est monté sur le toboggan."],
          ["El parque es muy grande.", "Sí… 😄 Pero ¿y el tobogán?", "Elle demande si Léo est monté sur le toboggan."],
        ],
        suite: "¡Diez veces! ¡Qué valiente!" },
      { lui: "¿Y Dorian? ¿También?",
        ok: "No, Dorian jugó al fútbol con unos amigos.",
        pieges: [
          ["No, Dorian juega al fútbol con unos amigos.", "¿Ahora? ¡Si está en clase! 😅", "C'était samedi : le passé simple, <i>jugó</i>.", "temps"],
          ["No, Dorian jugó el fútbol con unos amigos.", "¿El fútbol? 😅 Al fútbol.", "Jouer à un jeu : <i>jugar a</i> → <i>jugó al fútbol</i>.", "preposition"],
        ],
        rires: [
          ["Normalmente se acuesta a las nueve.", "Ah… 😄 ¿Y el sábado?", "Elle demande ce qu'a fait Dorian samedi."],
          ["La pediatra me ha dado una receta.", "¿Está malo? 😱", "Elle demande ce qu'a fait Dorian samedi."],
        ],
        suite: "¡Claro, como siempre!" },
      { lui: "¿Y comisteis allí, en el parque?",
        ok: "Sí, comimos en el parque con los niños.",
        pieges: [
          ["Sí, comemos en el parque con los niños.", "¿Hoy también? 😅", "C'était samedi : <i>comimos</i>. (<i>Comemos</i> = on mange.)", "temps"],
          ["Sí, comieron en el parque con los niños.", "¿Ellos? ¿Y tú no? 😅", "<i>comieron</i> = ils ont mangé. Vous, avec toi : <i>comimos</i>.", "personne"],
        ],
        rires: [
          ["Por la noche bebe un vaso de leche.", "Vale… 😄 ¿Y el sábado?", "Elle demande si vous avez mangé au parc."],
          ["Hoy no ha comido nada.", "¿Quién? ¿Léo? 😱", "Elle demande si vous avez mangé au parc."],
        ],
        suite: "¡Qué buen plan! El sábado que viene vamos juntos." },
    ],
  },
  {
    id: "u12-sergio-viernes", lecon: "U12-L4", perso: SERGIO, lieu: "Sergio, un ami de Blanca, croisé au marché",
    echanges: [
      { lui: "¡Kevin! ¿Qué tal el viernes? Blanca me ha dicho que salisteis.",
        ok: "¡Muy bien! Cenamos con unos amigos y tomamos algo.",
        pieges: [
          ["¡Muy bien! Cenaron con unos amigos y tomamos algo.", "¿Ellos? ¿Y tú? 😅", "<i>cenaron</i> = ils ont dîné. Vous, avec toi : <i>cenamos</i>.", "personne"],
          ["¡Muy bien! Cenamos con unas amigos y tomamos algo.", "¿Unas amigos? 😅", "<i>amigos</i> est masculin : <i>unos amigos</i>.", "article"],
        ],
        rires: [
          ["Tiene tos desde hace tres días.", "¿Quién? ¿Estás malo? 😅", "Il demande comment s'est passée la sortie de vendredi."],
          ["Hoy he ido al gimnasio.", "¡Bien! 💪 Pero ¿y el viernes?", "Il demande comment s'est passée la sortie de vendredi."],
        ],
        suite: "¡Qué bien!" },
      { lui: "¿Y bailasteis?",
        ok: "Sí, bailamos un poco después de cenar.",
        pieges: [
          ["Sí, bailasteis un poco después de cenar.", "¿Yo? ¡Yo no salí con vosotros! 😂", "<i>bailasteis</i> = vous avez dansé. Pour vous, avec toi : <i>bailamos</i>.", "personne"],
          ["Sí, bailamos un poco después de cena.", "¿Después de cena? 😅 Después de cenar.", "Après <i>de</i>, le verbe à l'infinitif : <i>después de cenar</i>."],
        ],
        rires: [
          ["Juego al fútbol con Dorian.", "¡Eso no es bailar! 😂", "Il demande si vous avez dansé."],
          ["Me encantan las series.", "A mí también. 😄 ¿Y bailasteis?", "Il demande si vous avez dansé."],
        ],
        suite: "¡Bien! ¡Blanca baila muy bien!" },
      { lui: "¿Y a qué hora llegaste a casa?",
        ok: "Llegué tarde, a las dos.",
        pieges: [
          ["Llegó tarde, a las dos.", "¿Quién? ¿Blanca? 😂", "<i>llegó</i> = il est arrivé. Pour toi : <i>llegué</i>.", "personne"],
          ["Llegué tarde, a los dos.", "¿A los dos? 😅 A las dos.", "Pour l'heure : <i>a las dos</i>.", "heure"],
        ],
        rires: [
          ["Me levanto a las siete.", "¿Después de llegar a las dos? 😂", "Il demande à quelle heure tu es rentré."],
          ["Hoy hace mucho frío.", "Sí… 😄 ¿Y a qué hora llegaste?", "Il demande à quelle heure tu es rentré."],
        ],
        suite: "¡A las dos! ¡Qué fiesta!" },
      { lui: "¿Y quién pagó?",
        ok: "Pagué yo la cena, y ellos pagaron las copas.",
        pieges: [
          ["Pago yo la cena, y ellos pagaron las copas.", "¿Ahora? ¡Pues invítame! 😂", "C'était vendredi : le passé simple, <i>pagué</i>.", "temps"],
          ["Pagué yo la cena, y ellos pagamos las copas.", "¿Pagamos? ¿Quiénes? 😅", "Eux (ils) : <i>pagaron</i>.", "personne"],
        ],
        rires: [
          ["Busqué las llaves toda la mañana.", "¡Ja! ¿Otra vez? 😂", "Il demande qui a payé."],
          ["¿Me pones una caña?", "¡No soy camarero! 😂", "Il demande qui a payé."],
        ],
        suite: "¡Qué generoso! La próxima vez, pago yo." },
    ],
  },
  {
    id: "u12-javier-finde", lecon: "U12-L6", perso: "javier", lieu: "Javier, à la salle de sport, le lundi matin",
    echanges: [
      { lui: "¡Buenos días, Kevin! ¿Qué tal el finde?",
        ok: "Muy bien, lo pasamos genial.",
        pieges: [
          ["Muy bien, la pasamos genial.", "¿La pasamos? 😅 Lo pasamos.", "L'expression, c'est <i>pasarlo bien</i> : <i>lo pasamos genial</i>.", "formule"],
          ["Muy bien, lo pasamos bueno.", "¿Bueno? 😅 Bien, genial…", "Après un verbe : <i>bien</i> ou <i>genial</i>, pas <i>bueno</i>."],
        ],
        rires: [
          ["Me encantan las películas.", "¡Y a mí las pesas! 😂 ¿Qué tal el finde?", "Il demande comment s'est passé ton week-end."],
          ["Tiene que tomar el jarabe.", "¿Quién? ¿Estás malo? 😅", "Il demande comment s'est passé ton week-end."],
        ],
        suite: "¡Genial! Cuéntame." },
      { lui: "¿Y qué hiciste el sábado? ¿Entrenaste?",
        ok: "No, el sábado me levanté tarde y descansé.",
        pieges: [
          ["No, el sábado levanté tarde y descansé.", "¿Levantaste qué? ¿Pesas? 💪😂", "<i>levantarse</i> : <i>me levanté</i>, avec <i>me</i>."],
          ["No, el sábado me he levantado tarde y he descansado.", "¿El sábado? 😅", "<i>El sábado</i> est fini : le passé simple, <i>me levanté</i>. Le passé composé, c'est pour aujourd'hui.", "temps"],
        ],
        rires: [
          ["Mi coche es pequeño.", "Vale… 😂 ¿Y el sábado?", "Il demande ce que tu as fait samedi."],
          ["Normalmente come bien.", "¿Quién? 😅 Te pregunto por el sábado.", "Il demande ce que tu as fait samedi."],
        ],
        suite: "¿Descansar? ¡Eso no es un plan! 😱" },
      { lui: "¿Y el domingo?",
        ok: "El domingo paseamos por la montaña con los niños.",
        pieges: [
          ["El domingo paseamos por la montaña con las niños.", "¿Las niños? 😅", "<i>niños</i> est masculin : <i>los niños</i>.", "article"],
          ["El domingo pasean por la montaña con los niños.", "¿Quiénes? ¿Y tú? 😅", "<i>pasean</i> = ils se promènent. Vous, avec toi : <i>paseamos</i>.", "personne"],
        ],
        rires: [
          ["La semana pasada trabajé mucho.", "¡Pues a moverse! 💪 ¿Y el domingo?", "Il demande ce que tu as fait dimanche."],
          ["Prefiero la carne.", "¡Proteínas! 💪😂 ¿Y el domingo?", "Il demande ce que tu as fait dimanche."],
        ],
        suite: "¡Eso me gusta más! 💪" },
      { lui: "¿Y hoy? ¿Has entrenado ya?",
        ok: "Hoy no he entrenado, pero ayer corrí una hora.",
        pieges: [
          ["Hoy no entrené, pero ayer corrí una hora.", "¿Hoy no entrenaste? ¡Pero el día no ha terminado! 😄", "<i>Hoy</i> n'est pas fini : le passé composé, <i>no he entrenado</i>.", "temps"],
          ["Hoy no he entrenado, pero ayer he corrido una hora.", "¿Ayer has corrido? 😅", "<i>Ayer</i> est fini : le passé simple, <i>corrí</i>.", "temps"],
        ],
        rires: [
          ["Los niños subieron al tobogán.", "¡Qué bien! 😄 ¿Y tú?", "Il demande si tu t'es entraîné aujourd'hui."],
          ["La pediatra me ha dado una receta.", "¿Estás malo? 😱", "Il demande si tu t'es entraîné aujourd'hui."],
        ],
        suite: "¡Una hora! ¡Bravo! Esta tarde, pesas conmigo. 💪" },
    ],
  },
  {
    id: "u13-luis-playa", lecon: "U13-L2", perso: LUIS, lieu: "dans l'ascenseur, au retour des vacances",
    echanges: [
      { lui: "¡Hombre, Kevin! ¿Qué tal el viaje? ¿Fuisteis a la playa?",
        ok: "Sí, fuimos a la playa y fue genial.",
        pieges: [
          ["Sí, fueron a la playa y fue genial.", "¿Ellos? ¿Y tú? 😅", "<i>fueron</i> = ils sont allés. Vous, avec toi : <i>fuimos</i>.", "personne"],
          ["Sí, fuimos en la playa y fue genial.", "¿En la playa? 😅 A la playa.", "Aller quelque part : <i>ir a</i> → <i>fuimos a la playa</i>.", "preposition"],
        ],
        rires: [
          ["Me duele la cabeza.", "¡Uy! ¿Mucho sol? 😄", "Il demande si vous êtes allés à la plage."],
          ["Juego al fútbol con Dorian.", "¡Qué bien! 😄 ¿Y la playa?", "Il demande si vous êtes allés à la plage."],
        ],
        suite: "¡Qué envidia! Yo, aquí, con este calor…" },
      { lui: "¿Y la vuelta? ¿Qué tal la carretera?",
        ok: "Mal. Tuvimos un atasco.",
        pieges: [
          ["Mal. Tenemos un atasco.", "¿Ahora? ¿Aquí en el ascensor? 😂", "C'est fini : le passé simple, <i>tuvimos</i>.", "temps"],
          ["Mal. Tuvimos una atasco.", "¿Una atasco? 😅", "<i>atasco</i> est masculin : <i>un atasco</i>.", "article"],
        ],
        rires: [
          ["El ascensor no funciona.", "¡Pero si estamos subiendo! 😂", "Il demande comment s'est passé le retour."],
          ["Hoy hace sol.", "Sí… 😄 ¿Y la carretera?", "Il demande comment s'est passé le retour."],
        ],
        suite: "¡Uf, los atascos de verano!" },
      { lui: "¿Mucho tiempo?",
        ok: "Sí, estuvimos dos horas en la carretera.",
        pieges: [
          ["Sí, fuimos dos horas en la carretera.", "¿Fuisteis? 😅 Estuvisteis.", "Rester quelque part : <i>estar</i> → <i>estuvimos</i>.", "ser-estar"],
          ["Sí, estuvimos dos horas a la carretera.", "¿A la carretera? 😅", "Sur la route : <i>en la carretera</i>.", "preposition"],
        ],
        rires: [
          ["Dorian conduce muy bien.", "¿Dorian? ¡Si tiene siete años! 😂", "Il demande si vous êtes restés longtemps."],
          ["Me encanta el pescado.", "Vale… 😄 ¿Y cuánto tiempo?", "Il demande si vous êtes restés longtemps."],
        ],
        suite: "¡Dos horas! ¡Pobres niños!" },
      { lui: "¿Y los niños? ¿Se portaron bien?",
        ok: "Sí, Léo durmió todo el viaje.",
        pieges: [
          ["Sí, Léo duerme todo el viaje.", "¿Siempre? 😄", "C'est fini : le passé simple, <i>durmió</i>.", "temps"],
          ["Sí, Léo dormí todo el viaje.", "¿Tú dormiste? ¿Y quién condujo? 😱", "<i>dormí</i> = j'ai dormi. Pour Léo : <i>durmió</i>.", "personne"],
        ],
        rires: [
          ["Tengo cita con el médico.", "¿Estás malo? 😅", "Il demande si les enfants ont été sages."],
          ["La playa es muy bonita.", "¡Ya me lo imagino! 😄 ¿Y los niños?", "Il demande si les enfants ont été sages."],
        ],
        suite: "¡Qué suerte! Bueno, este es mi piso. ¡Hasta luego!" },
    ],
  },
  {
    id: "u13-marta-ascensor", lecon: "U13-L5", perso: "marta", lieu: "ta voisine, sur le palier, qui a une histoire à raconter",
    echanges: [
      { lui: "¡Kevin! ¿Sabes qué pasó ayer en el portal? ¡No te lo vas a creer!",
        ok: "No. ¿Qué pasó?",
        pieges: [
          ["No. ¿Qué ha pasado ayer?", "¿Ha pasado ayer? 😅 Pasó.", "<i>Ayer</i> est fini : le passé simple, <i>¿qué pasó?</i>", "temps"],
          ["No. ¿Qué pasé?", "¿Tú? ¡No, no, tú no! 😂", "<i>pasé</i>, c'est « je ». Pour la chose : <i>¿qué pasó?</i>", "personne"],
        ],
        rires: [
          ["Me encanta el pescado.", "Vale… 😄 Pero escucha…", "Elle veut te raconter quelque chose : demande ce qui s'est passé."],
          ["Hoy he trabajado en casa todo el día.", "Ya, ya… 😄 Pero escucha…", "Elle veut te raconter quelque chose : demande ce qui s'est passé."],
        ],
        suite: "¡Luis, el del quinto, se quedó en el ascensor! ¡Una hora!" },
      { lui: "¡Una hora, Kevin! ¡Sin luz! Y nadie lo oía…",
        ok: "¡Qué susto! ¿Y entonces?",
        pieges: [
          ["¡Qué suerte! ¿Y entonces?", "¿Suerte? ¡Una hora en el ascensor! 😱", "<i>suerte</i> = chance. Pour la frayeur : <i>¡qué susto!</i>", "formule"],
          ["¡Qué bien! ¿Y entonces?", "¿Qué bien? ¡Pobre Luis! 😤", "<i>¡qué bien!</i>, c'est pour une bonne nouvelle. Ici : <i>¡qué susto!</i>", "formule"],
        ],
        rires: [
          ["Primero fuimos al parque y luego a casa.", "Muy bien… 😅 ¿Pero me escuchas?", "Elle raconte une frayeur : réagis et demande la suite."],
          ["Hoy hace mucho viento.", "¡Kevin, céntrate! 😂", "Elle raconte une frayeur : réagis et demande la suite."],
        ],
        suite: "Entonces yo bajé con la basura, lo oí, ¡y llamé al técnico!" },
      { lui: "Y tú, ¿dónde estuviste ayer por la tarde? No te vi.",
        ok: "Estuve en casa. Tuve que trabajar hasta tarde.",
        pieges: [
          ["Fui en casa. Tuve que trabajar hasta tarde.", "¿Fuiste en casa? 😅 Estuviste.", "Être quelque part : <i>estar</i> → <i>estuve en casa</i>.", "ser-estar"],
          ["Estuve en casa. Tuve trabajar hasta tarde.", "¿Tuve trabajar? 😅 Tuve QUE trabajar.", "Devoir : <i>tener que</i> → <i>tuve que trabajar</i>."],
        ],
        rires: [
          ["Le di un libro a Dorian.", "¡Qué bien! 😄 Pero ¿dónde estuviste?", "Elle demande où tu étais hier après-midi."],
          ["Me gusta la verdura.", "¡Qué sano! 😄 Pero ¿dónde estuviste?", "Elle demande où tu étais hier après-midi."],
        ],
        suite: "¡Claro, por eso no oíste nada!" },
      { lui: "¡Y el técnico tardó una hora más! Pero Luis salió bien, tranquilo.",
        ok: "Por suerte, al final no pasó nada.",
        pieges: [
          ["Por suerte, al final no pasa nada.", "¿No pasa? ¡Ya pasó! 😅", "C'est fini : le passé simple, <i>no pasó nada</i>.", "temps"],
          ["Por eso, al final no pasó nada.", "¿Por eso? ¿Por qué? 😅", "<i>por eso</i> = c'est pour ça. Heureusement : <i>por suerte</i>."],
        ],
        rires: [
          ["Tuvimos un atasco en la carretera.", "¡Otra historia! 😄 Me la cuentas otro día.", "Elle finit son histoire : tout s'est bien fini."],
          ["Me duele el pie.", "¿Ahora tú? 😱", "Elle finit son histoire : tout s'est bien fini."],
        ],
        suite: "¡Sí, por suerte! Le di un vaso de agua y un abrazo." },
    ],
  },
  {
    id: "u13-blanca-parque", lecon: "U13-L6", perso: "blanca", lieu: "par messages, toi au parc avec les enfants",
    echanges: [
      { lui: "¡Hola, cariño! ¿Qué tal en el parque?",
        ok: "¡Muy bien! Pero Léo se cayó del columpio.",
        pieges: [
          ["¡Muy bien! Pero Léo me caí del columpio.", "¿Tú o Léo? 😅", "<i>me caí</i> = je suis tombé. Pour Léo : <i>se cayó</i>.", "personne"],
          ["¡Muy bien! Pero Léo se cayó de la columpio.", "¿La columpio? 😅", "<i>columpio</i> est masculin : <i>del columpio</i>.", "article"],
        ],
        rires: [
          ["Tuvimos un atasco en la carretera.", "¿En el parque? 😂", "Elle demande comment ça se passe au parc."],
          ["Me encantan las series.", "Ya lo sé, cariño. 😄 ¿Y el parque?", "Elle demande comment ça se passe au parc."],
        ],
        suite: "¡Ay! ¡Pobre!" },
      { lui: "¿Y está bien? ¿Lloró?",
        ok: "Lloró un poco, pero al final no pasó nada.",
        pieges: [
          ["Lloré un poco, pero al final no pasó nada.", "¿Tú lloraste? 😂", "<i>lloré</i> = j'ai pleuré. Pour Léo : <i>lloró</i>.", "personne"],
          ["Lloró un poco, pero al final no pasa nada.", "¿No pasa? 😅 ¿O no pasó?", "C'est fini : le passé simple, <i>no pasó nada</i>.", "temps"],
        ],
        rires: [
          ["Dorian me contó una historia.", "¡Ah! 😄 Pero ¿y Léo?", "Elle demande si Léo va bien."],
          ["Hoy hace sol.", "Ya… 😄 ¿Y Léo?", "Elle demande si Léo va bien."],
        ],
        suite: "¡Uf, menos mal! 😮‍💨" },
      { lui: "¿Y Dorian? ¿Qué hizo?",
        ok: "Primero se escondió, y al final lo encontré con Marta.",
        pieges: [
          ["Primero se escondí, y al final lo encontré con Marta.", "¿Se escondí? 😅", "Pour Dorian : <i>se escondió</i>.", "personne"],
          ["Primero se escondió, y al final la encontré con Marta.", "¿La? ¿Dorian es una niña? 😅", "Dorian est un garçon : <i>lo encontré</i>.", "genre"],
        ],
        rires: [
          ["La historia fue muy graciosa.", "¿Qué historia? 😄 ¿Y Dorian?", "Elle demande ce qu'a fait Dorian."],
          ["Me duele la cabeza.", "¡Normal, con dos niños! 😂", "Elle demande ce qu'a fait Dorian."],
        ],
        suite: "¡Qué gracioso! 😂 Típico de Dorian." },
      { lui: "¿Y ahora qué hacéis?",
        ok: "Hacemos la cena. Los niños pusieron la mesa.",
        pieges: [
          ["Hacemos la cena. Los niños pusimos la mesa.", "¿Pusimos? ¿Quiénes? 😅", "Les enfants (ils) : <i>pusieron</i>.", "personne"],
          ["Hacemos la cena. Los niños hicieron la mesa.", "¿Hicieron la mesa? ¿Con madera? 😂", "Mettre la table : <i>poner la mesa</i> → <i>pusieron</i>."],
        ],
        rires: [
          ["Primero fuimos al parque y luego a casa.", "Ya, ya… 😄 ¿Y ahora?", "Elle demande ce que vous faites maintenant."],
          ["Me gusta el pescado.", "¡Pues cocina pescado! 😂", "Elle demande ce que vous faites maintenant."],
        ],
        suite: "¡Qué equipo! Llego en diez minutos. 😘" },
    ],
  },
  {
    id: "u14-tomas-pequeno", lecon: "U14-L3", perso: TOMAS, lieu: "à l'anniversaire d'un copain de Dorian, entre parents",
    echanges: [
      { lui: "Oye, Kevin, tú eres francés, ¿no? ¿De pequeño dónde vivías?",
        ok: "Vivía en Hyères, en Francia.",
        pieges: [
          ["Vivo en Hyères, en Francia.", "¿Vives en Francia? ¿Y qué haces aquí? 😂", "De pequeño, ce qui durait : l'imparfait, <i>vivía</i>.", "temps"],
          ["Vivía a Hyères, en Francia.", "¿A Hyères? 😅 En Hyères.", "Vivre quelque part : <i>en</i> → <i>vivía en Hyères</i>.", "preposition"],
        ],
        rires: [
          ["Me gusta mucho Huesca.", "¡Y a mí! 😄 Pero ¿de pequeño?", "Il demande où tu vivais quand tu étais petit."],
          ["Dorian come mucho pan.", "¡Y tarta! ¡Es un cumpleaños! 😂 Pero ¿dónde vivías?", "Il demande où tu vivais quand tu étais petit."],
        ],
        suite: "¡Qué bonito! Cerca del mar, ¿no?" },
      { lui: "¿Y cómo eras de pequeño? ¿Travieso, como Dorian?",
        ok: "No, era muy tímido.",
        pieges: [
          ["No, estaba muy tímido.", "¿Estabas? ¿Solo un día? 😄", "Le caractère, c'est <i>ser</i> : <i>era tímido</i>.", "ser-estar"],
          ["No, eras muy tímido.", "¿Yo? ¡Si no me conocías! 😂", "<i>eras</i> = tu étais. Pour toi : <i>era</i>.", "personne"],
        ],
        rires: [
          ["Mis abuelas vivían con nosotros.", "¡Qué bonito! 😊 Pero ¿eras travieso?", "Il demande comment tu étais petit."],
          ["Hoy hace sol.", "Sí… 😄 ¿Y de pequeño?", "Il demande comment tu étais petit."],
        ],
        suite: "¿Tímido tú? ¡Pues ahora hablas mucho! 😄" },
      { lui: "¿Y a qué jugabas?",
        ok: "Jugaba al fútbol con mis amigos.",
        pieges: [
          ["Jugué al fútbol con mis amigos.", "¿Una vez? 😄", "Une habitude d'enfant : l'imparfait, <i>jugaba</i>.", "temps"],
          ["Jugaba el fútbol con mis amigos.", "¿El fútbol? 😅 Al fútbol.", "Jouer à un jeu : <i>jugar a</i> → <i>jugaba al fútbol</i>.", "preposition"],
        ],
        rires: [
          ["Los niños subieron al tobogán.", "¡Hoy sí! 😄 Pero ¿y tú, de pequeño?", "Il demande à quoi tu jouais."],
          ["Me duele la tripa.", "¿Mucha tarta? 😂", "Il demande à quoi tu jouais."],
        ],
        suite: "¡Como Dorian!" },
      { lui: "¿Y en la tele? ¿Qué veías?",
        ok: "Veía Dragon Ball todos los días.",
        pieges: [
          ["Vi Dragon Ball todos los días.", "¿Una vez o todos los días? 😅", "Tous les jours, une habitude : l'imparfait, <i>veía</i>.", "temps"],
          ["Veía Dragon Ball todos las días.", "¿Las días? 😅", "<i>días</i> est masculin : <i>todos los días</i>.", "article"],
        ],
        rires: [
          ["Tuvimos un atasco en la carretera.", "¡Qué rollo! 😄 ¿Y en la tele?", "Il demande ce que tu regardais à la télé."],
          ["Me encanta el pescado.", "Vale… 😄 ¿Y en la tele?", "Il demande ce que tu regardais à la télé."],
        ],
        suite: "¡Yo también! ¡Goku era mi héroe! 😄" },
      { lui: "¿Y comías en el comedor del cole?",
        ok: "No, comía en casa.",
        pieges: [
          ["No, comí en casa.", "¿Un día solo? 😄", "Une habitude : l'imparfait, <i>comía</i>.", "temps"],
          ["No, comía a casa.", "¿A casa? 😅 En casa.", "Être quelque part : <i>en casa</i>.", "preposition"],
        ],
        rires: [
          ["Hoy he ido al gimnasio.", "¡Bien! 😄 ¿Y de pequeño?", "Il demande si tu mangeais à la cantine."],
          ["Me gusta mucho cocinar.", "¡Qué bien! 😄 ¿Y de pequeño?", "Il demande si tu mangeais à la cantine."],
        ],
        suite: "¡Qué suerte! Yo odiaba el comedor. 😂" },
    ],
  },
  {
    id: "u14-javier-brazo", lecon: "U14-L5", perso: "javier", lieu: "Javier, à la salle de sport, avec un bandage",
    echanges: [
      { lui: "¡Kevin! Mira, me he hecho daño en el brazo jugando al pádel. ¿A ti te ha pasado alguna vez?",
        ok: "Sí, una vez. Tenía doce años.",
        pieges: [
          ["Sí, una vez. Tuve doce años.", "¿Tuviste doce años? ¿Un día? 😄", "L'âge, c'est le décor : l'imparfait, <i>tenía</i>.", "temps"],
          ["Sí, una vez. Era doce años.", "¿Eras doce años? 😅", "L'âge, c'est avec <i>tener</i> : <i>tenía doce años</i>."],
        ],
        rires: [
          ["Me encantan las tapas.", "¡Y a mí! 💪😂 Pero ¿te has hecho daño alguna vez?", "Il demande si tu t'es déjà fait mal."],
          ["Veía Dragon Ball todos los días.", "¡Goku no se hacía daño! 😂", "Il demande si tu t'es déjà fait mal."],
        ],
        suite: "¿Doce años? ¿Y cómo ocurrió?" },
      { lui: "¿Y cómo ocurrió?",
        ok: "Mientras subía por una puerta grande, me hice daño en el brazo.",
        pieges: [
          ["Mientras subí por una puerta grande, me hice daño en el brazo.", "¿Subiste y ya? 😅", "<i>Mientras</i> + l'imparfait : <i>subía</i>.", "temps"],
          ["Mientras subía por una puerta grande, me hacía daño en el brazo.", "¿Muchas veces? 😱", "L'action qui arrive, une fois : le passé simple, <i>me hice daño</i>.", "temps"],
        ],
        rires: [
          ["Mis abuelas vivían con nosotros.", "Ah… 😄 ¿Y el brazo?", "Il demande comment c'est arrivé."],
          ["En Hyères siempre hacía buen tiempo.", "¡Qué envidia! 😄 ¿Y el brazo?", "Il demande comment c'est arrivé."],
        ],
        suite: "¡Uf! ¡Qué travieso!" },
      { lui: "¿Y fuiste al hospital?",
        ok: "No me acuerdo bien. ¡Fue hace mucho tiempo!",
        pieges: [
          ["No me acuerdo bien. ¡Fui hace mucho tiempo!", "¿Fuiste? ¿Adónde? 😅", "Pour la chose (c'était) : <i>fue</i>. <i>Fui</i>, c'est « je suis allé ».", "personne"],
          ["No acuerdo bien. ¡Fue hace mucho tiempo!", "¿No acuerdas? 😅 No me acuerdo.", "<i>acordarse</i> : <i>me acuerdo</i>, avec <i>me</i>."],
        ],
        rires: [
          ["Jugaba al fútbol con mis amigos.", "¡Eso sí! 💪 ¿Y el hospital?", "Il demande si tu es allé à l'hôpital."],
          ["Hoy he comido arroz.", "¡Bien, energía! 💪😂 ¿Y el hospital?", "Il demande si tu es allé à l'hôpital."],
        ],
        suite: "¡Normal! Yo no me acuerdo ni de lo que cené ayer. 😂" },
      { lui: "¿Y ahora? ¿Te duele cuando entrenas?",
        ok: "No, ahora no me duele nada.",
        pieges: [
          ["No, ahora no le duele nada.", "¿A quién? 😅", "<i>le duele</i> = il a mal. Pour toi : <i>me duele</i>.", "personne"],
          ["No, ahora no me duelen nada.", "¿Duelen? 😅", "<i>nada</i>, c'est singulier : <i>no me duele</i>.", "gustar"],
        ],
        rires: [
          ["Antes vivía en París.", "Ah… 😄 ¿Y el brazo?", "Il demande si tu as mal maintenant."],
          ["Me levanto a las siete.", "¡Bien! 💪 ¿Y el brazo?", "Il demande si tu as mal maintenant."],
        ],
        suite: "¡Pues entonces, a entrenar! 💪 Hoy, brazos." },
    ],
  },
  {
    id: "u14-pilar-francia", lecon: "U14-L6", perso: PILAR, lieu: "à l'épicerie du quartier, un matin calme",
    echanges: [
      { lui: "Buenos días, Kevin. Usted es francés, ¿verdad? ¿Echa de menos Francia?",
        ok: "Un poco. Echo de menos a mi familia.",
        pieges: [
          ["Un poco. Echo de menos mi familia.", "¿Mi familia? 😅 A mi familia.", "Devant des personnes : <i>a</i> → <i>echo de menos a mi familia</i>.", "preposition"],
          ["Un poco. Echo de más a mi familia.", "¿De más? 😅 De menos.", "« Ça me manque » : <i>echo de menos</i>.", "formule"],
        ],
        rires: [
          ["¿Tiene pan del pueblo?", "Sí, ahora se lo doy. 😄 Pero ¿echa de menos Francia?", "Elle demande si la France te manque."],
          ["Veía Dragon Ball todos los días.", "¡Ja! ¡Mis hijos también! 😄", "Elle demande si la France te manque."],
        ],
        suite: "Claro, la familia es lo más importante." },
      { lui: "¿Y antes dónde vivía? ¿En París?",
        ok: "Sí, antes vivía en París. Ahora vivo en Huesca.",
        pieges: [
          ["Sí, antes vivo en París. Ahora vivo en Huesca.", "¿Vive en los dos sitios? 😄", "<i>antes</i> + l'imparfait : <i>vivía</i>.", "temps"],
          ["Sí, antes vivía en París. Ahora vivía en Huesca.", "¿Ahora vivía? 😅", "<i>ahora</i> + le présent : <i>vivo</i>.", "temps"],
        ],
        rires: [
          ["Me duele el pie.", "¡Uy! Siéntese. 😅 ¿Y antes?", "Elle demande où tu vivais avant."],
          ["Suelo ir al gimnasio a mediodía.", "¡Como Javier! 😄 ¿Y antes?", "Elle demande où tu vivais avant."],
        ],
        suite: "¡París! ¡Qué cambio!" },
      { lui: "¿Y qué prefiere, París o Huesca?",
        ok: "Prefiero Huesca. Aquí todo es más barato.",
        pieges: [
          ["Prefiero Huesca. Aquí todo es más caro.", "¿Más caro? ¿Y por eso lo prefiere? 😂", "<i>caro</i> = cher. Moins cher : <i>más barato</i>."],
          ["Prefiere Huesca. Aquí todo es más barato.", "¿Yo? ¡Claro, soy de aquí! 😄", "<i>prefiere</i> = elle préfère. Pour toi : <i>prefiero</i>.", "personne"],
        ],
        rires: [
          ["Me hice daño en el brazo.", "¡Ay! ¿Cuándo? 😱", "Elle demande ce que tu préfères : Paris ou Huesca."],
          ["Jugaba al fútbol con mis amigos.", "Muy bien… 😄 ¿Y qué prefiere?", "Elle demande ce que tu préfères : Paris ou Huesca."],
        ],
        suite: "¡Eso es verdad! Y se vive muy bien." },
      { lui: "¿Y ya se ha acostumbrado a cenar tarde?",
        ok: "Sí, ya me he acostumbrado. ¡Y me encantan las tapas!",
        pieges: [
          ["Sí, ya he acostumbrado. ¡Y me encantan las tapas!", "¿Ha acostumbrado a quién? 😅", "<i>acostumbrarse</i> : <i>me he acostumbrado</i>, avec <i>me</i>."],
          ["Sí, ya me he acostumbrado. ¡Y me encanta las tapas!", "¿Encanta? ¡Son muchas tapas! 😄", "<i>las tapas</i>, c'est un pluriel : <i>me encantan</i>.", "gustar"],
        ],
        rires: [
          ["De pequeño era muy tímido.", "¿Usted? ¡Pues ahora no! 😄", "Elle demande si tu t'es habitué à dîner tard."],
          ["Antes vivía en París.", "Sí, ya me lo ha dicho. 😄 ¿Y la cena?", "Elle demande si tu t'es habitué à dîner tard."],
        ],
        suite: "¡Así me gusta! Ya es usted de Huesca. 😄" },
    ],
  },
  {
    id: "u15-carmen-conocisteis", lecon: "U15-L3", perso: CARMEN, lieu: "Carmen, une amie de Blanca, à l'apéro en terrasse",
    echanges: [
      { lui: "Oye, Kevin, nunca me lo habéis contado: ¿cómo os conocisteis?",
        ok: "Nos conocimos por internet.",
        pieges: [
          ["Nos conocemos por internet.", "¿Ahora? ¿Os conocéis hoy? 😄", "C'est arrivé une fois, c'est fini : le passé simple, <i>nos conocimos</i>.", "temps"],
          ["Nos conocíamos por internet.", "¿Os conocíais? ¿Y qué pasó? 😅", "La rencontre est une action qui arrive : <i>nos conocimos</i>. L'imparfait, c'est pour le décor.", "temps"],
        ],
        rires: [
          ["Blanca tiene una sonrisa muy bonita.", "¡Ya lo sé! 😄 Pero ¿cómo os conocisteis?", "Elle demande comment vous vous êtes rencontrés."],
          ["Me encantan las tapas de Huesca.", "¡Y a quién no! 😂 Pero no cambies de tema.", "Elle demande comment vous vous êtes rencontrés."],
        ],
        suite: "¿Por internet? ¡Qué moderno!" },
      { lui: "¿Y dónde os visteis la primera vez?",
        ok: "En París. Blanca vino a verme.",
        pieges: [
          ["En París. Blanca vine a verme.", "¿Vine? ¿Tú o Blanca? 😅", "<i>vine</i> = je suis venu. Pour Blanca : <i>vino</i>.", "personne"],
          ["A París. Blanca vino a verme.", "¿A París? ¿Ibais a París? 😅", "Où on est : <i>en París</i>. <i>A</i>, c'est pour aller quelque part.", "preposition"],
        ],
        rires: [
          ["Echo de menos a mi familia.", "Ay, normal… 🥹 Pero ¿y la primera vez?", "Elle demande où vous vous êtes vus la première fois."],
          ["Prefiero la terraza.", "¡Pero si ya estamos en una! 😂", "Elle demande où vous vous êtes vus la première fois."],
        ],
        suite: "¡Qué valiente, Blanca!" },
      { lui: "¿Y tú estabas nervioso?",
        ok: "Un poco. Por eso fui a buscarla al metro con dos cervezas.",
        pieges: [
          ["Un poco. Por eso iba a buscarla al metro con dos cervezas.", "¿Ibas? ¿Todos los días? 😂", "Une fois, ce jour-là : le passé simple, <i>fui</i>. <i>Iba</i>, c'est une habitude.", "temps"],
          ["Un poco. Por eso fue a buscarla al metro con dos cervezas.", "¿Quién fue? ¿Otro chico? 😂", "<i>fue</i> = il est allé. Pour toi : <i>fui</i>.", "personne"],
        ],
        rires: [
          ["Prefiero una caña.", "¡Ahora te la pido! 😂 Pero ¿estabas nervioso?", "Elle demande si tu étais nerveux."],
          ["Hoy hace mucho viento.", "Sí… 😄 ¿Y en París? ¿Nervioso?", "Elle demande si tu étais nerveux."],
        ],
        suite: "¡Dos cervezas en el metro! ¡Qué romántico! 😂" },
      { lui: "¿Y en qué idioma hablabais? Tú no hablabas español, ¿no?",
        ok: "No. Primero hablábamos en inglés, pero ella también hablaba francés.",
        pieges: [
          ["No. Primero hablabais en inglés, pero ella también hablaba francés.", "¿Hablabais? ¿Quiénes? ¡Yo no estaba! 😂", "<i>hablabais</i> = vous parliez. Pour vous deux, avec toi : <i>hablábamos</i>.", "personne"],
          ["No. Primero hablábamos en inglés, pero ella también habló francés.", "¿Habló? ¿Una vez? 😄", "Ce qui durait : l'imparfait, <i>hablaba</i>.", "temps"],
        ],
        rires: [
          ["Aquí todo es más barato.", "¡Eso es verdad! 😄 Pero ¿y el idioma?", "Elle demande en quelle langue vous parliez."],
          ["De pequeño veía Dragon Ball.", "¡Yo también! 😂 Pero hablamos de Blanca.", "Elle demande en quelle langue vous parliez."],
        ],
        suite: "¡Claro! Blanca habla francés muy bien." },
      { lui: "¿Y cuándo viniste a vivir a Huesca?",
        ok: "Hace unos cuatro años me mudé a Huesca, por Blanca y por Léo.",
        pieges: [
          ["Desde hace unos cuatro años me mudé a Huesca, por Blanca y por Léo.", "¿Desde hace? 😅 Hace cuatro años, y ya está.", "« Il y a » quatre ans : <i>hace</i>, sans <i>desde</i>.", "preposition"],
          ["Hace unos cuatro años me mudo a Huesca, por Blanca y por Léo.", "¿Te mudas? ¿Otra vez? 😱", "C'est arrivé une fois, il y a quatre ans : le passé simple, <i>me mudé</i>.", "temps"],
        ],
        rires: [
          ["Vivía en Hyères y comía en casa.", "¡Eso fue antes! 😄 ¿Y Huesca?", "Elle demande quand tu es venu vivre à Huesca."],
          ["Me duele la cabeza.", "¿De tanto hablar? 😂", "Elle demande quand tu es venu vivre à Huesca."],
        ],
        suite: "¡Qué bonita historia! ¡Y ahora, la boda!" },
    ],
  },
  {
    id: "u15-marta-pedida", lecon: "U15-L5", perso: "marta", lieu: "ta voisine, dans l'escalier, qui parle déjà du mariage",
    echanges: [
      { lui: "¡Kevin! ¡Ya queda poco para la boda! Oye, ¿cómo le pediste matrimonio a Blanca?",
        ok: "Le pedí matrimonio en Valencia, en mayo.",
        pieges: [
          ["Le pidió matrimonio en Valencia, en mayo.", "¿Quién? ¿Otro? 😱", "<i>pidió</i> = il a demandé. Pour toi : <i>pedí</i>.", "personne"],
          ["Le pedía matrimonio en Valencia, en mayo.", "¿Muchas veces? 😂", "Une fois, ce jour-là : le passé simple, <i>le pedí</i>.", "temps"],
        ],
        rires: [
          ["Me encantan las tapas.", "¡Y a mí! 😄 Pero cuéntame lo de la pedida.", "Elle demande comment tu l'as demandée en mariage."],
          ["Hoy he ido al gimnasio.", "¡Como Javier! 😄 Pero ¿y la pedida?", "Elle demande comment tu l'as demandée en mariage."],
        ],
        suite: "¡En Valencia! ¡Qué romántico!" },
      { lui: "¿Y lo preparaste todo tú?",
        ok: "Sí. Había luces en el balcón.",
        pieges: [
          ["Sí. Hay luces en el balcón.", "¿Todavía? 😄", "Le décor, ce jour-là : l'imparfait, <i>había</i>.", "temps"],
          ["Sí. Estaban luces en el balcón.", "¿Estaban? 😅 Había.", "« Il y avait » : <i>había</i>."],
        ],
        rires: [
          ["Echo de menos a mi familia.", "Ay, normal… 🥹 Pero ¿y la pedida?", "Elle demande si tu as tout préparé."],
          ["Me duele la cabeza.", "¿De tanto preparar la boda? 😂", "Elle demande si tu as tout préparé."],
        ],
        suite: "¡Luces en el balcón! ¡Qué bonito!" },
      { lui: "¿Y alguien lo grabó?",
        ok: "Sí, escondí unas cámaras para grabar el momento.",
        pieges: [
          ["Sí, escondía unas cámaras para grabar el momento.", "¿Siempre escondías cámaras? 😂", "Une fois, ce jour-là : le passé simple, <i>escondí</i>.", "temps"],
          ["Sí, escondió unas cámaras para grabar el momento.", "¿Quién? ¿Blanca? 😂", "<i>escondió</i> = il a caché. Pour toi : <i>escondí</i>.", "personne"],
        ],
        rires: [
          ["Veía Dragon Ball todos los días.", "¡Ja! 😄 Pero ¿y las cámaras?", "Elle demande si quelqu'un a filmé."],
          ["Aquí todo es más barato.", "¡Eso es verdad! 😄 Pero ¿y el vídeo?", "Elle demande si quelqu'un a filmé."],
        ],
        suite: "¡Cámaras escondidas! ¡Qué peliculero! 😂" },
      { lui: "¿Y qué te dijo ella?",
        ok: "Me dijo que sí.",
        pieges: [
          ["Me dice que sí.", "¿Ahora? ¡Ya te lo dijo! 😂", "C'est arrivé ce jour-là : le passé simple, <i>me dijo</i>.", "temps"],
          ["Le dije que sí.", "¿Tú? ¡Si preguntaste tú! 😂", "<i>le dije</i> = je lui ai dit. C'est elle qui a dit oui : <i>me dijo</i>.", "personne"],
        ],
        rires: [
          ["Me mudé a Huesca hace unos cuatro años.", "Ya lo sé, vecino. 😄 ¿Y qué te dijo?", "Elle demande ce que Blanca t'a répondu."],
          ["Hoy hace mucho viento.", "¡Kevin! ¿Qué te dijo? 😂", "Elle demande ce que Blanca t'a répondu."],
        ],
        suite: "¡Claro que sí! 🥹" },
      { lui: "¿Y ahora? ¿Estás nervioso con la boda?",
        ok: "No, estoy relajado. ¡Estoy muy ilusionado!",
        pieges: [
          ["No, soy relajado. ¡Estoy muy ilusionado!", "¿Eres relajado? ¿Siempre? 😄", "Maintenant, un état : <i>estoy relajado</i>.", "ser-estar"],
          ["No, estoy relajado. ¡Estoy muy ilusionada!", "¿Ilusionada? 😄", "Pour un homme : <i>ilusionado</i>.", "genre"],
        ],
        rires: [
          ["Al principio no hablaba español.", "¡Y ahora mira! 😄 Pero ¿y la boda?", "Elle demande si tu es nerveux pour le mariage."],
          ["Me gusta mucho cocinar.", "¡Pues cocinas tú en la boda! 😂", "Elle demande si tu es nerveux pour le mariage."],
        ],
        suite: "¡Qué bien! ¡Yo voy a llorar en la boda! 🥹" },
    ],
  },
];
