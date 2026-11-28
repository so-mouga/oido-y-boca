// La Charla, les conversations des unités 6 à 10. Le format est décrit dans charlas/index.js.
// Écrites par la session de contenu de ce bloc ; vérifiées par : node outils/test-charla.mjs <vocabulaire.csv>

// Les personnes du bloc (hors troupe). Nuria revient du bloc U1-U5 (même fiche).
const NURIA = { nom: "Nuria", qui: "une maman de la classe de Léo", couleur: ["#2E7D4F", "#C68B5E"] };
const SERGIO = { nom: "Sergio", qui: "un ami de Blanca", couleur: ["#B5651D", "#D9A47A"] };
const PILAR = { nom: "Pilar", qui: "l'épicière du quartier", couleur: ["#8C2F39", "#E8B98E"] };
const CARMEN = { nom: "Carmen", qui: "une amie de Blanca, qui vous reçoit pour les fêtes", couleur: ["#1F6E43", "#F0C9A0"] };
const ANDRES = { nom: "Andrés", qui: "le maître de Dorian", couleur: ["#34568B", "#C68B5E"] };
const ELENA = { nom: "Elena", qui: "la maîtresse de Léo", couleur: ["#C2557A", "#E8B98E"] };

export const CHARLAS = [
  {
    id: "u06-camarero-tapa", lecon: "U6-L4", perso: "camarero", lieu: "au comptoir du bar de la plaza, à l'heure de l'apéro",
    echanges: [
      { lui: "¡Buenas! Rápido, que hay mucha gente: ¿qué te pongo?",
        ok: "¿Me pones una caña y un agua, por favor?",
        pieges: [
          ["¿Me pones una caña y una agua, por favor?", "¿Una agua? 😅 Un agua, un agua.", "<i>agua</i> est féminin, mais on dit <i>un agua</i> (et <i>el agua</i>) : les deux « a » ne se collent pas.", "article"],
          ["¿Me pones un caña y un agua, por favor?", "¿Un caña? 😅 Una caña.", "<i>caña</i> est féminin : <i>una caña</i>.", "article"],
        ],
        rires: [
          ["Me gusta mucho cocinar.", "¡Pues aquí cocino yo! 😄 ¿Qué te pongo?", "Il demande ce que tu veux boire."],
          ["Odio levantarme temprano.", "¡Y yo! 😂 Pero… ¿qué te pongo?", "Il demande ce que tu veux boire."],
        ],
        suite: "Marchando una caña y un agua." },
      { lui: "¿Y de tapa? ¿Te gustan las aceitunas?",
        ok: "Sí, me gustan mucho.",
        pieges: [
          ["Sí, me gusta mucho.", "¿Te gusta? ¿Cuál? ¡Son muchas aceitunas! 😄", "<i>las aceitunas</i>, c'est un pluriel : <i>me gustan</i>.", "gustar"],
          ["Sí, yo gusto mucho.", "¿Tú gustas? ¡Ya, ya, eres muy guapo! 😂", "<i>yo gusto</i> = « je plais ». Pour dire que tu aimes : <i>me gustan</i>.", "gustar"],
        ],
        rires: [
          ["Léo come mucho pan.", "¡Pues que venga Léo! 😂 ¿Y tú? ¿Aceitunas?", "Il demande si tu aimes les olives."],
          ["Hoy hace mucho viento.", "¡Uf, sí! 😄 Pero ¿y las aceitunas?", "Il demande si tu aimes les olives."],
        ],
        suite: "Pues una de aceitunas, marchando." },
      { lui: "Y esto es la tortilla de la casa. Pruébala. ¿Qué tal?",
        ok: "¡Está muy rica!",
        pieges: [
          ["¡Es muy rica!", "¿Todas las tortillas del mundo? 😄", "Celle-ci, maintenant : <i>está rica</i>. <i>Es rica</i>, c'est la tortilla en général.", "ser-estar"],
          ["¡Está muy rico!", "¿Rico? ¡La tortilla es chica! 😅", "<i>tortilla</i> est féminin : <i>rica</i>.", "genre"],
        ],
        rires: [
          ["El pan es barato.", "Aquí también. 😄 ¿Y la tortilla?", "Il demande si la tortilla est bonne."],
          ["Estoy en el gimnasio.", "¿En el gimnasio? ¡Estás en mi bar! 😂", "Il demande si la tortilla est bonne."],
        ],
        suite: "¡La hace mi madre!" },
      { lui: "¿Algo más? ¿Otra caña?",
        ok: "No, gracias, estoy lleno. La cuenta, por favor.",
        pieges: [
          ["No, gracias, soy lleno. La cuenta, por favor.", "¿Eres lleno? ¿Siempre? 😂", "Rassasié maintenant, c'est un état : <i>estoy lleno</i>.", "ser-estar"],
          ["No, gracias, estoy llena. La cuenta, por favor.", "¿Llena? 😄 ¡Lleno, hombre!", "Pour un homme : <i>lleno</i>. <i>Llena</i>, c'est pour une femme.", "genre"],
        ],
        rires: [
          ["Los domingos como con Blanca.", "¡Pues el domingo venís aquí! 😄", "Il demande si tu veux autre chose."],
          ["Me da igual.", "¿Te da igual? ¡Pues te pongo otra! 😂", "Il demande si tu veux autre chose : <i>no, gracias</i>."],
        ],
        suite: "Son cuatro euros. ¡Gracias, hasta luego!" },
    ],
  },
  {
    id: "u06-sergio-terraza", lecon: "U6-L5", perso: SERGIO, lieu: "Sergio, un ami de Blanca, croisé dans la rue",
    echanges: [
      { lui: "¡Hola, Kevin! Soy Sergio, el amigo de Blanca. ¿Te apetece quedar el sábado en una terraza?",
        ok: "¡Sí, me apetece mucho!",
        pieges: [
          ["¡Sí, me apetecen mucho!", "¿Te apetecen? ¿Muchas terrazas? 😄", "Une seule sortie : <i>me apetece</i>, au singulier.", "gustar"],
          ["¡Sí, te apetece mucho!", "¿A mí? ¡Claro, por eso te lo digo! 😂", "<i>te apetece</i> = « ça te dit ». Pour toi : <i>me apetece</i>.", "personne"],
        ],
        rires: [
          ["Me gusta mucho cocinar.", "¡Pues un día cocinas tú! 😄 ¿Y el sábado?", "Il te propose de sortir samedi."],
          ["Odio levantarme temprano.", "¡Es por la tarde, tranquilo! 😂", "Il te propose de sortir samedi."],
        ],
        suite: "¡Genial! Con Blanca, claro." },
      { lui: "¿Prefieres la terraza de la plaza o un restaurante?",
        ok: "Prefiero la terraza, me gusta mucho salir.",
        pieges: [
          ["Prefiero la terraza, me gustan mucho salir.", "¿Gustan? 😅 Me gusta.", "Avec un verbe (<i>salir</i>), toujours <i>me gusta</i>.", "gustar"],
          ["Prefiero el terraza, me gusta mucho salir.", "¿El terraza? 😅", "<i>terraza</i> est féminin : <i>la terraza</i>.", "article"],
        ],
        rires: [
          ["Los viernes salimos a cenar.", "¡Pues el sábado también! 😄 ¿Terraza o restaurante?", "Il te demande : terrasse ou restaurant ?"],
          ["Mi coche es pequeño.", "¡Vamos a pie! 😂 ¿Terraza o restaurante?", "Il te demande : terrasse ou restaurant ?"],
        ],
        suite: "¡Vale, la terraza! Si hace sol, mejor." },
      { lui: "Yo no bebo vino, no me gusta nada.",
        ok: "¡A mí tampoco! Prefiero una caña.",
        pieges: [
          ["¡A mí también! Prefiero una caña.", "¿También? Entonces te gusta… ¿o no? 😅", "Il dit qu'il n'aime pas. Pour être d'accord : <i>a mí tampoco</i>. <i>También</i>, c'est après une phrase positive.", "formule"],
          ["¡Me tampoco! Prefiero una caña.", "¿Me tampoco? 😅 A mí tampoco.", "Avec <i>gustar</i> : <i>a mí tampoco</i>, jamais <i>me tampoco</i>.", "gustar"],
        ],
        rires: [
          ["El pan es barato.", "Sí… ¿y el vino? 😄", "Il dit qu'il n'aime pas le vin : <i>a mí tampoco</i>."],
          ["Estoy lleno.", "¿Ya? ¡Si todavía no estamos en la terraza! 😂", "Il dit qu'il n'aime pas le vin : <i>a mí tampoco</i>."],
        ],
        suite: "¡Bien! Somos dos." },
      { lui: "Entonces, el sábado a las siete, ¿vale?",
        ok: "¡Vale! A las siete en la terraza.",
        pieges: [
          ["¡Vale! A los siete en la terraza.", "¿A los siete? 😅 A las siete.", "Pour l'heure : <i>a las siete</i>.", "heure"],
          ["¡Vale! A las siete a la terraza.", "¿A la terraza? 😅 En la terraza.", "Le rendez-vous est dans un lieu : <i>en la terraza</i>.", "preposition"],
        ],
        rires: [
          ["Me encanta Huesca.", "¡Y a mí! 😄 Entonces, ¿a las siete?", "Il te donne rendez-vous samedi à sept heures."],
          ["Hoy es martes.", "Sí… ¡pero hablo del sábado! 😂", "Il te donne rendez-vous samedi à sept heures."],
        ],
        suite: "¡Perfecto! Un beso a Blanca." },
    ],
  },
  {
    id: "u06-javier-gustos", lecon: "U6-L6", perso: "javier", lieu: "à la salle de sport, entre deux séries",
    echanges: [
      { lui: "Kevin, ¿qué te gusta hacer el fin de semana? Deporte, ¿no?",
        ok: "No mucho. Me gusta leer y escuchar música.",
        pieges: [
          ["No mucho. Me gustan leer y escuchar música.", "¿Gustan? 😅", "Avec des verbes, toujours <i>me gusta</i> : <i>me gusta leer</i>, même avec deux.", "gustar"],
          ["No mucho. Me gusta lee y escuchar música.", "¿Me gusta lee? 😅 Leer, leer.", "Après <i>me gusta</i>, l'infinitif : <i>me gusta leer</i>.", "temps"],
        ],
        rires: [
          ["Pido una caña.", "¿Aquí? ¡Esto es un gimnasio! 😂", "Il demande ce que tu aimes faire le week-end."],
          ["La cuenta, por favor.", "¿La cuenta? ¡Aquí no hay cuenta! 😂", "Il demande ce que tu aimes faire le week-end."],
        ],
        suite: "¿Leer? ¿Sentado? 😱" },
      { lui: "¿Y a Blanca? ¿Qué le gusta?",
        ok: "A Blanca le gustan las series.",
        pieges: [
          ["A Blanca me gustan las series.", "¿Te gustan a ti o a ella? 😅", "Pour Blanca : <i>le gustan</i>. <i>Me</i>, c'est pour toi.", "personne"],
          ["A Blanca le gusta las series.", "¿Gusta? ¡Son muchas series! 😄", "<i>las series</i>, c'est un pluriel : <i>le gustan</i>.", "gustar"],
        ],
        rires: [
          ["Blanca es muy simpática.", "¡Sí, mucho! 😊 Pero ¿qué le gusta?", "Il demande ce qu'aime Blanca."],
          ["Blanca trabaja mucho.", "¡Pobre! 😄 Pero ¿qué le gusta hacer?", "Il demande ce qu'aime Blanca."],
        ],
        suite: "¡Como mi novia! Todas las noches, series." },
      { lui: "¿Y viajar? ¿Os gusta?",
        ok: "¡Sí, nos encanta viajar!",
        pieges: [
          ["¡Sí, nos encantan viajar!", "¿Encantan? 😅", "Avec un verbe : <i>nos encanta viajar</i>, au singulier.", "gustar"],
          ["¡Sí, os encanta viajar!", "¿A nosotros? ¡Te pregunto a vosotros! 😂", "<i>os</i> = à vous. Pour vous deux : <i>nos encanta</i>.", "personne"],
        ],
        rires: [
          ["Me gusta el pescado.", "¡Proteínas! 💪 Pero ¿y viajar?", "Il demande si vous aimez voyager."],
          ["El vino es caro.", "¡Viajar también! 😂", "Il demande si vous aimez voyager."],
        ],
        suite: "¡A mí también! Pero viajo para correr maratones. 😄" },
      { lui: "¡Pues a mí no me gustan las películas! Me duermo.",
        ok: "A mí sí. Me encantan las películas.",
        pieges: [
          ["A mí también. Me encantan las películas.", "¿También? ¡Pero si a mí no me gustan! 😅", "Il n'aime pas et toi, tu aimes : <i>a mí sí</i>. <i>A mí también</i> = moi aussi.", "formule"],
          ["A mí sí. Me encanta las películas.", "¿Encanta? ¡Son muchas! 😄", "<i>las películas</i>, c'est un pluriel : <i>me encantan</i>.", "gustar"],
        ],
        rires: [
          ["Leo un poco en español cada día.", "¡Muy bien! Pero ¿y las películas? 😄", "Il dit qu'il n'aime pas les films : et toi ?"],
          ["Quiero agua.", "¡Toma, agua! Hay que beber. 💪😂", "Il dit qu'il n'aime pas les films : et toi ?"],
        ],
        suite: "¡Bueno! Tú películas, yo pesas. 💪" },
    ],
  },
  {
    id: "u07-blanca-cena", lecon: "U7-L4", perso: "blanca", lieu: "par messages, avant le dîner",
    echanges: [
      { lui: "¡Hola, cariño! Llego a las nueve. ¿Haces tú la cena hoy?",
        ok: "Sí, hoy hago yo la cena.",
        pieges: [
          ["Sí, hoy hace yo la cena.", "¿Hace yo? 😅", "<i>hacer</i> est irrégulier avec <i>yo</i> : <i>hago</i>.", "personne"],
          ["Sí, hoy pongo yo la cena.", "¿Pones la cena? ¿Dónde? 😂", "Cuisiner : <i>hacer la cena</i>. <i>Poner</i>, c'est pour la table : <i>pongo la mesa</i>."],
        ],
        rires: [
          ["El baño está al lado del dormitorio.", "Ya lo sé, cariño, vivo ahí. 😂", "Elle demande si tu fais le dîner."],
          ["No encuentro las llaves.", "¿Otra vez? 😂 ¿Y la cena?", "Elle demande si tu fais le dîner."],
        ],
        suite: "¡Qué bien! ¿Y los niños?" },
      { lui: "¿Y los niños? ¿Te ayudan?",
        ok: "Sí, Dorian pone la mesa y Léo trae los vasos.",
        pieges: [
          ["Sí, Dorian pongo la mesa y Léo trae los vasos.", "¿Pongo? ¿Tú o Dorian? 😅", "<i>pongo</i> = je mets. Pour Dorian : <i>pone</i>.", "personne"],
          ["Sí, Dorian pone la mesa y Léo trae las vasos.", "¿Las vasos? 😅", "<i>vaso</i> est masculin : <i>los vasos</i>.", "article"],
        ],
        rires: [
          ["En el salón hay una mesa grande.", "Sí, cariño, ya lo sé. 😄 ¿Y los niños?", "Elle demande si les enfants t'aident."],
          ["Me encanta Huesca.", "¡A mí también! 😄 Pero ¿y los niños?", "Elle demande si les enfants t'aident."],
        ],
        suite: "¡Muy bien, equipo!" },
      { lui: "Oye, ¿mi libro está en el salón? Lo necesito mañana.",
        ok: "No, está en el dormitorio, al lado de la silla.",
        pieges: [
          ["No, hay en el dormitorio, al lado de la silla.", "¿Hay? ¿Hay qué? 😅", "Une chose qu'on connaît (son livre) : <i>está</i>. <i>Hay</i>, c'est « il y a », pour une chose nouvelle."],
          ["No, es en el dormitorio, al lado de la silla.", "¿Es en el dormitorio? 😅 Está.", "Un lieu, c'est <i>estar</i> : <i>está en el dormitorio</i>.", "ser-estar"],
        ],
        rires: [
          ["El tenedor está en el suelo.", "¿En el suelo? ¡Pues a recogerlo! 😂", "Elle demande où est son livre."],
          ["Mi ordenador está al lado de la silla.", "¡No tu ordenador, mi libro! 😂", "Elle demande où est son livre."],
        ],
        suite: "¡Ah, vale! Gracias." },
      { lui: "Traigo pan, ¿vale?",
        ok: "¡Vale, gracias! Aquí no hay pan.",
        pieges: [
          ["¡Vale, gracias! Aquí no está pan.", "¿No está pan? 😅 No hay pan.", "Pour dire qu'il n'y en a pas : <i>no hay pan</i>."],
          ["¡Vale, gracias! Aquí no hay el pan.", "¿El pan? 😅 No hay pan.", "Après <i>hay</i>, pas de <i>el</i> : <i>no hay pan</i>.", "article"],
        ],
        rires: [
          ["Odio levantarme temprano.", "¿Y eso qué tiene que ver con el pan? 😂", "Elle propose d'apporter du pain."],
          ["La cuchara está en el plato.", "¡Qué detalle! 😂 ¿Y el pan?", "Elle propose d'apporter du pain."],
        ],
        suite: "¡Hasta ahora! 😘" },
    ],
  },
  {
    id: "u07-marta-llaves", lecon: "U7-L5", perso: "marta", lieu: "ta voisine, dans l'entrée de l'immeuble",
    echanges: [
      { lui: "¡Kevin! ¡Ay! No encuentro mis llaves. ¿Las ves por aquí?",
        ok: "No. ¿Están en tu coche?",
        pieges: [
          ["No. ¿Están en mi coche?", "¿En TU coche? ¿Por qué? 😂", "<i>mi coche</i> = ma voiture. La sienne : <i>tu coche</i>.", "personne"],
          ["No. ¿Son en tu coche?", "¿Son? 😅 ¿Están?", "Un lieu, c'est <i>estar</i> : <i>¿están en tu coche?</i>", "ser-estar"],
        ],
        rires: [
          ["Bajo la basura y vuelvo.", "Vale… ¿y mis llaves? 😅", "Elle cherche ses clés."],
          ["El ascensor no funciona.", "¡Ay, no! ¡Más problemas! 😱", "Elle cherche ses clés."],
        ],
        suite: "No, en el coche no están…" },
      { lui: "¿Y tú de dónde vienes?",
        ok: "Vengo del gimnasio.",
        pieges: [
          ["Vienes del gimnasio.", "¿Yo? ¡Yo no voy al gimnasio! 😂", "<i>vienes</i> = tu viens. Pour toi : <i>vengo</i>.", "personne"],
          ["Vengo al gimnasio.", "¿Vienes o vas? 😅", "D'où tu viens : <i>de</i> → <i>vengo del gimnasio</i>.", "preposition"],
        ],
        rires: [
          ["Te espero en el portal.", "¡Pero si ya estamos en el portal! 😂", "Elle demande d'où tu viens."],
          ["Me encantan las series.", "¡A mí también! 😄 Pero ¿de dónde vienes?", "Elle demande d'où tu viens."],
        ],
        suite: "¡Siempre en el gimnasio, como Javier!" },
      { lui: "¡Uy! ¿Qué es eso, ahí, al lado del ascensor?",
        ok: "¡Son tus llaves! Están en el suelo.",
        pieges: [
          ["¡Son mis llaves! Están en el suelo.", "¿Tuyas? ¡No, son mías! 😂", "<i>mis llaves</i> = mes clés. Les siennes : <i>tus llaves</i>.", "personne"],
          ["¡Están tus llaves! Están en el suelo.", "¿Están tus llaves? 😅 Son mis llaves.", "Pour dire ce qu'est une chose : <i>ser</i> → <i>son tus llaves</i>.", "ser-estar"],
        ],
        rires: [
          ["Es el ascensor.", "Ya, ya… ¿y al lado? 😂", "Elle montre quelque chose à côté de l'ascenseur."],
          ["En el salón hay una mesa grande.", "¿Y eso qué tiene que ver? 😂", "Elle montre quelque chose à côté de l'ascenseur."],
        ],
        suite: "¡Mis llaves! ¡Gracias, Kevin! ¡Eres un sol!" },
      { lui: "¿Subes conmigo en el ascensor?",
        ok: "No, gracias. Bajo la basura y vuelvo.",
        pieges: [
          ["No, gracias. Bajo la basura y vuelves.", "¿Yo vuelvo? 😅", "<i>vuelves</i> = tu reviens. Pour toi : <i>vuelvo</i>.", "personne"],
          ["No, de nada. Bajo la basura y vuelvo.", "¿De nada? 😅", "Pour refuser poliment : <i>no, gracias</i>. <i>De nada</i> répond à un merci.", "formule"],
        ],
        rires: [
          ["Mi piso es grande.", "¡Qué suerte! El mío es pequeño. 😄", "Elle te propose de monter avec elle."],
          ["Hoy hace sol.", "Sí, ¡qué bien! 😄 ¿Subes o no?", "Elle te propose de monter avec elle."],
        ],
        suite: "¡Vale! ¡Hasta luego, vecino!" },
    ],
  },
  {
    id: "u07-pilar-tienda", lecon: "U7-L6", perso: PILAR, lieu: "à l'épicerie du quartier, le samedi matin",
    echanges: [
      { lui: "¡Buenos días! ¿Qué necesita?",
        ok: "Buenos días. ¿Tiene pan del pueblo?",
        pieges: [
          ["Buenos días. ¿Tienes pan del pueblo?", "¡Uy, qué confianza! 😄 Sí, sí, tengo.", "À la vendeuse, on dit <i>usted</i> : <i>¿tiene…?</i>", "personne"],
          ["Buenos días. ¿Tiene de pan del pueblo?", "¿De pan? 😅 ¿Pan?", "Pas de « du » en espagnol : <i>¿tiene pan?</i>", "article"],
        ],
        rires: [
          ["Mi jefe tiene que vender la empresa.", "¿Y me la vende a mí? 😂 ¿Qué necesita?", "Tu es à l'épicerie : demande ce que tu veux acheter."],
          ["Odio levantarme temprano.", "¡Y yo abro a las ocho! 😂", "Elle demande ce que tu veux."],
        ],
        suite: "Sí, aquí tiene. Es de esta mañana." },
      { lui: "¿Algo más?",
        ok: "Sí, ¿me pone una bolsa, por favor?",
        pieges: [
          ["Sí, ¿me pone un bolsa, por favor?", "¿Un bolsa? 😅 Una bolsa.", "<i>bolsa</i> est féminin : <i>una bolsa</i>.", "genre"],
          ["Sí, ¿me pones una bolsa, por favor?", "¡Uy, qué confianza! 😄 Sí, claro.", "À la vendeuse, on dit <i>usted</i> : <i>¿me pone…?</i>", "personne"],
        ],
        rires: [
          ["Este sábado quedo con amigos.", "¡Qué bien! 😄 ¿Y algo más?", "Elle demande si tu veux autre chose."],
          ["El ascensor no funciona.", "¡Pues suba a pie! 😂 ¿Algo más?", "Elle demande si tu veux autre chose."],
        ],
        suite: "Una bolsa, aquí tiene." },
      { lui: "Son cuatro euros con veinte.",
        ok: "Vale. ¿Puedo pagar con tarjeta?",
        pieges: [
          ["Vale. ¿Puedo pagar en tarjeta?", "¿En tarjeta? 😅 Con tarjeta.", "Payer par carte : <i>con tarjeta</i>.", "preposition"],
          ["Vale, catorce euros con veinte. ¿Puedo pagar con tarjeta?", "¿Catorce? ¡No, cuatro! 😂", "<i>cuatro</i> = 4 ; <i>catorce</i> = 14.", "nombre"],
        ],
        rires: [
          ["Me gusta mucho cocinar.", "¡Con mi pan del pueblo, seguro! 😄 Son cuatro veinte.", "Elle te dit le prix."],
          ["La farmacia está cerca de aquí.", "Sí, al lado. 😄 Pero… cuatro veinte.", "Elle te dit le prix."],
        ],
        suite: "Claro, aquí tiene." },
      { lui: "¿Quiere bolsa?",
        ok: "No, gracias. Tengo una.",
        pieges: [
          ["No, gracias. Tengo uno.", "¿Uno? ¿Un qué? 😅", "<i>bolsa</i> est féminin : <i>tengo una</i>.", "genre"],
          ["No, gracias. No tengo ninguna.", "¿Entonces? ¿Lo llevas en la mano? 😂", "<i>no tengo ninguna</i> = je n'en ai aucun. Tu en as un : <i>tengo una</i>."],
        ],
        rires: [
          ["Hoy voy al supermercado con Blanca.", "¿Al supermercado? ¡Aquí es mejor! 😤😂", "Elle demande si tu veux un sac."],
          ["Bajo la basura y vuelvo.", "¿Ahora? 😂 ¿Quiere bolsa o no?", "Elle demande si tu veux un sac."],
        ],
        suite: "Muy bien. ¡Que tenga un buen día!" },
    ],
  },
  {
    id: "u08-nuria-abrigo", lecon: "U8-L3", perso: NURIA, lieu: "devant l'école, le matin, avec Léo",
    echanges: [
      { lui: "¡Buenos días, Kevin! ¡Qué frío! ¿Léo no lleva abrigo?",
        ok: "¡Léo, ponte el abrigo!",
        pieges: [
          ["¡Léo, pon el abrigo!", "¿Lo pone dónde? ¿En la mochila? 😂", "Un vêtement sur soi, c'est <i>ponerse</i> : <i>¡ponte el abrigo!</i>, avec <i>te</i>."],
          ["¡Léo, te pones el abrigo!", "¿Es una pregunta o una orden? 😄", "Pour donner un ordre : l'impératif, <i>¡ponte el abrigo!</i>", "temps"],
        ],
        rires: [
          ["¡Léo, lávate los dientes!", "¿Aquí, en la calle? 😂", "Léo n'a pas mis son manteau."],
          ["El abrigo es caro.", "¡Pero hace frío! 😂", "Léo n'a pas mis son manteau."],
        ],
        suite: "¡Así, muy bien, Léo!" },
      { lui: "¿Y la mochila? ¿Dónde está?",
        ok: "Está en casa.",
        pieges: [
          ["Es en casa.", "¿Es en casa? 😅 Está.", "Un lieu, c'est <i>estar</i> : <i>está en casa</i>.", "ser-estar"],
          ["Hay en casa.", "¿Hay? 😅 Está en casa.", "Une chose qu'on connaît (la mochila) : <i>está</i>. <i>Hay</i> = il y a."],
        ],
        rires: [
          ["¡Ponte los zapatos!", "¿Yo? ¡Ya los llevo! 😂", "Elle demande où est le cartable."],
          ["Me encanta la verdura.", "¡Qué sano! 😄 Pero ¿la mochila?", "Elle demande où est le cartable."],
        ],
        suite: "¡Ay! ¿Vas a casa a por ella? Yo me quedo con Léo." },
      { lui: "Corre, corre, ¡que llegáis tarde!",
        ok: "¡Gracias! Léo, espera aquí con ella.",
        pieges: [
          ["¡Gracias! Léo, esperas aquí con ella.", "¿Es una pregunta? 😄", "Pour un ordre : <i>¡espera!</i> (la forme « il » du présent).", "temps"],
          ["¡De nada! Léo, espera aquí con ella.", "¿De nada? ¡Si te ayudo yo! 😅", "Elle t'aide : <i>gracias</i>. <i>De nada</i> répond à un merci.", "formule"],
        ],
        rires: [
          ["Me gusta mucho cocinar.", "¿Ahora? 😂 ¡Corre!", "Elle garde Léo : remercie-la et dis à Léo d'attendre."],
          ["Hoy hace sol.", "¿Sol? ¡Hace un frío! 😂", "Elle garde Léo : remercie-la et dis à Léo d'attendre."],
        ],
        suite: "¡Vale, vale! ¡Vamos!" },
      { lui: "¡Ya estás aquí! Venga, que van a cerrar la puerta.",
        ok: "¡Vamos, Léo! ¡Date prisa!",
        pieges: [
          ["¡Vamos, Léo! ¡Te das prisa!", "¿Te das prisa? ¿O no? 😄", "Pour un ordre : <i>¡date prisa!</i>", "temps"],
          ["¡Vamos, Léo! ¡Para!", "¿Para? ¡Pero si llegáis tarde! 😂", "<i>¡para!</i> = arrête ! Pour « dépêche-toi » : <i>¡date prisa!</i>"],
        ],
        rires: [
          ["¡Léo, lávate las manos!", "¿Ahora? 😂 ¡Corre!", "Vous êtes en retard : dis à Léo de se dépêcher."],
          ["Estoy cansado.", "¡Y yo! 😂 ¡Venga!", "Vous êtes en retard : dis à Léo de se dépêcher."],
        ],
        suite: "¡Adiós, Léo! ¡Hasta luego, Kevin!" },
    ],
  },
  {
    id: "u08-javier-futbol", lecon: "U8-L5", perso: "javier", lieu: "Javier, au parc, en courant",
    echanges: [
      { lui: "¡Kevin! ¿Qué haces aquí en el parque?",
        ok: "Juego al fútbol con Dorian.",
        pieges: [
          ["Juego el fútbol con Dorian.", "¿El fútbol? 😅 Al fútbol.", "Jouer à un jeu : <i>jugar a</i> → <i>juego al fútbol</i>.", "preposition"],
          ["Juega al fútbol con Dorian.", "¿Quién? ¿Dorian solo? 😅", "<i>juega</i> = il joue. Pour toi : <i>juego</i>.", "personne"],
        ],
        rires: [
          ["Ponte el pijama.", "¿Aquí? ¿En el parque? 😂", "Il demande ce que tu fais au parc."],
          ["Me gusta leer.", "¿Leer? ¡Si estás jugando al fútbol! 😂", "Il demande ce que tu fais au parc."],
        ],
        suite: "¡Qué bien! ¡El fútbol es lo mejor!" },
      { lui: "¿Y quién gana?",
        ok: "Dorian gana. Juega muy bien.",
        pieges: [
          ["Dorian gano. Juega muy bien.", "¿Ganas tú o Dorian? 😅", "<i>gano</i> = je gagne. Pour Dorian : <i>gana</i>.", "personne"],
          ["Dorian gana. Juega muy bueno.", "¿Muy bueno? 😅 Muy bien.", "Pour dire comment on joue : <i>bien</i>. <i>Bueno</i> va avec une chose (<i>un libro bueno</i>)."],
        ],
        rires: [
          ["Dorian no come verdura.", "¡Pues tiene que comer! 💪😂", "Il demande qui gagne."],
          ["Los zapatos son negros.", "Vale… ¿y quién gana? 😂", "Il demande qui gagne."],
        ],
        suite: "¡Bravo, Dorian! 💪" },
      { lui: "¿Y tú? ¿Pierdes siempre?",
        ok: "Sí, siempre pierdo. ¡No es mi culpa!",
        pieges: [
          ["Sí, siempre pierdes. ¡No es mi culpa!", "¿Yo? ¡Yo no juego! 😂", "<i>pierdes</i> = tu perds. Pour toi : <i>pierdo</i>.", "personne"],
          ["Sí, siempre pierdo. ¡No está mi culpa!", "¿Está? 😅 No ES mi culpa.", "La faute, c'est <i>ser</i> : <i>no es mi culpa</i>.", "ser-estar"],
        ],
        rires: [
          ["¡Ponte el abrigo!", "¿Yo? ¡Yo corro en camiseta! 💪😂", "Il demande si tu perds tout le temps."],
          ["Me encantan las series.", "¡Por eso pierdes! 😂", "Il demande si tu perds tout le temps."],
        ],
        suite: "¡Jaja! ¡Te falta entrenar!" },
      { lui: "¿Jugáis con nosotros el domingo? Somos diez.",
        ok: "¡Vale! ¿A qué hora jugáis?",
        pieges: [
          ["¡Vale! ¿En qué hora jugáis?", "¿En qué hora? 😅 ¿A qué hora?", "Pour l'heure : <i>¿a qué hora?</i>", "heure"],
          ["¡Vale! ¿A qué hora juegan?", "¿Juegan? ¿Quiénes? 😅", "<i>juegan</i> = ils jouent. À Javier et ses amis : <i>jugáis</i>.", "personne"],
        ],
        rires: [
          ["Hoy gano yo, Dorian.", "¡Primero tienes que entrenar! 😂", "Il vous invite à jouer dimanche."],
          ["¡Lávate las manos!", "¿Yo? ¡Después del partido! 😂", "Il vous invite à jouer dimanche."],
        ],
        suite: "¡A las diez! ¡Y trae a Dorian, que juega mejor que tú! 😂" },
    ],
  },
  {
    id: "u09-carmen-navidad", lecon: "U9-L1", perso: CARMEN, lieu: "chez Carmen, une amie de Blanca, pour le repas des fêtes",
    echanges: [
      { lui: "¡Hola! Tú eres Kevin, ¿verdad? Yo soy Carmen. ¡Felices fiestas!",
        ok: "¡Felices fiestas! Encantado de conocerte.",
        pieges: [
          ["¡Felices fiestas! Encantada de conocerte.", "¿Encantada? 😄", "Pour un homme : <i>encantado</i>. <i>Encantada</i>, c'est ce que dit une femme.", "genre"],
          ["¡Felices fiestas! Encantado de conocer.", "¿De conocer… a quién? 😅", "Ravi de te connaître : <i>encantado de conocerte</i>, avec <i>te</i>.", "personne"],
        ],
        rires: [
          ["Tengo un regalo para Léo.", "¡Qué bien! 😄 Pero… encantada, ¿eh?", "Elle se présente : réponds-lui."],
          ["El turrón está muy rico.", "¡Si todavía no lo has probado! 😂", "Elle se présente : réponds-lui."],
        ],
        suite: "¡Pasad, pasad! Estáis en vuestra casa." },
      { lui: "Siéntate, siéntate. La cena ya casi está.",
        ok: "¿Te ayudo a poner la mesa?",
        pieges: [
          ["¿Me ayudo a poner la mesa?", "¿Te ayudas a ti mismo? 😂", "<i>¿te ayudo?</i> = je t'aide ? <i>Me</i>, c'est toi-même.", "personne"],
          ["¿Te ayudo a pongo la mesa?", "¿A pongo? 😅", "Après <i>a</i>, l'infinitif : <i>a poner la mesa</i>.", "temps"],
        ],
        rires: [
          ["Me encanta el turrón.", "¡Para el postre! 😄", "Elle te dit de t'asseoir : propose ton aide."],
          ["Hoy he trabajado en casa todo el día.", "¡Pues ahora a descansar! 😄", "Elle te dit de t'asseoir : propose ton aide."],
        ],
        suite: "¡Qué amable! Sí, los platos están ahí." },
      { lui: "¿Qué tal el cordero? ¿Te gusta?",
        ok: "¡Está todo muy rico!",
        pieges: [
          ["¡Es todo muy rico!", "¿Siempre? ¡Gracias! 😄", "Ce repas-là, maintenant : <i>está rico</i>. <i>Es rico</i>, c'est en général.", "ser-estar"],
          ["¡Está todo muy rica!", "¿Rica? ¿Quién? 😄", "<i>todo</i> est masculin : <i>todo muy rico</i>.", "genre"],
        ],
        rires: [
          ["El seis de enero los Reyes traen regalos a los niños.", "¡Sí! 😄 Pero ¿y el cordero?", "Elle demande si tu aimes l'agneau."],
          ["Brindamos con cava.", "¡Ahora no, después! 😂", "Elle demande si tu aimes l'agneau."],
        ],
        suite: "¡Qué bien! Es la receta de mi abuela." },
      { lui: "¡Venga, un brindis! ¡Por la boda de Blanca y Kevin!",
        ok: "¡Salud! ¡Y felices fiestas a todos!",
        pieges: [
          ["¡Que aproveche! ¡Y felices fiestas a todos!", "¿Que aproveche? ¡Es un brindis! 😂", "Pour trinquer : <i>¡salud!</i>. <i>¡Que aproveche!</i>, c'est « bon appétit ».", "formule"],
          ["¡Salud! ¡Y felices fiestas a todo!", "¿A todo? ¿A la mesa también? 😂", "À tout le monde : <i>a todos</i>, au pluriel."],
        ],
        rires: [
          ["La cena de Nochebuena es muy larga.", "¡Y todavía no ha terminado! 😂", "On trinque : <i>¡salud!</i>"],
          ["Odio levantarme temprano.", "¡Mañana no hay que levantarse! 😂", "On trinque : <i>¡salud!</i>"],
        ],
        suite: "¡Salud! 🥂" },
    ],
  },
  {
    id: "u09-javier-hoy", lecon: "U9-L3", perso: "javier", lieu: "Javier, à la salle de sport, le soir",
    echanges: [
      { lui: "¡Kevin! ¿Qué has hecho hoy? ¿Has entrenado?",
        ok: "No, hoy he trabajado todo el día.",
        pieges: [
          ["No, hoy he trabajando todo el día.", "¿He trabajando? 😅 Has trabajado, ¿no?", "<i>trabajando</i> = en train de travailler. Le passé composé : <i>he trabajado</i>.", "temps"],
          ["No, hoy ha trabajado todo el día.", "¿Quién? ¿Yo? ¡Yo he entrenado! 💪😅", "<i>ha trabajado</i>, c'est « il a travaillé ». Pour toi : <i>he trabajado</i>.", "personne"],
        ],
        rires: [
          ["Me encantan las series.", "¡Y a mí las pesas! 😂 Pero ¿qué has hecho hoy?", "Il demande ce que tu as fait aujourd'hui."],
          ["Las llaves están encima de la mesa.", "¿Y qué hacen ahí? 😂", "Il demande ce que tu as fait aujourd'hui."],
        ],
        suite: "¿Todo el día sentado? ¡Qué horror! 😱" },
      { lui: "¿Y qué has hecho? ¿Muchas reuniones?",
        ok: "He tenido tres reuniones y he escrito un montón de correos.",
        pieges: [
          ["He tenido tres reuniones y he escrito un montón correos.", "¿Un montón… DE correos? 😅", "Plein de : <i>un montón de</i>, avec <i>de</i>.", "preposition"],
          ["Tengo tres reuniones y escribo un montón de correos.", "¿Ahora? ¿Y qué haces aquí? 😂", "C'est fait, c'est aujourd'hui : le passé composé, <i>he tenido</i>, <i>he escrito</i>.", "temps"],
        ],
        rires: [
          ["Yo pongo la mesa y Dorian trae los vasos.", "¡Muy bien, Dorian! 😄 Pero ¿y tu trabajo?", "Il demande ce que tu as fait au travail."],
          ["Me gusta el pescado.", "¡Proteínas! 💪 Pero te pregunto por el trabajo. 😄", "Il demande ce que tu as fait au travail."],
        ],
        suite: "¡Uf! Yo no puedo estar sentado tanto tiempo." },
      { lui: "¿Y esta tarde? ¿Has salido?",
        ok: "No, he puesto la lavadora y he visto las noticias.",
        pieges: [
          ["No, me he puesto la lavadora y he visto las noticias.", "¿Te has puesto la lavadora? ¿Como un abrigo? 😂", "<i>ponerse</i>, c'est mettre un vêtement. Une machine : <i>he puesto la lavadora</i>, sans <i>me</i>."],
          ["No, he puesto la lavadora y he visto los noticias.", "¿Los noticias? 😅", "<i>noticias</i> est féminin : <i>las noticias</i>.", "article"],
        ],
        rires: [
          ["Dorian ha dicho que no tiene deberes.", "¡Qué listo, Dorian! 😂 ¿Y tú?", "Il demande ce que tu as fait cet après-midi."],
          ["Me gusta leer.", "¿Leer? ¡Eso no es deporte! 😂", "Il demande si tu es sorti cet après-midi."],
        ],
        suite: "¡Qué tarde tan emocionante! 😂" },
      { lui: "¿Y esta semana? ¿Has hecho deporte?",
        ok: "No, esta semana no he hecho nada.",
        pieges: [
          ["No, esta semana he no hecho nada.", "¿He no hecho? 😅 No he hecho.", "Le <i>no</i> se met avant <i>he</i> : <i>no he hecho nada</i>.", "ordre"],
          ["No, esta semana no hecho nada.", "¿No hecho? 😅 No HE hecho.", "Le passé composé a besoin de <i>he</i> : <i>no he hecho nada</i>.", "temps"],
        ],
        rires: [
          ["Prefiero la carne.", "¡Proteínas! 💪😂 Pero ¿y el deporte?", "Il demande si tu as fait du sport cette semaine."],
          ["La tele está en el salón.", "¡Ya me lo imagino! 😂 Tú en el sofá…", "Il demande si tu as fait du sport cette semaine."],
        ],
        suite: "¿Nada? ¡Mañana a las siete, aquí conmigo! 💪" },
    ],
  },
  {
    id: "u09-blanca-compra", lecon: "U9-L5", perso: "blanca", lieu: "par messages, en fin d'après-midi",
    echanges: [
      { lui: "¡Hola, cariño! ¿Ya has hecho la compra?",
        ok: "Sí, ya he hecho la compra.",
        pieges: [
          ["Sí, he ya hecho la compra.", "¿He ya hecho? 😅", "<i>ya</i> se met avant : <i>ya he hecho</i>.", "ordre"],
          ["Sí, ya hecho la compra.", "¿Ya hecho? 😅 Ya HE hecho.", "Le passé composé a besoin de <i>he</i> : <i>ya he hecho</i>.", "temps"],
        ],
        rires: [
          ["Me encantan las series.", "Ya lo sé, cariño. 😄 ¿Y la compra?", "Elle demande si tu as déjà fait les courses."],
          ["Los zapatos son negros.", "¿Qué zapatos? 😂", "Elle demande si tu as déjà fait les courses."],
        ],
        suite: "¡Genial! Gracias." },
      { lui: "¿Y la cena? ¿Ya has cocinado?",
        ok: "No, todavía no. Acabo de volver.",
        pieges: [
          ["No, ya no. Acabo de volver.", "¿Ya no? ¿Ya no cocinas nunca? 😱", "<i>ya no</i> = ne… plus. Pas encore : <i>todavía no</i>."],
          ["No, todavía no. Acabo volver.", "¿Acabo volver? 😅", "Venir de : <i>acabo de volver</i>, avec <i>de</i>.", "preposition"],
        ],
        rires: [
          ["He puesto la lavadora.", "¡Gracias! 😄 Pero ¿y la cena?", "Elle demande si tu as déjà cuisiné."],
          ["Dorian ha cerrado la puerta.", "Vale… ¿y la cena? 😄", "Elle demande si tu as déjà cuisiné."],
        ],
        suite: "¡Vale, no hay prisa!" },
      { lui: "¿Y los niños? ¿Todo bien?",
        ok: "Sí, pero Léo ha roto un vaso.",
        pieges: [
          ["Sí, pero Léo he roto un vaso.", "¿Tú o Léo? 😅", "<i>he roto</i> = j'ai cassé. Pour Léo : <i>ha roto</i>.", "personne"],
          ["Sí, pero Léo ha roto una vaso.", "¿Una vaso? 😅", "<i>vaso</i> est masculin : <i>un vaso</i>.", "article"],
        ],
        rires: [
          ["¡Lávate los dientes!", "¿Yo? ¡Si estoy en el trabajo! 😂", "Elle demande si tout va bien avec les enfants."],
          ["Me gusta el pescado.", "Ya lo sé. 😄 ¿Y los niños?", "Elle demande si tout va bien avec les enfants."],
        ],
        suite: "¡Ay, Léo! ¿Y él está bien?" },
      { lui: "¡Por fin he terminado el trabajo! Llego en media hora.",
        ok: "¡Por fin! ¿Has trabajado mucho?",
        pieges: [
          ["¡Por fin! ¿Has trabajando mucho?", "¿Trabajando? 😅", "<i>trabajando</i> = en train de travailler. Au passé composé : <i>has trabajado</i>.", "temps"],
          ["¡Por fin! ¿He trabajado mucho?", "¿Tú? ¡No sé! 😂", "<i>he trabajado</i> = j'ai travaillé. Pour elle : <i>¿has trabajado?</i>", "personne"],
        ],
        rires: [
          ["Odio levantarme temprano.", "¡Ya lo sé, dormilón! 😂", "Elle t'annonce qu'elle rentre."],
          ["Esta semana he cocinado un montón.", "¡Es verdad! 😄 Gracias, cariño.", "Elle t'annonce qu'elle rentre."],
        ],
        suite: "¡Un montón! Ahora te cuento. 😘" },
    ],
  },
  {
    id: "u10-nuria-recoger", lecon: "U10-L2", perso: NURIA, lieu: "à la sortie de l'école, à cinq heures",
    echanges: [
      { lui: "¡Hola, Kevin! ¿Hoy recoges tú a Léo?",
        ok: "Sí, hoy recojo yo a Léo.",
        pieges: [
          ["Sí, hoy recojo yo Léo.", "¿Recojo Léo? 😅 ¡A Léo!", "Devant une personne, on met <i>a</i> : <i>recojo a Léo</i>.", "preposition"],
          ["Sí, hoy recoges yo a Léo.", "¿Recoges? ¿Yo? 😅", "<i>recoges</i> = tu vas chercher. Pour toi : <i>recojo</i>.", "personne"],
        ],
        rires: [
          ["Estoy en la entrada del cole.", "¡Ya te veo! 😄 Pero ¿recoges a Léo?", "Elle demande si c'est toi qui viens chercher Léo."],
          ["Me encanta el turrón.", "¿El turrón? ¡Estamos en el cole! 😂", "Elle demande si c'est toi qui viens chercher Léo."],
        ],
        suite: "¡Qué bien!" },
      { lui: "¿Y Dorian? ¿Quién lo recoge?",
        ok: "Lo recoge Blanca a las seis.",
        pieges: [
          ["La recoge Blanca a las seis.", "¿La? ¿Dorian es una niña? 😅", "Dorian est un garçon : <i>lo recoge</i>.", "genre"],
          ["Recoge lo Blanca a las seis.", "¿Recoge lo? 😅", "<i>lo</i> se met avant le verbe : <i>lo recoge</i>.", "ordre"],
        ],
        rires: [
          ["El patio es grande.", "Sí… ¿y Dorian? 😄", "Elle demande qui va chercher Dorian."],
          ["¡Lávate las manos!", "¿Yo? 😂", "Elle demande qui va chercher Dorian."],
        ],
        suite: "Vale, más tarde." },
      { lui: "¡Mira, ya salen! Uy, ¿y la mochila de Léo? No la veo.",
        ok: "La tengo yo, gracias.",
        pieges: [
          ["Lo tengo yo, gracias.", "¿Lo? La mochila… 😅", "<i>mochila</i> est féminin : <i>la tengo</i>.", "genre"],
          ["Tengo la yo, gracias.", "¿Tengo la? 😅", "<i>la</i> se met avant le verbe : <i>la tengo yo</i>.", "ordre"],
        ],
        rires: [
          ["Veo a la tutora de Léo en el patio.", "¡Ah, sí, ahí está! 😄 ¿Y la mochila?", "Elle ne voit pas le cartable de Léo."],
          ["Me gusta el pescado.", "¿Y eso? 😂", "Elle ne voit pas le cartable de Léo."],
        ],
        suite: "¡Ah, perfecto!" },
      { lui: "Oye, ¿Léo ha llorado hoy? Lucía dice que sí.",
        ok: "No sé. Hoy no he visto a la tutora.",
        pieges: [
          ["No sé. Hoy no he visto la tutora.", "¿La tutora? 😅 A la tutora.", "Devant une personne : <i>a</i> → <i>he visto a la tutora</i>.", "preposition"],
          ["No sé. Hoy he no visto a la tutora.", "¿He no visto? 😅", "Le <i>no</i> se met avant <i>he</i> : <i>no he visto</i>.", "ordre"],
        ],
        rires: [
          ["Léo come mucho pan.", "Vale… ¿pero ha llorado? 😄", "Elle demande si Léo a pleuré."],
          ["El ascensor no funciona.", "¿Qué ascensor? ¡Estamos en el cole! 😂", "Elle demande si Léo a pleuré."],
        ],
        suite: "Bueno, ¡seguro que no es nada! ¡Hasta mañana!" },
    ],
  },
  {
    id: "u10-andres-excursion", lecon: "U10-L5", perso: ANDRES, lieu: "à la porte de la classe de Dorian",
    echanges: [
      { lui: "¡Hola! Vienes a recoger a Dorian, ¿no? ¿Eres…?",
        ok: "Sí, soy Kevin, el novio de Blanca.",
        pieges: [
          ["Sí, estoy Kevin, el novio de Blanca.", "¿Estás Kevin? 😅 Eres Kevin.", "Pour dire qui on est : <i>ser</i> → <i>soy Kevin</i>.", "ser-estar"],
          ["Sí, soy Kevin, la novio de Blanca.", "¿La novio? 😅", "Pour un homme : <i>el novio</i>.", "article"],
        ],
        rires: [
          ["Me encanta el turrón.", "¿El turrón? 😂 ¿Y tú eres…?", "Il demande qui tu es."],
          ["Recojo a Léo a las cinco.", "Vale… ¡pero yo soy el tutor de Dorian! 😄", "Il demande qui tu es."],
        ],
        suite: "¡Encantado! Yo soy Andrés, el tutor de Dorian." },
      { lui: "Mira, el jueves que viene hay una excursión a la montaña.",
        ok: "¿A qué hora es la excursión?",
        pieges: [
          ["¿A qué hora está la excursión?", "¿Está? 😅 Es.", "L'heure d'un événement, c'est <i>ser</i> : <i>¿a qué hora es?</i>", "ser-estar"],
          ["¿Cuándo hora es la excursión?", "¿Cuándo hora? 😅", "Pour l'heure : <i>¿a qué hora?</i>", "question"],
        ],
        rires: [
          ["Dorian ha olvidado la mochila.", "¿Otra vez? 😂", "Il t'annonce une sortie scolaire."],
          ["Hoy hace mucho viento.", "¡Esperemos que el jueves no! 😄", "Il t'annonce une sortie scolaire."],
        ],
        suite: "Salimos del cole a las nueve y volvemos a las cinco." },
      { lui: "Tienen que traer un bocadillo y agua.",
        ok: "Vale, un bocadillo y agua. ¿Algo más?",
        pieges: [
          ["Vale, un bocadillo y de agua. ¿Algo más?", "¿De agua? 😅 Agua.", "Pas de « de l'eau » en espagnol : <i>agua</i>.", "article"],
          ["Vale, una bocadillo y agua. ¿Algo más?", "¿Una bocadillo? 😅", "<i>bocadillo</i> est masculin : <i>un bocadillo</i>.", "genre"],
        ],
        rires: [
          ["Necesito algo para Léo.", "¿Para Léo? 😅 Pero… ¿la excursión?", "Il dit ce qu'il faut apporter."],
          ["Las galletas están en la mesa.", "¿Qué mesa? 😂", "Il dit ce qu'il faut apporter."],
        ],
        suite: "Y una gorra, por el sol." },
      { lui: "Y la autorización: la tiene Dorian en la agenda. Hay que firmarla.",
        ok: "Vale, la firmo esta tarde.",
        pieges: [
          ["Vale, lo firmo esta tarde.", "¿Lo? La autorización… 😅", "<i>autorización</i> est féminin : <i>la firmo</i>.", "genre"],
          ["Vale, firmo la esta tarde.", "¿Firmo la? 😅", "<i>la</i> se met avant le verbe : <i>la firmo</i>.", "ordre"],
        ],
        rires: [
          ["La función de Navidad es el mes que viene.", "Sí, sí… ¿y la autorización? 😄", "Il te demande de signer l'autorisation."],
          ["Me gusta mucho cocinar.", "¡Qué bien! 😄 ¿Y la autorización?", "Il te demande de signer l'autorisation."],
        ],
        suite: "¡Perfecto! ¡Hasta el jueves!" },
    ],
  },
  {
    id: "u10-elena-leo", lecon: "U10-L6", perso: ELENA, lieu: "à la sortie de l'école, la maîtresse de Léo",
    echanges: [
      { lui: "¡Hola, Kevin! ¿Tienes un minuto? Quería hablar de Léo.",
        ok: "Sí, claro. ¿Cómo lo ves en clase?",
        pieges: [
          ["Sí, claro. ¿Cómo la ves en clase?", "¿La? Léo es un niño. 😅", "Léo : <i>lo</i>. <i>La</i>, c'est pour une fille.", "genre"],
          ["Sí, claro. ¿Cómo ves lo en clase?", "¿Ves lo? 😅", "<i>lo</i> se met avant le verbe : <i>¿cómo lo ves?</i>", "ordre"],
        ],
        rires: [
          ["Me encanta el turrón.", "¿El turrón? 😂 Hablamos de Léo.", "Elle veut te parler de Léo."],
          ["Ya he firmado la autorización.", "¡Gracias! 😄 Pero hablamos de Léo.", "Elle veut te parler de Léo."],
        ],
        suite: "Bien, bien. Es un niño muy simpático." },
      { lui: "Pero le cuesta un poco hablar en clase.",
        ok: "Sí, le cuesta. En casa habla francés.",
        pieges: [
          ["Sí, me cuesta. En casa habla francés.", "¿A ti? ¡Hablo de Léo! 😄", "<i>me cuesta</i> = j'ai du mal. Pour Léo : <i>le cuesta</i>.", "personne"],
          ["Sí, le cuestan. En casa habla francés.", "¿Cuestan? 😅", "<i>costar</i> marche comme <i>gustar</i> : <i>le cuesta</i> (hablar, un seul verbe).", "gustar"],
        ],
        rires: [
          ["Léo tiene cuatro años.", "¡Ya lo sé! 😄", "Elle dit que Léo a du mal à parler en classe."],
          ["El patio es grande.", "Sí… ¿y Léo? 😄", "Elle dit que Léo a du mal à parler en classe."],
        ],
        suite: "Claro, es normal. Y aprende muy rápido." },
      { lui: "Pero tranquilo: ha mejorado mucho este año.",
        ok: "¡Qué bien! ¿Ha comido bien hoy?",
        pieges: [
          ["¡Qué bien! ¿Ha comiendo bien hoy?", "¿Comiendo? 😅", "Au passé composé : <i>ha comido</i>.", "temps"],
          ["¡Qué pena! ¿Ha comido bien hoy?", "¿Qué pena? ¡Es una buena noticia! 😅", "Pour une bonne nouvelle : <i>¡qué bien!</i>", "formule"],
        ],
        rires: [
          ["Me gusta leer.", "¡Como a Léo! 😄", "Elle te dit que Léo a fait des progrès."],
          ["La cuenta, por favor.", "¿La cuenta? ¡Esto es un cole, no un bar! 😂", "Elle te dit que Léo a fait des progrès."],
        ],
        suite: "Sí, en el comedor se lo ha comido todo." },
      { lui: "Bueno, ¡hasta mañana! Y no te preocupes.",
        ok: "¡Gracias! ¡Hasta mañana!",
        pieges: [
          ["¡De nada! ¡Hasta mañana!", "¿De nada? 😅", "Elle te rassure : <i>gracias</i>. <i>De nada</i> répond à un merci.", "formule"],
          ["¡Gracias! ¡Buenas noches!", "¿Buenas noches? ¡Son las cinco! 😂", "Pour se quitter jusqu'au lendemain : <i>¡hasta mañana!</i>", "formule"],
        ],
        rires: [
          ["Léo ha roto un vaso.", "¡Uy! 😂 Pero en clase, ¡muy bien!", "Elle te dit au revoir."],
          ["Me encanta Huesca.", "¡Y a mí! 😄 ¡Hasta mañana!", "Elle te dit au revoir."],
        ],
        suite: "¡Adiós, Léo! ¡Hasta mañana!" },
    ],
  },
];
