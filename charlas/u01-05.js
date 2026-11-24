// La Charla, les conversations des unités 1 à 5. Le format est décrit dans charlas/index.js.
// Écrites par la session de contenu de ce bloc ; vérifiées par : node outils/test-charla.mjs <vocabulaire.csv>
// Les deux premières (Marta, Javier) viennent de la maquette validée par Kevin, ajustées le 24 nov. avec lui aux mots du livre.

// Deux personnes du bloc qui reviennent (hors troupe) : Luis, le voisin du dessus ; Nuria, une maman de l'école.
const LUIS = { nom: "Luis", qui: "le voisin du dessus, un monsieur du quinto", couleur: ["#5B6B7A", "#D9A47A"] };
const NURIA = { nom: "Nuria", qui: "une maman de la classe de Léo", couleur: ["#2E7D4F", "#C68B5E"] };

export const CHARLAS = [
  {
    id: "u01-luis-vecino", lecon: "U1-L4", perso: LUIS, lieu: "devant les boîtes aux lettres de l'immeuble",
    echanges: [
      { lui: "Buenos días. ¿Eres el nuevo vecino?",
        ok: "Sí, me llamo Kevin. ¡Encantado!",
        pieges: [
          ["Sí, se llama Kevin. ¡Encantado!", "¿Se llama? ¿Quién? 😅", "<i>se llama</i>, c'est « il s'appelle ». Pour toi : <i>me llamo</i>.", "personne"],
          ["Sí, estoy Kevin. ¡Encantado!", "¿Estás Kevin? 😅 Eres Kevin, ¿no?", "Pour dire qui on est : <i>soy Kevin</i> ou <i>me llamo Kevin</i>, jamais <i>estoy</i>.", "ser-estar"],
        ],
        rires: [
          ["Sí, trabajo con el ordenador.", "Ah… muy bien. ¿Y cómo te llamas? 😄", "Il demande si tu es le nouveau voisin."],
          ["No hablo alemán.", "¡Yo tampoco! 😄 Pero ¿eres el nuevo vecino?", "Il demande si tu es le nouveau voisin."],
        ],
        suite: "Encantado. Yo soy Luis, del quinto." },
      { lui: "¿Y vives solo?",
        ok: "No, vivo con Blanca, Léo y Dorian.",
        pieges: [
          ["No, vives con Blanca, Léo y Dorian.", "¿Yo? ¡No, yo vivo solo! 😅", "<i>vives</i>, c'est « tu vis ». Pour toi : <i>vivo</i>.", "personne"],
          ["No, vivo en Blanca, Léo y Dorian.", "¿EN Blanca? 😅 ¡Vives CON Blanca!", "Vivre avec quelqu'un : <i>con</i>. <i>En</i>, c'est pour un lieu.", "preposition"],
        ],
        rires: [
          ["Mi madre vive en París.", "¡París, qué bonito! Pero ¿y aquí? 😄", "Il demande avec qui tu vis ici."],
          ["Soy francés.", "¡Ya lo oigo! 😄 Pero ¿vives solo?", "Il demande avec qui tu vis."],
        ],
        suite: "¡Ah, una familia! Qué bien." },
      { lui: "¿Y trabajas en Huesca?",
        ok: "Sí, pero trabajo desde casa.",
        pieges: [
          ["Sí, pero trabaja desde casa.", "¿Quién trabaja? ¿Blanca? 😅", "<i>trabaja</i>, c'est « il ou elle travaille ». Pour toi : <i>trabajo</i>.", "personne"],
          ["Sí, pero trabajo de casa.", "¿De casa? 😅 Ah, ¡desde casa!", "Depuis la maison : <i>desde casa</i>, pas <i>de casa</i>.", "preposition"],
        ],
        rires: [
          ["Sí, soy alto.", "¡Ya lo veo! 😄 Pero ¿y el trabajo?", "Il demande où tu travailles."],
          ["Hablo inglés y francés.", "¡Qué bien! Yo solo español. 😄", "Il demande si tu travailles à Huesca."],
        ],
        suite: "¡Qué suerte, sin coche y sin jefe en la oficina!" },
      { lui: "¡Y si necesitas algo, estoy en el quinto B, la puerta de la izquierda, a cualquier hora!",
        ok: "No entiendo. ¿Puedes repetir, por favor?",
        pieges: [
          ["Entiendo. ¿Puedes repetir, por favor?", "¿Entiendes? ¿Y por qué repito? 😅", "Sans <i>no</i>, tu dis que tu comprends ! Pour dire « je ne comprends pas » : <i>no entiendo</i>.", "formule"],
          ["No entiendo. ¿Puedes repetir, gracias?", "Claro… pero se dice «por favor». 😅", "Pour demander : <i>por favor</i>. <i>Gracias</i>, c'est après.", "formule"],
        ],
        rires: [
          ["El ordenador no funciona.", "¡Ay! Yo no sé de ordenadores. 😄", "Il a parlé trop vite : demande-lui de répéter, <i>¿puedes repetir?</i>"],
          ["Estoy muy contento en Huesca.", "¡Me alegro! 😄 Pero… ¿me has entendido?", "Il a parlé trop vite : demande-lui de répéter."],
        ],
        suite: "Perdona, perdona. Quinto B. ¡Aquí estoy para lo que necesites!" },
    ],
  },
  {
    id: "u01-marta-vecina", lecon: "U1-L6", perso: "marta", lieu: "la nouvelle voisine, sur le palier",
    echanges: [
      { lui: "¡Hola! Soy Marta, la nueva vecina. ¿Cómo te llamas?",
        ok: "Me llamo Kevin. ¡Encantado!",
        pieges: [["Te llamas Kevin.", "¿Yo? Me llamo Marta… 😅", "<i>te llamas</i>, c'est « tu t'appelles ». Pour toi : <i>me llamo</i>.", "personne"]],
        rires: [["Tengo cuatro años.", "¿Cuatro años? ¡No, hombre! 😄", "Elle demande ton nom, pas ton âge."]],
        suite: "¡Encantada, Kevin!" },
      { lui: "¿Eres francés? Hablas muy bien español.",
        ok: "Sí, soy francés. Pero todavía no hablo mucho.",
        pieges: [["Sí, estoy francés.", "¿Estás francés? 😅 Eres francés, ¿no?", "La nationalité se dit avec <i>ser</i> : <i>soy francés</i>.", "ser-estar"]],
        rires: [["Sí, Léo tiene cuatro años.", "¿Léo? ¡Pero te pregunto a ti! 😄", "Elle demande si tu es français, pas l'âge de Léo."]],
        suite: "¡Pues hablas bastante bien!" },
      { lui: "¿Y dónde trabajas?",
        ok: "Trabajo desde casa, con el ordenador.",
        pieges: [["Trabajas desde casa.", "¿Yo? No, yo trabajo en una empresa. 😅", "<i>trabajas</i>, c'est « tu travailles ». Pour toi : <i>trabajo</i>.", "personne"]],
        rires: [["Vivo en un piso, en la ciudad.", "¡Ya lo sé, soy tu vecina! 😄", "Elle demande où tu travailles, pas où tu vis."]],
        suite: "¡Qué bien, sin ir a la oficina!" },
      { lui: "Bueno, me voy. ¡Hasta luego, Kevin!",
        ok: "¡Hasta luego, Marta!",
        pieges: [["¡Hola, Marta!", "¿Hola? ¡Pero si me voy! 😅", "Pour dire au revoir : <i>¡hasta luego!</i>, pas <i>¡hola!</i>", "formule"]],
        rires: [["Nos casamos en junio.", "¡Enhorabuena! Pero… ¡me voy! 😄", "Elle te dit au revoir : <i>¡hasta luego!</i>"]],
        suite: "¡Chao!" },
    ],
  },
  {
    id: "u02-javier-gimnasio", lecon: "U2-L4", perso: "javier", lieu: "à l'accueil de la salle de sport",
    echanges: [
      { lui: "¡Buenos días! ¿Cuántos días a la semana vas al gimnasio?",
        ok: "Voy al gimnasio cuatro días a la semana.",
        pieges: [["Voy en el gimnasio cuatro días a la semana.", "¿En el gimnasio? Vienes AL gimnasio. 😅", "On va <i>a</i> un endroit : <i>voy al gimnasio</i>, pas <i>en el</i>.", "preposition"]],
        rires: [["Son cuatro euros.", "¿Cuatro euros? ¡Ojalá! 😄", "Il demande combien de jours, pas un prix."]],
        suite: "¡Muy bien, cuatro días!" },
      { lui: "¿Y a qué hora vas normalmente?",
        ok: "A las doce, al mediodía.",
        pieges: [["Son las doce.", "¿Ahora? No, son las diez. 😅", "<i>¿A qué hora…?</i> se répond <i>a las doce</i>. <i>Son las doce</i>, c'est l'heure qu'il est.", "heure"]],
        rires: [["Por la noche hablo español con Blanca.", "¡Qué bien! Pero… ¿y el gimnasio? 😄", "Il demande à quelle heure tu viens."]],
        suite: "Perfecto, al mediodía hay poca gente." },
      { lui: "¿Cuál es tu número de teléfono?",
        ok: "Es el seis, cuatro, cinco, doce, treinta.",
        pieges: [["Está el seis, cuatro, cinco, doce, treinta.", "Vale… ¿es el seis, cuatro, cinco? 😅", "Un numéro, c'est <i>ser</i> : <i>es el…</i>", "ser-estar"]],
        rires: [["Tengo cuarenta y cinco años.", "¡Pues pareces más joven! 😄", "Il demande ton numéro, pas ton âge."]],
        suite: "Apuntado." },
      { lui: "Son cuarenta euros al mes. ¡Hasta mañana!",
        ok: "Vale, gracias. ¡Hasta mañana!",
        pieges: [["¿Catorce euros? Vale, gracias.", "No, no: cuarenta, cuatro y cero. 😅", "<i>cuarenta</i> = 40, <i>catorce</i> = 14.", "nombre"]],
        rires: [["¿Cuándo es tu cumpleaños?", "¿Mi cumpleaños? ¡Es en marzo! 😄 Pero… ¡hasta mañana!", "Il te dit à demain : <i>¡hasta mañana!</i>"]],
        suite: "¡Hasta mañana, Kevin!" },
    ],
  },
  {
    id: "u02-marta-boda", lecon: "U2-L5", perso: "marta", lieu: "ta voisine, dans l'escalier",
    echanges: [
      { lui: "¡Kevin! Me dice Blanca que os casáis. ¿Es verdad?",
        ok: "Sí, nos casamos el próximo año.",
        pieges: [
          ["Sí, se casan el próximo año.", "¿Quiénes? ¡Vosotros! 😅", "<i>se casan</i>, c'est « ils se marient ». Pour vous deux : <i>nos casamos</i>.", "personne"],
          ["Sí, nos casamos la próxima año.", "¿La próxima año? 😅", "<i>año</i> est masculin : <i>el próximo año</i>.", "genre"],
        ],
        rires: [
          ["Sí, el lunes voy al gimnasio.", "¡Muy bien! Pero… ¿y la boda? 😄", "Elle parle du mariage."],
          ["Sí, la reunión es a las nueve.", "¿Qué reunión? 😄 ¡Te hablo de la boda!", "Elle parle du mariage."],
        ],
        suite: "¡Qué ilusión! ¡Enhorabuena!" },
      { lui: "¿Y cuándo es la boda? ¿Qué fecha?",
        ok: "Es el diecinueve de junio.",
        pieges: [
          ["Es el nueve de junio.", "¿El nueve? Apunto… ¿nueve o diecinueve? 😅", "<i>diecinueve</i> = 19 ; <i>nueve</i> = 9.", "nombre"],
          ["Está el diecinueve de junio.", "¿Está? 😅 Es el diecinueve, ¿no?", "Une date, c'est <i>ser</i> : <i>es el diecinueve</i>.", "ser-estar"],
        ],
        rires: [
          ["Hoy es martes.", "Sí, sí, hoy… ¡pero la boda! 😄", "Elle demande la date du mariage."],
          ["Son las nueve y media.", "¡Te pregunto la fecha, no la hora! 😄", "Elle demande la date : <i>es el diecinueve de junio</i>."],
        ],
        suite: "¡En junio! ¡Qué bonito!" },
      { lui: "¿Y de qué año? ¿El año que viene?",
        ok: "Sí, en dos mil veintisiete.",
        pieges: [
          ["Sí, en dos mil diecisiete.", "¿Diecisiete? ¡Eso ya pasó! 😂", "<i>veintisiete</i> = 27 ; <i>diecisiete</i> = 17.", "nombre"],
          ["Sí, en dos mil veintiséis.", "¿Este año? ¡Pero si ya es noviembre! 😅", "2026, c'est <i>veintiséis</i>. Le mariage, c'est en 2027 : <i>veintisiete</i>.", "nombre"],
        ],
        rires: [
          ["Son doce euros con cincuenta.", "¿La boda? ¡Qué barata! 😂", "Elle demande l'année, pas un prix."],
          ["El perro es muy grande.", "¿Qué perro? 😂 ¡Hablamos de la boda!", "Elle demande l'année du mariage."],
        ],
        suite: "¡Dos mil veintisiete! Ya queda menos." },
      { lui: "¿Y Léo? ¿Cuándo es su cumpleaños?",
        ok: "Es el catorce de diciembre.",
        pieges: [
          ["Es el cuatro de diciembre.", "¿El cuatro? ¡Ya casi! 😅", "<i>catorce</i> = 14 ; <i>cuatro</i> = 4.", "nombre"],
          ["Es el catorce diciembre.", "¿Catorce… de diciembre? 😅", "Dans une date, il faut <i>de</i> : <i>el catorce de diciembre</i>.", "preposition"],
        ],
        rires: [
          ["Léo tiene una bicicleta.", "¡Qué bien! ¿Y el cumpleaños? 😄", "Elle demande la date de l'anniversaire de Léo."],
          ["Es en el gimnasio.", "¿El cumpleaños en el gimnasio? 😂 ¡Como Javier!", "Elle demande <i>cuándo</i> (quand), pas <i>dónde</i> (où)."],
        ],
        suite: "¡En diciembre! ¡Ya casi! Bueno, me voy. ¡Hasta luego!" },
    ],
  },
  {
    id: "u03-javier-entreno", lecon: "U3-L4", perso: "javier", lieu: "à la salle de sport, entre deux machines",
    echanges: [
      { lui: "¡Kevin! ¿A qué hora te levantas para entrenar?",
        ok: "Me levanto a las siete.",
        pieges: [
          ["Te levantas a las siete.", "¿Yo? ¡Yo a las cinco! 💪😅", "<i>te levantas</i>, c'est « tu te lèves ». Pour toi : <i>me levanto</i>.", "personne"],
          ["Me levanto en las siete.", "¿En las siete? 😅", "À sept heures : <i>a las siete</i>.", "heure"],
        ],
        rires: [
          ["Desayuno con Léo.", "¡Qué bien! Pero ¿a qué hora te levantas? 😄", "Il demande à quelle heure tu te lèves."],
          ["Duermo mucho.", "¡Ya lo veo! 😂", "Il demande à quelle heure tu te lèves : <i>me levanto a las…</i>"],
        ],
        suite: "¿A las siete? ¡Yo a las cinco! 💪" },
      { lui: "¿Y desayunas antes de entrenar?",
        ok: "No, desayuno después del gimnasio.",
        pieges: [
          ["No, desayuna después del gimnasio.", "¿Quién? ¿Léo? 😅", "<i>desayuna</i>, c'est « il prend le petit-déjeuner ». Pour toi : <i>desayuno</i>.", "personne"],
          ["No, desayuno después de el gimnasio.", "Vale… ¿después DEL gimnasio? 😅", "<i>de</i> + <i>el</i> = <i>del</i> : <i>después del gimnasio</i>.", "article"],
        ],
        rires: [
          ["Me ducho antes.", "¿Antes de sudar? 😂 ¡Qué raro!", "Il parle du petit-déjeuner, pas de la douche."],
          ["Los domingos paseo con Blanca.", "¡Qué romántico! 😄 Pero ¿y el desayuno?", "Il demande si tu prends le petit-déjeuner avant."],
        ],
        suite: "¡Bien! Así entrenas con el estómago tranquilo." },
      { lui: "¿Y corres? Yo corro diez kilómetros cada día.",
        ok: "No, yo corro poco.",
        pieges: [
          ["No, yo corremos poco.", "¿Corremos? ¿Quiénes? 😅", "<i>corremos</i>, c'est « nous courons ». Pour toi : <i>corro</i>.", "personne"],
          ["No, yo poco corro.", "¿Poco corro? 😅 Hablas como Yoda.", "Le verbe d'abord : <i>corro poco</i>.", "ordre"],
        ],
        rires: [
          ["Puedo hacer la comida.", "¡Eso también es deporte! 😂", "Il demande si tu cours."],
          ["Vuelvo a casa a las doce.", "Vale… ¿y correr? 😄", "Il demande si tu cours."],
        ],
        suite: "¡Pues mañana corremos juntos! A las seis." },
      { lui: "Mañana a las seis, ¿vale?",
        ok: "No, gracias. A las seis duermo.",
        pieges: [
          ["No, gracias. Son las seis, duermo.", "¿Ahora son las seis? ¡Son las diez! 😅", "<i>son las seis</i> = il est six heures. À six heures : <i>a las seis</i>.", "heure"],
          ["No, gracias. A las seis duermes.", "¿Yo? ¡Yo nunca duermo! 💪😂", "<i>duermes</i>, c'est « tu dors ». Pour toi : <i>duermo</i>.", "personne"],
        ],
        rires: [
          ["El ordenador no funciona.", "¿Y eso qué tiene que ver? 😂", "Il te propose de courir demain à six heures."],
          ["Hoy cocino yo.", "¡Bien! ¿Y mañana a las seis? 😄", "Il te propose de courir demain à six heures."],
        ],
        suite: "¡Jaja! Vale, vale. ¡Hasta mañana, dormilón!" },
    ],
  },
  {
    id: "u03-camarero-cafe", lecon: "U3-L5", perso: "camarero", lieu: "au comptoir du bar de la plaza, le matin",
    echanges: [
      { lui: "¡Buenos días! Rápido, que hay mucha gente: ¿un café solo?",
        ok: "Sí, quiero uno, por favor.",
        pieges: [
          ["Sí, quieres uno, por favor.", "¿Yo? No, yo trabajo. 😅", "<i>quieres</i>, c'est « tu veux ». Pour toi : <i>quiero</i>.", "personne"],
          ["Sí, de nada.", "¿De nada? ¡Eso lo digo yo! 😅", "<i>de nada</i>, c'est « de rien », la réponse à un merci. Pour demander : <i>por favor</i>.", "formule"],
        ],
        rires: [
          ["Normalmente duermo poco.", "¡Por eso necesitas el café! 😄", "Il te propose un café : <i>sí, quiero uno</i>."],
          ["Nunca cocino.", "¡Aquí no tienes que cocinar! 😄 ¿Un café?", "Il te propose un café."],
        ],
        suite: "Marchando. Un café solo." },
      { lui: "¿Algo más? ¿Algo para comer?",
        ok: "No, gracias. No tengo hambre.",
        pieges: [
          ["No, gracias. No tienes hambre.", "¿Yo? ¡Yo siempre tengo hambre! 😅", "<i>tienes</i>, c'est « tu as ». Pour toi : <i>tengo</i>.", "personne"],
          ["No, por favor. No tengo hambre.", "¿No, por favor? ¡Ni que fuera veneno! 😄", "Pour refuser poliment : <i>no, gracias</i>. <i>No, por favor</i> sonne comme « surtout pas ! »", "formule"],
        ],
        rires: [
          ["Mi madre vive en París.", "¡Qué bien! Pero… ¿algo para comer? 😄", "Il demande si tu veux autre chose."],
          ["Los domingos como con Blanca.", "¡Qué romántico! Pero hoy, ¿algo? 😄", "Il demande si tu veux manger quelque chose."],
        ],
        suite: "Vale, solo el café." },
      { lui: "¿Pagas ahora o luego?",
        ok: "Pago luego, gracias.",
        pieges: [
          ["Pagas luego, gracias.", "¿Yo pago tu café? ¡Qué listo! 😄", "<i>pagas</i>, c'est « tu paies ». Pour toi : <i>pago</i>.", "personne"],
          ["Hasta luego, gracias.", "¿Hasta luego? ¡Pero si no te vas! 😅", "<i>¡hasta luego!</i> = à plus tard, pour partir. Ici : <i>pago luego</i>, je paie après.", "formule"],
        ],
        rires: [
          ["Luego voy al gimnasio.", "¡Qué deportista! Pero… ¿y el café? 😄", "Il demande si tu paies maintenant ou après."],
          ["Nunca tengo dinero.", "¡Ay, ay, ay! Entonces pagas ahora. 😄", "Il demande si tu paies maintenant ou après."],
        ],
        suite: "Vale, luego me pagas." },
      { lui: "¿Ya te vas? Son un euro con sesenta.",
        ok: "Vale, un euro con sesenta. ¡Gracias!",
        pieges: [
          ["Vale, dieciséis euros. ¡Gracias!", "¿Dieciséis? ¡Con eso te pongo diez cafés! 😄", "<i>sesenta</i> = 60 ; <i>dieciséis</i> = 16.", "nombre"],
          ["Vale, un euro con setenta. ¡Gracias!", "¿Setenta? ¡Gracias por la propina! 😄", "<i>sesenta</i> = 60 ; <i>setenta</i> = 70.", "nombre"],
        ],
        rires: [
          ["Mañana trabajo desde casa.", "¡Qué suerte! 😄 ¿Y el euro con sesenta?", "Il te dit le prix : <i>un euro con sesenta</i>."],
          ["¿Qué hora es?", "¡La hora de pagar! 😂", "Il te dit le prix : <i>un euro con sesenta</i>."],
        ],
        suite: "¡Gracias! ¡Hasta mañana!" },
    ],
  },
  {
    id: "u03-blanca-cena", lecon: "U3-L6", perso: "blanca", lieu: "par messages, en fin d'après-midi",
    echanges: [
      { lui: "¡Hola, cariño! ¿Dónde estás?",
        ok: "Estoy en el parque con Léo.",
        pieges: [
          ["Soy en el parque con Léo.", "¿Eres en el parque? 😅 ¡Estás, cariño, estás!", "Un lieu, c'est <i>estar</i> : <i>estoy en el parque</i>.", "ser-estar"],
          ["Estoy al parque con Léo.", "¿Al parque? ¿Vas o estás? 😄", "On est <i>en</i> un lieu : <i>en el parque</i>. <i>Al</i>, c'est « vers ».", "preposition"],
        ],
        rires: [
          ["Estoy en España.", "¡Ja! Más concreto, por favor. 😄", "Elle demande où tu es."],
          ["Soy francés.", "¡Ya lo sé! 😂 Pero ¿dónde estás?", "Elle demande où tu es."],
        ],
        suite: "¡Qué bien!" },
      { lui: "¿A qué hora llegáis a casa?",
        ok: "Llegamos a las seis y media.",
        pieges: [
          ["Llegáis a las seis y media.", "¿Yo? ¡Yo ya estoy en casa! 😅", "<i>llegáis</i>, c'est « vous arrivez ». Pour vous deux : <i>llegamos</i>.", "personne"],
          ["Llegamos en las seis y media.", "¿En las seis? 😅", "À six heures et demie : <i>a las seis y media</i>.", "heure"],
        ],
        rires: [
          ["Léo quiere ir a la playa.", "¿A la playa? ¡Estamos en Huesca, cariño! 😂", "Elle demande à quelle heure vous rentrez."],
          ["Los sábados no trabajo.", "Ya lo sé. 😄 Pero ¿a qué hora llegáis?", "Elle demande à quelle heure vous rentrez."],
        ],
        suite: "Vale. Yo llego a las siete." },
      { lui: "¿Y a qué hora cenamos?",
        ok: "Cenamos a las nueve, ¿vale?",
        pieges: [
          ["Cenamos a la nueve, ¿vale?", "¿A la nueve? 😅 A las nueve.", "Pour l'heure : <i>a las nueve</i> (sauf <i>a la una</i>).", "article"],
          ["Cenáis a las nueve, ¿vale?", "¿Y tú no cenas? 😅", "<i>cenáis</i>, c'est « vous dînez ». Pour nous : <i>cenamos</i>.", "personne"],
        ],
        rires: [
          ["Me ducho a las nueve.", "¿Cenas en la ducha? 😂", "Elle demande à quelle heure vous dînez."],
          ["Normalmente duermo la siesta.", "¿A las nueve de la noche? 😂 ¡Eso no es una siesta!", "Elle demande à quelle heure vous dînez."],
        ],
        suite: "Perfecto." },
      { lui: "¡Hasta luego, cariño! 😘",
        ok: "¡Hasta luego, Blanca!",
        pieges: [
          ["¡Buenos días, Blanca!", "¿Buenos días? ¡Son las cinco de la tarde! 😂", "Pour se quitter jusqu'à ce soir : <i>¡hasta luego!</i>", "formule"],
          ["¡Hasta mañana, Blanca!", "¿Mañana? ¿No vienes a cenar? 😱", "<i>¡hasta mañana!</i> = à demain. Vous vous voyez ce soir : <i>¡hasta luego!</i>", "formule"],
        ],
        rires: [
          ["Me levanto a las siete.", "Vale… ¡pero esto es una despedida! 😄", "Elle te dit au revoir : <i>¡hasta luego!</i>"],
          ["Tengo tres hermanas.", "¡Ya lo sé, cariño! 😂", "Elle te dit au revoir : <i>¡hasta luego!</i>"],
        ],
        suite: "😘" },
    ],
  },
  {
    id: "u04-marta-leo", lecon: "U4-L3", perso: "marta", lieu: "ta voisine, sur le palier, le matin",
    echanges: [
      { lui: "¡Hola, Kevin! ¿Hoy no llevas a Léo al cole?",
        ok: "No, hoy Léo está enfermo.",
        pieges: [
          ["No, hoy Léo es enfermo.", "¿Es enfermo? 😅 ¡Está enfermo, pobre!", "Malade aujourd'hui, c'est un état : <i>está enfermo</i>.", "ser-estar"],
          ["No, hoy Léo está enferma.", "¿Enferma? ¿Léo es una niña? 😅", "Léo est un garçon : <i>enfermo</i>, avec <i>o</i>.", "genre"],
        ],
        rires: [
          ["Blanca es muy simpática.", "¡Sí, mucho! 😊 Pero ¿y Léo?", "Elle demande pourquoi Léo ne va pas à l'école."],
          ["Dorian es el mayor.", "Sí, ya lo sé… ¿y Léo? 😄", "Elle demande pourquoi Léo ne va pas à l'école."],
        ],
        suite: "¡Ay, pobre!" },
      { lui: "¿Y qué tal está?",
        ok: "Está cansado y un poco triste.",
        pieges: [
          ["Es cansado y un poco triste.", "¿Es cansado? ¿Siempre? 😅", "Fatigué aujourd'hui, c'est un état : <i>está cansado</i>.", "ser-estar"],
          ["Estoy cansado y un poco triste.", "¿Tú también? ¡Ay, pobres! 😅", "<i>estoy</i>, c'est « je suis ». Pour Léo : <i>está</i>.", "personne"],
        ],
        rires: [
          ["Está en la cocina.", "Vale, pero ¿cómo está? 😄", "Elle demande comment il va, pas où il est."],
          ["Es muy guapo.", "¡Claro, como su padre! 😄 Pero ¿cómo está?", "Elle demande comment il va."],
        ],
        suite: "Pobrecito." },
      { lui: "¿Y duerme bien?",
        ok: "No, duerme mal.",
        pieges: [
          ["No, duermo mal.", "¿Tú también? ¡Ay! 😅", "<i>duermo</i>, c'est « je dors ». Pour Léo : <i>duerme</i>.", "personne"],
          ["No, mal duerme.", "¿Mal duerme? Suena a poema. 😅", "Le verbe d'abord : <i>duerme mal</i>.", "ordre"],
        ],
        rires: [
          ["No, hoy cocino yo.", "¡Muy bien! Pero ¿y Léo? 😄", "Elle demande si Léo dort bien."],
          ["Mi mochila es grande.", "¿Y eso? 😂", "Elle demande si Léo dort bien."],
        ],
        suite: "Ay, normal. Cuando estás malito, duermes mal." },
      { lui: "Bueno, ¡que se mejore! ¿Necesitas algo?",
        ok: "No, gracias. Eres muy simpática.",
        pieges: [
          ["No, gracias. Eres muy simpático.", "¿Simpático? ¡Soy Marta! 😅", "Marta est une femme : <i>simpática</i>.", "genre"],
          ["No, gracias. Estás muy simpática.", "¿Estoy? ¿Solo hoy? 😂", "Un trait de caractère, c'est <i>ser</i> : <i>eres muy simpática</i>.", "ser-estar"],
        ],
        rires: [
          ["Sí, un perro grande.", "¿Un perro? ¿Para un niño enfermo? 😂", "Elle te propose son aide."],
          ["Hoy es martes.", "Sí… ¿y? 😄", "Elle te propose son aide : <i>no, gracias</i>."],
        ],
        suite: "¡De nada! Un beso a Léo. ¡Hasta luego!" },
    ],
  },
  {
    id: "u04-nuria-cole", lecon: "U4-L4", perso: NURIA, lieu: "à la sortie de l'école, à cinq heures",
    echanges: [
      { lui: "¡Hola! ¿Eres el papá de Léo?",
        ok: "Sí, soy el padre de Léo.",
        pieges: [
          ["Sí, estoy el padre de Léo.", "¿Estás? 😅 ¡Eres su padre!", "Qui on est, c'est <i>ser</i> : <i>soy el padre</i>.", "ser-estar"],
          ["Sí, soy la padre de Léo.", "¿LA padre? 😅", "<i>padre</i> est masculin : <i>el padre</i>.", "article"],
        ],
        rires: [
          ["Sí, el recreo es a las once.", "¡Ya lo sé! 😂 Pero ¿eres el papá de Léo?", "Elle demande si tu es le papa de Léo."],
          ["Sí, mi mochila es grande.", "¿Tu mochila? 😂", "Elle demande si tu es le papa de Léo."],
        ],
        suite: "¡Encantada! Yo soy Nuria, la mamá de Lucía. Están en la misma clase." },
      { lui: "¿Cuántos años tiene Léo? Lucía tiene cuatro.",
        ok: "Léo también tiene cuatro años.",
        pieges: [
          ["Léo también tienes cuatro años.", "¿Tienes? ¿Yo? 😅", "<i>tienes</i>, c'est « tu as ». Pour Léo : <i>tiene</i>.", "personne"],
          ["Léo también tiene catorce años.", "¿Catorce? ¡Qué alto para catorce! 😂", "<i>cuatro</i> = 4 ; <i>catorce</i> = 14.", "nombre"],
        ],
        rires: [
          ["Léo tiene una bicicleta.", "¡Qué bien! Pero ¿cuántos años tiene? 😄", "Elle demande l'âge de Léo."],
          ["Tengo hambre.", "¡Yo también! 😂 Es la hora de merendar.", "Elle demande l'âge de Léo."],
        ],
        suite: "¡Igual que Lucía!" },
      { lui: "¿Y Dorian? ¿Cuántos años tiene?",
        ok: "Dorian tiene siete años. Es el mayor.",
        pieges: [
          ["Dorian tiene siete años. Está el mayor.", "¿Está el mayor? 😅 Es el mayor.", "Qui on est dans la famille, c'est <i>ser</i> : <i>es el mayor</i>.", "ser-estar"],
          ["Dorian tiene siete años. Es la mayor.", "¿La mayor? ¡Dorian es un chico! 😅", "Dorian est un garçon : <i>el mayor</i>.", "article"],
        ],
        rires: [
          ["Dorian lee mucho.", "¡Qué bien! Pero ¿cuántos años tiene? 😄", "Elle demande l'âge de Dorian."],
          ["La clase es grande.", "Sí… ¿y Dorian? 😄", "Elle demande l'âge de Dorian."],
        ],
        suite: "¡Siete! Ya tiene deberes, ¿no?" },
      { lui: "¡Uy, ya salen los niños! ¿Hablamos mañana?",
        ok: "¡Vale! Hablamos mañana.",
        pieges: [
          ["¡Vale! Hablas mañana.", "¿Yo hablo? ¿Y tú no? 😅", "<i>hablas</i>, c'est « tu parles ». Pour « on parle » : <i>hablamos</i>.", "personne"],
          ["¡Vale! ¡Buenos días!", "¿Buenos días? ¡Son las cinco! 😂", "Pour se quitter jusqu'au lendemain : <i>hablamos mañana</i> ou <i>¡hasta mañana!</i>", "formule"],
        ],
        rires: [
          ["Léo tiene deberes.", "¿A los cuatro años? 😂 ¡Qué exagerado!", "Elle te propose de parler demain."],
          ["El libro es grande.", "¿Qué libro? 😂", "Elle te propose de parler demain."],
        ],
        suite: "¡Hasta mañana! ¡Adiós, Léo!" },
    ],
  },
  {
    id: "u05-luis-ascensor", lecon: "U5-L2", perso: LUIS, lieu: "Luis, le voisin du dessus, dans l'ascenseur",
    echanges: [
      { lui: "¡Hola, Kevin! ¿Qué tal?",
        ok: "Bien, gracias. ¿Y usted?",
        pieges: [
          ["Bien, gracias. ¿Y vosotros?", "¿Vosotros? ¡Si estoy solo! 😅", "Il est seul : <i>¿y usted?</i> (ou <i>¿y tú?</i>). <i>Vosotros</i>, c'est « vous » à plusieurs.", "personne"],
          ["Está bien, gracias. ¿Y usted?", "¿Quién está bien? 😅", "<i>está</i>, c'est « il est ». Pour toi : <i>estoy bien</i>, ou juste <i>bien</i>.", "personne"],
        ],
        rires: [
          ["Son las ocho y cuarto.", "¡Gracias! Pero te preguntaba qué tal. 😄", "Il demande comment tu vas."],
          ["Mi coche es pequeño.", "¡Como este ascensor! 😂", "Il demande comment tu vas."],
        ],
        suite: "Bien, bien, gracias." },
      { lui: "¡Qué frío hace hoy!, ¿no?",
        ok: "Sí, hace mucho frío.",
        pieges: [
          ["Sí, hago mucho frío.", "¿Tú haces frío? 😂 ¡Eres una nevera!", "<i>hago</i>, c'est « je fais ». Le temps qu'il fait : <i>hace frío</i>.", "personne"],
          ["Sí, hace muy frío.", "¿Muy frío? 😅 Mucho frío.", "Devant un nom : <i>mucho frío</i>. <i>Muy</i>, c'est devant un adjectif (<i>muy alto</i>)."],
        ],
        rires: [
          ["Sí, me ducho por la noche.", "Con este frío, ¡con agua caliente! 😂", "Il parle du froid."],
          ["Sí, hoy trabajo mucho.", "¡Pues mejor en casa, con este frío! 😄", "Il parle du froid."],
        ],
        suite: "Y mañana, dicen que llueve." },
      { lui: "¿Vais a la montaña este fin de semana?",
        ok: "No, si llueve no vamos a la montaña.",
        pieges: [
          ["No, si llueve no van a la montaña.", "¿Quiénes no van? 😅", "<i>van</i>, c'est « ils vont ». Pour vous : <i>vamos</i>.", "personne"],
          ["No, si llueve no vamos en la montaña.", "¿En la montaña? 😅 A la montaña.", "Aller quelque part : <i>a</i> → <i>vamos a la montaña</i>.", "preposition"],
        ],
        rires: [
          ["Sí, en invierno hace frío.", "¡Gracias, señor meteorólogo! 😂", "Il demande si vous allez à la montagne."],
          ["Hace sol en París.", "¡Pues vamos a París! 😂", "Il demande si vous allez à la montagne."],
        ],
        suite: "Claro, con lluvia, mejor en casa." },
      { lui: "Bueno, este es mi piso. ¡Adiós, Kevin! ¡Y abrígate!",
        ok: "¡Gracias! ¡Hasta luego!",
        pieges: [
          ["¡De nada! ¡Hasta luego!", "¿De nada? ¡Si te doy un consejo! 😅", "Il te donne un conseil : <i>gracias</i>. <i>De nada</i> répond à un merci.", "formule"],
          ["¡Gracias! ¡Hasta luego, señora!", "¿Señora? ¡Soy Luis! 😂", "<i>señora</i> = madame. Pour Luis : <i>señor</i>.", "genre"],
        ],
        rires: [
          ["Llueve en invierno.", "Sí, sí… ¡adiós! 😄", "Il te dit au revoir."],
          ["Mi piso es grande.", "¡Qué suerte! El mío es pequeño. 😄 ¡Adiós!", "Il te dit au revoir."],
        ],
        suite: "¡Adiós!" },
    ],
  },
  {
    id: "u05-javier-noticias", lecon: "U5-L3", perso: "javier", lieu: "à la salle de sport, Javier a des nouvelles",
    echanges: [
      { lui: "¡Kevin! ¡El domingo corro una maratón! ¡Cuarenta y dos kilómetros!",
        ok: "¿En serio? ¡Qué bien!",
        pieges: [
          ["¿En serio? ¡Qué pena!", "¿Qué pena? ¡Es una buena noticia! 😅", "<i>¡qué pena!</i> = quel dommage. Pour une bonne nouvelle : <i>¡qué bien!</i>", "formule"],
          ["¿En serio? ¡Qué horror!", "¿Horror? ¡Correr es lo mejor! 😤😂", "<i>¡qué horror!</i> = quelle horreur. Pour une bonne nouvelle : <i>¡qué bien!</i>", "formule"],
        ],
        rires: [
          ["Duermo mucho.", "¡Yo no, yo corro! 😂", "Il t'annonce une nouvelle : réagis !"],
          ["Hoy hace sol.", "¡Perfecto para correr! 😄", "Il t'annonce une nouvelle : réagis !"],
        ],
        suite: "¡Sí!" },
      { lui: "¿Vienes a correr conmigo? ¡Es muy fácil!",
        ok: "¡Claro que no! ¡Qué horror!",
        pieges: [
          ["¡Claro! ¡Qué horror!", "¿Vienes? ¡Genial! … Ah, ¿no? 😅", "<i>¡claro!</i> tout seul = « bien sûr ! », donc oui. Pour non : <i>¡claro que no!</i>", "formule"],
          ["¡Claro que no! ¡Qué suerte!", "¿Qué suerte? 😅", "<i>¡qué suerte!</i> = quelle chance. Pour dire « l'horreur » : <i>¡qué horror!</i>", "formule"],
        ],
        rires: [
          ["Mi coche es grande.", "¡Pero es a pie, Kevin! 😂", "Il t'invite à courir avec lui."],
          ["Son las doce.", "¡Hora de correr! 😂", "Il t'invite à courir avec lui."],
        ],
        suite: "¡Jaja! Vale, vale. Pero tengo otra noticia…" },
      { lui: "Y otra noticia: ¡me caso en mayo!",
        ok: "¡Genial! Nosotros también nos casamos.",
        pieges: [
          ["¡Genial! Nosotros también se casan.", "¿Quiénes? 😅", "<i>se casan</i>, c'est « ils se marient ». Pour vous : <i>nos casamos</i>.", "personne"],
          ["¡Vaya! Nosotros también nos casamos.", "¿Vaya? ¿No te alegras? 😅", "<i>¡vaya!</i> marque la surprise ou la déception. Pour une bonne nouvelle : <i>¡genial!</i>", "formule"],
        ],
        rires: [
          ["Hace calor en mayo.", "¡Sí, en la boda vamos a sudar! 😂", "Il t'annonce son mariage : réagis !"],
          ["Tengo hambre.", "¿Ya piensas en el banquete? 😂", "Il t'annonce son mariage : réagis !"],
        ],
        suite: "¡No me digas!" },
      { lui: "¿Y cuándo os casáis vosotros?",
        ok: "El diecinueve de junio. ¡Estoy muy nervioso!",
        pieges: [
          ["El diecinueve de junio. ¡Soy muy nervioso!", "¿Siempre? ¡Pues no lo pareces! 😅", "Nerveux en ce moment : <i>estoy nervioso</i>. <i>Soy nervioso</i>, c'est ton caractère.", "ser-estar"],
          ["El nueve de junio. ¡Estoy muy nervioso!", "¿El nueve? Blanca me dijo el diecinueve… 😅", "<i>diecinueve</i> = 19 ; <i>nueve</i> = 9.", "nombre"],
        ],
        rires: [
          ["Mañana llueve.", "Vale… ¿y la boda? 😄", "Il demande quand vous vous mariez."],
          ["¡Qué frío!", "¿Frío? ¡En junio! 😂", "Il demande quand vous vous mariez."],
        ],
        suite: "¡Dos bodas! ¡A entrenar para bailar!" },
    ],
  },
  {
    id: "u05-blanca-finde", lecon: "U5-L5", perso: "blanca", lieu: "par messages, un samedi",
    echanges: [
      { lui: "¡Hola, cariño! ¿Qué estás haciendo?",
        ok: "Estoy trabajando con el ordenador.",
        pieges: [
          ["Soy trabajando con el ordenador.", "¿Eres trabajando? 😅", "« En train de » : <i>estar</i> + <i>-ando</i> → <i>estoy trabajando</i>.", "ser-estar"],
          ["Está trabajando con el ordenador.", "¿Quién? ¿Tu ordenador? 😂", "<i>está</i>, c'est « il est ». Pour toi : <i>estoy</i>.", "personne"],
        ],
        rires: [
          ["Hablo un poco de francés.", "¿Un poco? 😂 ¡Eres francés!", "Elle demande ce que tu es en train de faire."],
          ["Léo es pequeño.", "Sí, cariño, ya lo sé. 😄 ¿Y tú qué haces?", "Elle demande ce que tu es en train de faire."],
        ],
        suite: "¿Un sábado? ¡Pobre!" },
      { lui: "¿Y los niños? ¿Qué están haciendo?",
        ok: "Están comiendo en la cocina.",
        pieges: [
          ["Están comiendo a la cocina.", "¿A la cocina? 😅", "On est <i>en</i> un lieu : <i>en la cocina</i>.", "preposition"],
          ["Estamos comiendo en la cocina.", "¿Tú también? ¿No estabas trabajando? 😂", "<i>estamos</i>, c'est « nous sommes ». Pour les enfants : <i>están</i>.", "personne"],
        ],
        rires: [
          ["La cocina es grande.", "Ya lo sé, cariño. 😄 Vivo ahí.", "Elle demande ce que font les enfants."],
          ["Mañana llueve.", "Vale… ¿y los niños? 😄", "Elle demande ce que font les enfants."],
        ],
        suite: "¡Qué bien!" },
      { lui: "¿Y qué plan tenemos para el finde?",
        ok: "Este finde descansamos en casa.",
        pieges: [
          ["Esta finde descansamos en casa.", "¿Esta finde? 😅", "<i>finde</i> est masculin : <i>este finde</i>.", "genre"],
          ["Este finde descansáis en casa.", "¿Y tú? ¿Trabajas? 😅", "<i>descansáis</i>, c'est « vous vous reposez ». Pour vous deux : <i>descansamos</i>.", "personne"],
        ],
        rires: [
          ["Tengo un problema con el ordenador.", "¡Ay! ¿Otra vez? 😂 ¿Y el finde?", "Elle demande le programme du week-end."],
          ["Los niños tienen hambre.", "¡Siempre! 😂 ¿Y el finde?", "Elle demande le programme du week-end."],
        ],
        suite: "¡Perfecto! Peli y sofá." },
      { lui: "Te quiero. 😘",
        ok: "¡Yo también te quiero!",
        pieges: [
          ["¡Yo también me quiero!", "¿Te quieres a ti? 😂 ¡Qué modesto!", "<i>me quiero</i> = « je m'aime ». Pour elle : <i>te quiero</i>.", "personne"],
          ["¡Yo también! De nada.", "¿De nada? 😂 ¡Qué romántico!", "<i>de nada</i> répond à un merci. Ici : <i>¡yo también te quiero!</i>", "formule"],
        ],
        rires: [
          ["Estoy comiendo.", "¡Siempre comiendo! 😂 Te quiero igual.", "Elle te dit qu'elle t'aime !"],
          ["El ordenador funciona.", "¡Qué romántico! 😂", "Elle te dit qu'elle t'aime !"],
        ],
        suite: "😘😘" },
    ],
  },
  {
    id: "u05-marta-prisa", lecon: "U5-L6", perso: "marta", lieu: "ta voisine, devant l'immeuble (tu es pressé)",
    echanges: [
      { lui: "¡Kevin! ¡Cuánto tiempo! ¿Qué tal todo?",
        ok: "¡Hola, Marta! Bien, gracias, ¿y tú?",
        pieges: [
          ["¡Hola, Marta! Bien, gracias, ¿y usted?", "¿Usted? ¡Que no soy tan mayor! 😂", "Marta, tu la tutoies : <i>¿y tú?</i>. <i>Usted</i>, c'est pour vouvoyer.", "personne"],
          ["¡Hola, Marta! Bien, de nada, ¿y tú?", "¿De nada? 😅", "Pour remercier : <i>gracias</i>. <i>De nada</i> = de rien.", "formule"],
        ],
        rires: [
          ["Hoy hace mucho viento.", "¡Sí! Me despeina. 😂 Pero ¿tú qué tal?", "Elle demande comment tu vas."],
          ["Tengo hambre.", "¡Yo también! 😂 Pero ¿qué tal todo?", "Elle demande comment tu vas."],
        ],
        suite: "¡Muy bien!" },
      { lui: "Oye, ¿sabes lo del vecino del quinto? Pues resulta que su perro…",
        ok: "Perdona, Marta, tengo prisa.",
        pieges: [
          ["Perdona, Marta, tienes prisa.", "¿Yo? ¡Yo tengo todo el día! 😂", "<i>tienes</i>, c'est « tu as ». Pour toi : <i>tengo prisa</i>.", "personne"],
          ["Perdona, Marta, tengo una prisa.", "¿Una prisa? 😅", "Être pressé : <i>tengo prisa</i>, sans <i>una</i>.", "article"],
        ],
        rires: [
          ["Sí, el perro es grande.", "¡Enorme! Pues resulta que… 😄", "Si tu réponds, elle continue ! Tu es pressé : <i>tengo prisa</i>."],
          ["¿Quién es el vecino?", "¡Luis, el del quinto! Pues resulta que… 😂", "Si tu poses une question, elle continue ! Tu es pressé : <i>tengo prisa</i>."],
        ],
        suite: "¡Uy, perdona!" },
      { lui: "¡Ay, perdona! Es que yo hablo mucho, ¿eh?",
        ok: "No importa. Me tengo que ir.",
        pieges: [
          ["No importa. Me tengo que voy.", "¿Tengo que voy? 😅", "Après <i>tengo que</i>, l'infinitif : <i>me tengo que ir</i>.", "temps"],
          ["No importa. Te tengo que ir.", "¿Me tengo que ir yo? 😅", "<i>me tengo que ir</i> : <i>me</i>, c'est toi qui pars.", "personne"],
        ],
        rires: [
          ["Sí, hablas mucho.", "¡Oye! 😂 Bueno… es verdad.", "C'est vrai… mais pas très poli ! Pour partir gentiment : <i>no importa, me tengo que ir</i>."],
          ["Me ducho por la noche.", "¿Y eso a qué viene? 😂", "Pour partir gentiment : <i>no importa, me tengo que ir</i>."],
        ],
        suite: "¡Vale, vale, vete!" },
      { lui: "¡Un beso a Blanca y a los niños!",
        ok: "¡Gracias! ¡Nos vemos!",
        pieges: [
          ["¡Gracias! ¡Os vemos!", "¿Os? ¡Si estoy sola! 😅", "<i>nos vemos</i> = « on se voit ». <i>Os vemos</i> = « on vous voit ».", "personne"],
          ["¡De nada! ¡Nos vemos!", "¿De nada? 😅", "Elle t'envoie un bisou : <i>gracias</i>. <i>De nada</i> répond à un merci.", "formule"],
        ],
        rires: [
          ["Mi familia vive en París.", "¡Pues un beso a París también! 😂", "Elle te dit au revoir : <i>¡nos vemos!</i>"],
          ["Llueve mucho en invierno.", "Sí… ¡pero vete ya! 😂", "Elle te dit au revoir : <i>¡nos vemos!</i>"],
        ],
        suite: "¡Hasta luego, Kevin!" },
    ],
  },
];
