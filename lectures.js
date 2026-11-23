// Les lectures : des textes par niveau, pour la compréhension écrite (APPLI.md, « La suite », point 7).
// Un niveau = 2 unités du livre. Dans un niveau, chaque texte dit l'unité dont il a besoin (unite),
// et les textes sont rangés de la plus petite unité à la plus grande : le premier se lit dès le début du niveau.
//
// Chaque mot du texte se touche pour voir sa traduction. Elle est écrite ici, jamais devinée :
// d'abord dans « mots » (propre au texte, plusieurs mots possibles : « desde hace »), sinon dans GLOSE (les petits mots).
// Le plus long morceau gagne : « en el trabajo » avant « en ». Les prénoms (NOMS) ne se touchent pas.
// « nouveaux » : les mots pas encore vus dans le livre (2 au plus), avec leurs formes ; ils sont soulignés en pointillés.
// Une question : { es, fr, choix: [3 réponses], bonne: le numéro de la bonne (0, 1 ou 2) }.
// outils/test-lectures.mjs vérifie chaque mot avec le Sheet, chaque traduction, et les questions.

export const SORTES = {
  histoire: "Petite histoire",
  dialogue: "Dialogue",
  message: "Message",
  breve: "Brève",
  blog: "Billet de blog",
  annonce: "Annonce",
  menu: "Menu",
  article: "Vieil article",
};

// Les prénoms et les villes : pas de traduction.
export const NOMS = new Set(["kevin", "blanca", "léo", "dorian", "huesca", "parís", "galicia"]);

// Les petits mots qu'on retrouve partout. Un texte peut toujours donner une traduction plus juste dans « mots ».
export const GLOSE = {
  el: "le", la: "la", los: "les", las: "les", un: "un", una: "une",
  y: "et", o: "ou", de: "de", del: "du (de + el)", al: "au (a + el)", a: "à", con: "avec", en: "en, à, dans", por: "par",
  no: "non ; ne… pas", "sí": "oui", yo: "moi, je", "tú": "toi, tu", mi: "mon, ma", tu: "ton, ta", tus: "tes", su: "son, sa",
  hola: "salut, bonjour", "por favor": "s'il te plaît", muy: "très", mucho: "beaucoup", "un poco": "un peu", "más": "plus",
  pero: "mais", "también": "aussi", "todavía": "encore", ya: "déjà", porque: "parce que", solo: "seulement",
  es: "est (ser)", son: "sont (ser)", soy: "je suis (ser)", "está": "est (estar)", "estás": "tu es (estar)", estoy: "je suis (estar)",
};

export const NIVEAUX = [
  {
    n: 1, unites: [1, 2],
    textes: [
      {
        id: "n1-kevin-y-blanca", titre: "Kevin y Blanca", sorte: "histoire", unite: 1,
        texte: [
          "Kevin es francés. Vive en Huesca desde hace cinco años, con Blanca, Léo y Dorian. Trabaja desde casa, en el despacho: habla con la empresa en francés y en inglés. Con Blanca, habla español, pero todavía no habla mucho. Blanca es española. ¡Y Kevin y Blanca se casan!",
        ],
        nouveaux: {},
        mots: {
          "francés": "français", vive: "il habite (vivir)", "en huesca": "à Huesca", "desde hace": "depuis",
          "cinco años": "cinq ans (el año)", "trabaja desde casa": "il travaille à la maison (trabajar)",
          "en el despacho": "dans le bureau (la pièce)", habla: "il parle (hablar)", "la empresa": "l'entreprise",
          "en francés": "en français", "en inglés": "en anglais", "español": "espagnol", "todavía no": "pas encore",
          "española": "espagnole", "se casan": "ils se marient (casarse)",
        },
        questions: [
          { es: "Kevin vive en…", fr: "Kevin habite à…", choix: ["Francia.", "Huesca.", "un pueblo."], bonne: 1 },
          { es: "Con la empresa, Kevin habla…", fr: "Avec l'entreprise, Kevin parle…", choix: ["español.", "francés y inglés.", "solo francés."], bonne: 1 },
          { es: "Kevin y Blanca…", fr: "Kevin et Blanca…", choix: ["se casan.", "trabajan en el despacho.", "viven en Francia."], bonne: 0 },
        ],
      },
      {
        id: "n1-un-amigo-de-blanca", titre: "Un amigo de Blanca", sorte: "dialogue", unite: 1,
        texte: [
          "— Hola, soy un amigo de Blanca. ¿Cómo te llamas?",
          "— Hola. Me llamo Kevin. Soy francés.",
          "— ¿Vives en Huesca?",
          "— Sí, vivo en Huesca con Blanca.",
          "— ¿Y trabajas en Huesca?",
          "— Trabajo desde casa, en francés y en inglés.",
          "— ¿Hablas español?",
          "— Un poco. ¿Puedes hablar más despacio, por favor?",
          "— Sí, sí… ¡Perdón!",
        ],
        nouveaux: { "perdón": ["perdón"] },
        mots: {
          "un amigo": "un ami (el amigo)", "cómo te llamas": "comment tu t'appelles ? (llamarse)",
          "me llamo": "je m'appelle (llamarse)", "francés": "français", vives: "tu habites (vivir)", vivo: "j'habite (vivir)",
          "en huesca": "à Huesca", trabajas: "tu travailles (trabajar)",
          "trabajo desde casa": "je travaille à la maison (trabajar)", "en francés": "en français", "en inglés": "en anglais",
          hablas: "tu parles (hablar)", "español": "espagnol", puedes: "tu peux (poder)", hablar: "parler",
          "más despacio": "plus lentement", "perdón": "pardon",
        },
        questions: [
          { es: "Kevin vive…", fr: "Kevin habite…", choix: ["en Francia.", "en Huesca con Blanca.", "con su jefe."], bonne: 1 },
          { es: "Kevin trabaja…", fr: "Kevin travaille…", choix: ["en una empresa de Huesca.", "desde casa.", "con Blanca."], bonne: 1 },
          { es: "Kevin habla español…", fr: "Kevin parle espagnol…", choix: ["mucho.", "un poco.", "nada."], bonne: 1 },
        ],
      },
      {
        id: "n1-un-mensaje-de-blanca", titre: "Hola, Kevin", sorte: "message", unite: 2, de: "Blanca",
        texte: [
          "Hola, Kevin. ¿Estás en casa? Yo estoy en el trabajo y tengo una reunión a las cinco. El catorce de diciembre es el cumpleaños de Léo: ¡cumple cuatro años! ¿Hablamos con tus hermanas por teléfono el domingo? Un beso.",
        ],
        nouveaux: { cumplir: ["cumple"], beso: ["beso"] },
        mots: {
          "en casa": "à la maison", "en el trabajo": "au travail", tengo: "j'ai (tener)", "una reunión": "une réunion",
          "a las cinco": "à cinq heures", "el catorce de diciembre": "le 14 décembre", "el cumpleaños": "l'anniversaire",
          cumple: "il a… ans, pour un anniversaire (cumplir)", "cuatro años": "quatre ans (el año)",
          hablamos: "on parle (hablar)", "tus hermanas": "tes sœurs (la hermana)", "por teléfono": "au téléphone",
          "el domingo": "dimanche (qui vient)", "un beso": "bisous (el beso : le bisou)",
        },
        questions: [
          { es: "Blanca está…", fr: "Blanca est…", choix: ["en casa.", "en el trabajo.", "en Francia."], bonne: 1 },
          { es: "El cumpleaños de Léo es…", fr: "L'anniversaire de Léo, c'est…", choix: ["el cuatro de diciembre.", "el catorce de diciembre.", "el domingo."], bonne: 1 },
          { es: "El domingo, Kevin y Blanca hablan con…", fr: "Dimanche, Kevin et Blanca parlent avec…", choix: ["la hermana de Blanca.", "las hermanas de Kevin.", "el jefe de Blanca."], bonne: 1 },
        ],
      },
      {
        id: "n1-san-lorenzo", titre: "San Lorenzo, en agosto", sorte: "breve", unite: 2, lieu: "Huesca",
        texte: [
          "Las fiestas de San Lorenzo son del nueve al quince de agosto. El diez de agosto es el día de San Lorenzo. Es una semana de fiestas: la gente de Huesca y de los pueblos está en la calle de la mañana a la noche. Y el diez, en Huesca, la gente no trabaja: es fiesta.",
        ],
        nouveaux: { fiesta: ["fiesta", "fiestas"], calle: ["calle"] },
        mots: {
          "las fiestas": "les fêtes (la fiesta)", fiestas: "fêtes (la fiesta)", "san lorenzo": "saint Laurent, le saint de Huesca",
          "del nueve al quince de agosto": "du 9 au 15 août", "el diez de agosto": "le 10 août", "el día": "le jour",
          "una semana": "une semaine", "la gente": "les gens (au singulier en espagnol)", "los pueblos": "les villages (el pueblo)",
          "está": "sont (estar) : la gente est au singulier", "en la calle": "dans la rue (la calle)",
          "de la mañana a la noche": "du matin au soir", "el diez": "le 10", "en huesca": "à Huesca",
          "no trabaja": "ne travaille pas (trabajar)", "es fiesta": "c'est un jour férié",
        },
        questions: [
          { es: "Las fiestas de San Lorenzo son en…", fr: "Les fêtes de San Lorenzo sont en…", choix: ["junio.", "agosto.", "diciembre."], bonne: 1 },
          { es: "El día de San Lorenzo es el…", fr: "Le jour de San Lorenzo, c'est le…", choix: ["nueve de agosto.", "diez de agosto.", "quince de agosto."], bonne: 1 },
          { es: "En las fiestas, la gente está en la calle…", fr: "Pendant les fêtes, les gens sont dans la rue…", choix: ["solo por la mañana.", "de la mañana a la noche.", "solo el domingo."], bonne: 1 },
        ],
      },
    ],
  },
  {
    n: 2, unites: [3, 4],
    textes: [
      {
        id: "n2-un-dia-de-kevin", titre: "Un día de Kevin", sorte: "histoire", unite: 3,
        texte: [
          "Kevin se despierta a las siete y se ducha. Después de desayunar, trabaja desde casa, en el despacho. Normalmente entrena cada día, pero a veces no puede. Vuelve del gimnasio a la una y media.",
          "En casa comen a las dos y cenan a las nueve. A las cinco, Kevin va a buscar a Léo. Por la noche, descansa un poco con Blanca.",
        ],
        nouveaux: {},
        mots: {
          "se despierta": "il se réveille (despertarse)", "a las siete": "à sept heures", "se ducha": "il se douche (ducharse)",
          "después de desayunar": "après le petit-déjeuner (desayunar)", "trabaja desde casa": "il travaille à la maison (trabajar)",
          "en el despacho": "dans le bureau (la pièce)", normalmente: "d'habitude", entrena: "il s'entraîne (entrenar)",
          "cada día": "chaque jour", "a veces": "parfois", puede: "il peut (poder)", vuelve: "il revient, il rentre (volver)",
          "del gimnasio": "de la salle de sport (el gimnasio)", "a la una y media": "à une heure et demie",
          "en casa": "à la maison", comen: "ils déjeunent (comer)", "a las dos": "à deux heures", cenan: "ils dînent (cenar)",
          "a las nueve": "à neuf heures", "a las cinco": "à cinq heures", "va a buscar": "il va chercher (ir a buscar)",
          "por la noche": "le soir", descansa: "il se repose (descansar)",
        },
        questions: [
          { es: "Kevin se despierta…", fr: "Kevin se réveille…", choix: ["a las siete.", "a las nueve.", "a mediodía."], bonne: 0 },
          { es: "Kevin vuelve del gimnasio…", fr: "Kevin rentre de la salle de sport…", choix: ["a la una y media.", "a las cinco.", "por la noche."], bonne: 0 },
          { es: "En casa, cenan…", fr: "À la maison, ils dînent…", choix: ["a las siete.", "a las nueve.", "a las dos."], bonne: 1 },
        ],
      },
      {
        id: "n2-gimnasio-del-barrio", titre: "Gimnasio del barrio", sorte: "annonce", unite: 3,
        texte: [
          "¿Quieres entrenar antes de trabajar? El gimnasio abre a las siete de la mañana.",
          "De lunes a viernes: de siete de la mañana a diez de la noche.",
          "Sábados: de nueve a dos.",
          "Domingos: cerrado.",
          "Precio: treinta euros al mes. En enero, el precio es la mitad: ¡quince euros!",
        ],
        nouveaux: { abrir: ["abre"], cerrado: ["cerrado"] },
        mots: {
          quieres: "tu veux (querer)", entrenar: "t'entraîner", "antes de trabajar": "avant de travailler",
          "el gimnasio": "la salle de sport", abre: "ouvre (abrir)", "a las siete de la mañana": "à sept heures du matin",
          "de lunes a viernes": "du lundi au vendredi", "de siete de la mañana a diez de la noche": "de 7 h du matin à 22 h",
          "sábados": "le samedi (el sábado)", "de nueve a dos": "de 9 h à 14 h", domingos: "le dimanche (el domingo)",
          cerrado: "fermé", precio: "prix", "treinta euros al mes": "trente euros par mois", "en enero": "en janvier",
          "el precio": "le prix", "la mitad": "la moitié", "quince euros": "quinze euros",
        },
        questions: [
          { es: "Los domingos, el gimnasio…", fr: "Le dimanche, la salle de sport…", choix: ["está cerrado.", "abre a las nueve.", "abre a las siete."], bonne: 0 },
          { es: "De lunes a viernes, el gimnasio abre…", fr: "Du lundi au vendredi, la salle ouvre…", choix: ["a las nueve.", "a las siete.", "a las diez."], bonne: 1 },
          { es: "En enero, el precio es…", fr: "En janvier, le prix est de…", choix: ["treinta euros.", "quince euros.", "cinco euros."], bonne: 1 },
        ],
      },
      {
        id: "n2-puedes-ir-a-buscar-a-dorian", titre: "¿Puedes ir a buscar a Dorian?", sorte: "message", unite: 4, de: "Blanca",
        texte: [
          "Hola, cariño. Llego tarde: tengo una reunión a las seis. ¿Puedes ir a buscar a Dorian al cole a las cinco? Tiene que hacer los deberes antes de cenar. Hoy está un poco cansado y triste: ¿hablas con él? ¿Y cocinas tú? ¡Gracias, cariño!",
        ],
        nouveaux: {},
        mots: {
          "cariño": "chéri (mot doux)", llego: "j'arrive (llegar)", tarde: "en retard", tengo: "j'ai (tener)",
          "una reunión": "une réunion", "a las seis": "à six heures", puedes: "tu peux (poder)",
          "ir a buscar": "aller chercher", "al cole": "à l'école (el cole)", "a las cinco": "à cinq heures",
          "tiene que hacer": "il doit faire (tener que)", "los deberes": "les devoirs", "antes de cenar": "avant de dîner",
          hoy: "aujourd'hui", "un poco": "un peu", cansado: "fatigué", triste: "triste", hablas: "tu parles (hablar)",
          "con él": "avec lui", cocinas: "tu cuisines (cocinar)", gracias: "merci",
        },
        questions: [
          { es: "Blanca llega tarde porque…", fr: "Blanca arrive en retard parce que…", choix: ["tiene una reunión.", "está cansada.", "va al gimnasio."], bonne: 0 },
          { es: "Antes de cenar, Dorian tiene que…", fr: "Avant le dîner, Dorian doit…", choix: ["dormir la siesta.", "hacer los deberes.", "ir al gimnasio."], bonne: 1 },
          { es: "Hoy, Dorian está…", fr: "Aujourd'hui, Dorian est…", choix: ["contento.", "enfadado.", "cansado y triste."], bonne: 2 },
        ],
      },
      {
        id: "n2-mi-familia", titre: "Vivimos juntos", sorte: "blog", unite: 4,
        texte: [
          "Me llamo Kevin y vivo en Huesca con mi pareja, Blanca. Vivimos juntos con Léo y Dorian. Léo es mi hijo: es el pequeño de la casa. Dorian es el hijo de Blanca: es muy simpático, pero un poco tímido.",
          "Tengo tres hermanas. Mi hermana pequeña vive en París con nuestros padres. Los padres de Blanca están separados: su madre vive en Galicia, con la hermana mayor de Blanca, y su padre vive en Huesca.",
          "Por la tarde, cuido de los niños.",
        ],
        nouveaux: {},
        mots: {
          "me llamo": "je m'appelle (llamarse)", vivo: "j'habite (vivir)", "en huesca": "à Huesca", "mi pareja": "ma compagne (la pareja)",
          vivimos: "nous habitons (vivir)", juntos: "ensemble", "mi hijo": "mon fils (el hijo)", "el pequeño": "le petit (pequeño)",
          "de la casa": "de la maison", "el hijo": "le fils", simpático: "sympathique, gentil", "tímido": "timide",
          tengo: "j'ai (tener)", "tres hermanas": "trois sœurs (la hermana)", "mi hermana pequeña": "ma petite sœur",
          vive: "elle habite (vivir)", "en parís": "à Paris", "nuestros padres": "nos parents (el padre)", "los padres": "les parents",
          "están separados": "sont séparés (estar)", "su madre": "sa mère (la madre)", "en galicia": "en Galice",
          "la hermana mayor": "la grande sœur", "su padre": "son père (el padre)", "por la tarde": "l'après-midi",
          "cuido de los niños": "je m'occupe des enfants (cuidar de)",
        },
        questions: [
          { es: "Dorian es…", fr: "Dorian est…", choix: ["el hijo de Kevin.", "el hijo de Blanca.", "el sobrino de Blanca."], bonne: 1 },
          { es: "La madre de Blanca vive…", fr: "La mère de Blanca habite…", choix: ["en Huesca.", "en París.", "en Galicia."], bonne: 2 },
          { es: "La hermana pequeña de Kevin vive…", fr: "La petite sœur de Kevin habite…", choix: ["en Galicia.", "en París con sus padres.", "con Kevin."], bonne: 1 },
        ],
      },
    ],
  },
  {
    n: 3, unites: [5, 6],
    textes: [
      {
        id: "n3-cuanto-tiempo", titre: "¡Cuánto tiempo!", sorte: "dialogue", unite: 5,
        texte: [
          "— ¡Hola, Kevin! ¿Qué tal?",
          "— ¡Hola! Bien, gracias, ¿y tú? ¡Cuánto tiempo!",
          "— Bien, bien. ¡Qué frío!",
          "— Sí, hoy hace mucho frío en Huesca.",
          "— ¿Y Blanca? ¿Y los niños?",
          "— Muy bien. Dorian está en el cole y Léo está con Blanca.",
          "— ¿Y qué tal el cole de Dorian?",
          "— Bien, pero tiene muchos deberes y a veces está cansado.",
          "— ¿Y tú? ¿Estás trabajando mucho?",
          "— Sí, estoy muy ocupado, estoy trabajando mucho.",
          "— ¿Y tenéis planes para las vacaciones?",
          "— Todavía no. Pero en junio, ¡nos casamos!",
          "— ¿En serio? ¡Qué bien! ¿Cuándo?",
          "— El diecinueve de junio.",
          "— ¡Genial! Bueno… me tengo que ir, que tengo prisa. ¡Nos vemos!",
          "— ¡Hasta luego! ¡Que vaya bien!",
        ],
        nouveaux: { bueno: ["bueno"] },
        mots: {
          "qué tal": "ça va ?", "bien": "bien", gracias: "merci", "y tú": "et toi ?", "cuánto tiempo": "ça fait longtemps !",
          "qué frío": "quel froid !", hoy: "aujourd'hui", "hace mucho frío": "il fait très froid (hacer)", "en huesca": "à Huesca",
          "los niños": "les enfants (el niño)", "en el cole": "à l'école (el cole)", "estás trabajando": "tu es en train de travailler (estar + trabajar)",
          "estoy muy ocupado": "je suis très occupé (estar)", "qué tal el cole": "comment ça va, l'école ?",
          "de dorian": "de Dorian", tiene: "il a (tener)", "muchos deberes": "beaucoup de devoirs", "a veces": "parfois",
          "está cansado": "il est fatigué (estar)", "tenéis": "vous avez (tener, vosotros)", "planes": "des projets (el plan)",
          "para las vacaciones": "pour les vacances", "todavía no": "pas encore", "estoy trabajando": "je suis en train de travailler (estar + trabajar)",
          "en junio": "en juin", "nos casamos": "nous nous marions (casarse)", "en serio": "sérieux ? vraiment ?",
          "qué bien": "super !", "cuándo": "quand ?", "el diecinueve de junio": "le 19 juin", genial: "génial !",
          bueno: "bon… (pour finir une conversation)", "me tengo que ir": "je dois y aller (tener que + ir)",
          "que tengo prisa": "car je suis pressé (tener prisa)", "nos vemos": "on se voit, à plus",
          "hasta luego": "à plus tard, salut", "que vaya bien": "bonne continuation !",
        },
        questions: [
          { es: "Hoy, en Huesca…", fr: "Aujourd'hui, à Huesca…", choix: ["hace calor.", "hace mucho frío.", "llueve."], bonne: 1 },
          { es: "Kevin está…", fr: "Kevin est…", choix: ["de vacaciones.", "muy ocupado.", "enfermo."], bonne: 1 },
          { es: "Kevin y Blanca se casan…", fr: "Kevin et Blanca se marient…", choix: ["el finde.", "en agosto.", "el diecinueve de junio."], bonne: 2 },
        ],
      },
      {
        id: "n3-que-tiempo-hace", titre: "¿Qué tiempo hace en Huesca?", sorte: "blog", unite: 5,
        texte: [
          "Es una pregunta de mis hermanas: «¿Qué tiempo hace en Huesca?».",
          "En invierno, hace mucho frío por la mañana y por la noche. Y a veces hace mucho viento.",
          "En verano, hace mucho calor: a mediodía, casi nadie pasea. La gente pasea por la tarde o por la noche, y los niños también.",
          "En julio y en agosto, hace mucho calor de las dos a las seis de la tarde. Normalmente, la gente come a las dos y después descansa: ¡es la hora de la siesta!",
          "Llueve poco, y hace sol casi cada día. ¿Y en París? ¿Qué tiempo hace hoy? Y vosotras, ¿cuándo estáis en Huesca?",
        ],
        nouveaux: { invierno: ["invierno"], verano: ["verano"] },
        mots: {
          "una pregunta": "une question", "mis hermanas": "mes sœurs (la hermana)", "qué tiempo hace": "quel temps fait-il ? (hacer)",
          "en huesca": "à Huesca", "en invierno": "en hiver (el invierno)", "hace mucho frío": "il fait très froid",
          "por la mañana": "le matin", "por la noche": "le soir, la nuit", "a veces": "parfois", "hace mucho viento": "il y a beaucoup de vent",
          "en verano": "en été (el verano)", "hace mucho calor": "il fait très chaud", "a mediodía": "à midi",
          "casi nadie": "presque personne", pasea: "se promène (pasear)", "la gente": "les gens (au singulier en espagnol)",
          "por la tarde": "l'après-midi, en fin de journée", "los niños": "les enfants (el niño)", llueve: "il pleut (llover)",
          poco: "peu", "hace sol": "il fait soleil", "en julio y en agosto": "en juillet et en août",
          "de las dos a las seis de la tarde": "de deux heures à six heures de l'après-midi", normalmente: "d'habitude",
          come: "déjeune (comer)", "a las dos": "à deux heures", "y después": "et après", descansa: "se repose (descansar)",
          "es la hora de la siesta": "c'est l'heure de la sieste", vosotras: "vous (des femmes)", "cuándo": "quand",
          "estáis": "vous êtes (estar, vosotros)", "casi cada día": "presque chaque jour", "en parís": "à Paris", hoy: "aujourd'hui",
        },
        questions: [
          { es: "En invierno, en Huesca…", fr: "En hiver, à Huesca…", choix: ["hace mucho frío por la mañana.", "hace calor.", "llueve mucho."], bonne: 0 },
          { es: "En verano, a mediodía…", fr: "En été, à midi…", choix: ["la gente pasea.", "casi nadie pasea.", "los niños pasean."], bonne: 1 },
          { es: "En Huesca…", fr: "À Huesca…", choix: ["llueve mucho.", "nunca hace viento.", "hace sol casi cada día."], bonne: 2 },
        ],
      },
      {
        id: "n3-menu-del-dia", titre: "Menú del día", sorte: "menu", unite: 6,
        texte: [
          "Restaurante del barrio · de lunes a viernes, a mediodía.",
          "Para empezar: verdura del día.",
          "Después: carne o pescado. ¿Prefieres picante? Pide la carne de la casa.",
          "Y luego: fruta.",
          "Con pan, y agua, vino o una caña.",
          "Precio: doce euros. ¡Rico y barato!",
          "Para los niños: carne con pan y fruta, seis euros.",
          "Sábados y domingos: menú del fin de semana, dieciocho euros, con el pescado del día.",
          "Si hace sol, puedes comer en la terraza.",
        ],
        nouveaux: { "menú": ["menú"] },
        mots: {
          restaurante: "restaurant (el restaurante)", "del barrio": "du quartier (el barrio)", "de lunes a viernes": "du lundi au vendredi",
          "a mediodía": "à midi", "para empezar": "pour commencer (empezar)", "verdura del día": "légumes du jour (la verdura)",
          "después": "après", carne: "viande (la carne)", pescado: "poisson (el pescado)", prefieres: "tu préfères (preferir)",
          picante: "épicé", pide: "commande (pedir)", "la carne de la casa": "la viande de la maison",
          luego: "ensuite", fruta: "fruits (la fruta)", "con pan": "avec du pain (el pan)", agua: "eau (el agua)", vino: "vin (el vino)",
          "una caña": "une petite bière pression", precio: "prix (el precio)", "doce euros": "douze euros",
          rico: "bon, délicieux", barato: "pas cher", "para los niños": "pour les enfants", "seis euros": "six euros",
          "sábados y domingos": "le samedi et le dimanche", "menú del fin de semana": "menu du week-end (el menú)", "dieciocho euros": "dix-huit euros",
          "con el pescado del día": "avec le poisson du jour", "si hace sol": "s'il fait soleil", puedes: "tu peux (poder)",
          "comer": "manger, déjeuner", "en la terraza": "en terrasse",
        },
        questions: [
          { es: "El menú del día es…", fr: "Le menu du jour, c'est…", choix: ["los sábados.", "de lunes a viernes.", "por la noche."], bonne: 1 },
          { es: "Después de la verdura, puedes comer…", fr: "Après les légumes, tu peux manger…", choix: ["carne o pescado.", "solo fruta.", "solo pan."], bonne: 0 },
          { es: "El precio del menú es…", fr: "Le prix du menu est…", choix: ["dos euros.", "veinte euros.", "doce euros."], bonne: 2 },
        ],
      },
      {
        id: "n3-te-apetece", titre: "¿Te apetece?", sorte: "message", unite: 6, de: "Blanca",
        texte: [
          "Hola, cariño. ¿Qué tal el día? Yo estoy un poco cansada, pero tengo un plan para el finde: ¡mis amigas quieren quedar el sábado! ¿Te apetece? Podemos ir a una terraza a mediodía, con los niños. Después, si hace sol, paseamos un poco. ¿O prefieres comer en casa? A mí me da igual. Pero en la terraza, ¡tú pides las cañas en español! Y el domingo, mi padre quiere comer con nosotros. ¿Qué piensas? Hoy, en el trabajo, mucha gente está enferma: ¡qué pena! Un beso.",
        ],
        nouveaux: {},
        mots: {
          "cariño": "chéri (mot doux)", "qué tal el día": "comment s'est passée ta journée ?", "un poco": "un peu",
          cansada: "fatiguée", tengo: "j'ai (tener)", "un plan": "un projet, un programme", "para el finde": "pour le week-end",
          "mis amigas": "mes amies (la amiga)", quieren: "veulent (querer)", "quedar": "se retrouver, se donner rendez-vous",
          "el sábado": "samedi (qui vient)", "te apetece": "ça te dit ? (apetecer)", podemos: "nous pouvons (poder)",
          ir: "aller", "a una terraza": "à une terrasse", "a mediodía": "à midi", "con los niños": "avec les enfants",
          "después": "après", "si hace sol": "s'il fait soleil", paseamos: "on se promène (pasear)",
          prefieres: "tu préfères (preferir)", "comer en casa": "déjeuner à la maison", "a mí me da igual": "moi, ça m'est égal",
          "en la terraza": "sur la terrasse", pides: "tu commandes (pedir)", "las cañas": "les petites bières (la caña)",
          "en español": "en espagnol", "y el domingo": "et dimanche", "mi padre": "mon père (el padre)", quiere: "veut (querer)",
          "con nosotros": "avec nous", "qué piensas": "qu'est-ce que tu en penses ? (pensar)", hoy: "aujourd'hui", comer: "déjeuner, manger",
          "en el trabajo": "au travail", "mucha gente": "beaucoup de gens", "está enferma": "est malade (estar)", "qué pena": "dommage !",
          "un beso": "bisous",
        },
        questions: [
          { es: "El sábado, las amigas de Blanca quieren…", fr: "Samedi, les amies de Blanca veulent…", choix: ["quedar.", "trabajar.", "ir al cole."], bonne: 0 },
          { es: "Después de la terraza, si hace sol…", fr: "Après la terrasse, s'il fait soleil…", choix: ["comen en casa.", "pasean un poco.", "van al gimnasio."], bonne: 1 },
          { es: "En la terraza, Kevin pide las cañas…", fr: "Sur la terrasse, Kevin commande les bières…", choix: ["en francés.", "en inglés.", "en español."], bonne: 2 },
        ],
      },
    ],
  },
  {
    n: 4, unites: [7, 8],
    textes: [
      {
        id: "n4-donde-estan-las-llaves", titre: "¿Dónde están las llaves?", sorte: "histoire", unite: 7,
        texte: [
          "Son las doce menos cuarto y Kevin tiene que salir: entrena a las doce. Pero no encuentra las llaves.",
          "— Blanca, ¿dónde están las llaves? No están encima de la mesa.",
          "— ¿En el salón, al lado del ordenador?",
          "— No. Y tampoco están en la cocina.",
          "— ¿Y en la bolsa del gimnasio?",
          "— ¡Sí! Están dentro de la bolsa. ¡Gracias, cariño!",
          "— De nada. ¿A qué hora vuelves? Comemos a las dos.",
          "— Vuelvo a la una y media. ¡Hasta luego!",
          "A la una y media, Kevin vuelve a casa. Pero no encuentra el teléfono.",
          "— ¡Blanca! ¿Dónde está mi teléfono?",
          "— En tu bolsa, cariño.",
        ],
        nouveaux: {},
        mots: {
          "son las doce menos cuarto": "il est midi moins le quart", "tiene que salir": "il doit sortir (tener que + salir)",
          entrena: "il s'entraîne (entrenar)", "a las doce": "à midi (à douze heures)", encuentra: "il trouve (encontrar)",
          "las llaves": "les clés (la llave)", "dónde están": "où sont… ? (estar)", "no están": "elles ne sont pas (estar)",
          "encima de la mesa": "sur la table", "en el salón": "dans le salon", "al lado del ordenador": "à côté de l'ordinateur",
          "tampoco están": "elles ne sont pas non plus (estar)", "en la cocina": "dans la cuisine", "en la bolsa del gimnasio": "dans le sac de sport",
          "están": "elles sont (estar)", "dentro de la bolsa": "dans le sac", gracias: "merci", "cariño": "chérie (mot doux)",
          "de nada": "de rien", "a qué hora": "à quelle heure", vuelves: "tu rentres (volver)", comemos: "on déjeune (comer)",
          "a las dos": "à deux heures", vuelvo: "je rentre (volver)", "a la una y media": "à une heure et demie", "hasta luego": "à plus tard, salut",
          "vuelve a casa": "il rentre à la maison (volver)", pero: "mais", "el teléfono": "le téléphone", "dónde está": "où est… ? (estar)",
          "mi teléfono": "mon téléphone", "en tu bolsa": "dans ton sac",
        },
        questions: [
          { es: "Kevin no encuentra…", fr: "Kevin ne trouve pas…", choix: ["el ordenador.", "las llaves.", "la bolsa."], bonne: 1 },
          { es: "Las llaves están…", fr: "Les clés sont…", choix: ["encima de la mesa.", "en la cocina.", "dentro de la bolsa del gimnasio."], bonne: 2 },
          { es: "Kevin vuelve…", fr: "Kevin rentre…", choix: ["a la una y media.", "a las doce.", "a las dos."], bonne: 0 },
        ],
      },
      {
        id: "n4-a-los-vecinos", titre: "A los vecinos del portal", sorte: "annonce", unite: 7,
        texte: [
          "Hola, vecinos:",
          "El ascensor no funciona. Un señor viene el jueves, a las diez de la mañana, para el ascensor.",
          "La basura, por favor, fuera del portal: no dentro. ¡Gracias!",
          "Hay una llave en la mesa del portal. ¿De quién es? Si es tu llave, tienes que hablar con la vecina del piso tres.",
          "El sábado, a las seis de la tarde, hay una reunión de vecinos en el portal: tenemos que hablar del ascensor y de la basura. ¿Puedes venir?",
          "Y, por favor, los niños no pueden estar solos en el ascensor.",
          "Hasta luego, y gracias.",
          "Los vecinos del piso cinco",
        ],
        nouveaux: {},
        mots: {
          vecinos: "voisins (el vecino)", "el ascensor": "l'ascenseur", "no funciona": "ne marche pas (funcionar)",
          "un señor": "un monsieur", viene: "vient (venir)", "el jueves": "jeudi (qui vient)", "a las diez de la mañana": "à dix heures du matin",
          "para el ascensor": "pour l'ascenseur", "la basura": "les poubelles", "por favor": "s'il vous plaît",
          "fuera del portal": "hors de l'entrée de l'immeuble", "no dentro": "pas dedans", gracias: "merci",
          hay: "il y a", "una llave": "une clé", "en la mesa del portal": "sur la table de l'entrée",
          "de quién es": "à qui est-elle ?", si: "si", "es tu llave": "c'est ta clé", "tienes que hablar": "tu dois parler (tener que)",
          "con la vecina": "avec la voisine", "del piso tres": "du troisième étage (el piso)", "hasta luego": "à plus tard",
          "los vecinos": "les voisins", "del piso cinco": "du cinquième étage",
          "el sábado": "samedi (qui vient)", "a las seis de la tarde": "à six heures du soir", "una reunión de vecinos": "une réunion de voisins",
          "en el portal": "dans l'entrée de l'immeuble", "tenemos que hablar": "nous devons parler (tener que)", "del ascensor": "de l'ascenseur",
          "de la basura": "des poubelles", puedes: "tu peux (poder)", venir: "venir", "los niños": "les enfants",
          "no pueden estar solos": "ne peuvent pas être seuls (poder)", "en el ascensor": "dans l'ascenseur",
        },
        questions: [
          { es: "El ascensor…", fr: "L'ascenseur…", choix: ["funciona bien.", "no funciona.", "está en el piso tres."], bonne: 1 },
          { es: "El jueves, un señor viene…", fr: "Jeudi, un monsieur vient…", choix: ["a las diez de la noche.", "a mediodía.", "a las diez de la mañana."], bonne: 2 },
          { es: "En la mesa del portal, hay…", fr: "Sur la table de l'entrée, il y a…", choix: ["una llave.", "una bolsa.", "la basura."], bonne: 0 },
        ],
      },
      {
        id: "n4-vamos-que-llegamos-tarde", titre: "¡Vamos, que llegamos tarde!", sorte: "dialogue", unite: 8,
        texte: [
          "— ¡Venga, Léo! ¡Date prisa!",
          "— ¡Ya voy, papá!",
          "— Dorian, ¿estás listo? ¿Tienes la mochila?",
          "— Sí, está en el salón.",
          "— Léo, ¡ponte los zapatos y el abrigo! Hace frío.",
          "— ¿Los zapatos rojos?",
          "— No, los azules. ¡Rápido!",
          "— Dorian, ¡lávate los dientes!",
          "— ¡Enseguida!",
          "— Papá, ¿dónde están mis zapatos?",
          "— Debajo de la mesa del salón.",
          "— ¡No están!",
          "— ¿Y detrás de la silla?",
          "— ¡Sí, aquí están!",
          "— ¡Cuidado, Léo! ¡Ven aquí!",
          "— ¡Ya estoy listo, papá!",
          "— ¡Muy bien! ¡Vamos, que llegamos tarde!",
        ],
        nouveaux: {},
        mots: {
          venga: "allez !", "date prisa": "dépêche-toi (darse prisa)", "ya voy": "j'arrive !", "papá": "papa",
          "estás listo": "tu es prêt ? (estar)", tienes: "tu as (tener)", "la mochila": "le cartable", "está en el salón": "il est dans le salon (estar)",
          "ponte los zapatos": "mets tes chaussures (ponerse)", "y el abrigo": "et ton manteau", "hace frío": "il fait froid",
          "los zapatos rojos": "les chaussures rouges", "los azules": "les bleues (azul)", "rápido": "vite",
          "lávate los dientes": "brosse-toi les dents (lavarse)", enseguida: "tout de suite !", cuidado: "attention !",
          "ven aquí": "viens ici !", "dónde están": "où sont… ? (estar)", "mis zapatos": "mes chaussures (el zapato)",
          "debajo de la mesa del salón": "sous la table du salon", "no están": "elles ne sont pas là (estar)",
          "detrás de la silla": "derrière la chaise", "aquí están": "les voilà ! (elles sont ici)", "ya estoy listo": "je suis prêt !", "muy bien": "très bien !", vamos: "on y va !",
          "que llegamos tarde": "on va être en retard (llegar tarde)",
        },
        questions: [
          { es: "Hoy hace…", fr: "Aujourd'hui, il fait…", choix: ["calor.", "frío.", "sol."], bonne: 1 },
          { es: "La mochila de Dorian está…", fr: "Le cartable de Dorian est…", choix: ["en el cole.", "en el baño.", "en el salón."], bonne: 2 },
          { es: "Léo se pone los zapatos…", fr: "Léo met les chaussures…", choix: ["azules.", "rojos.", "negros."], bonne: 0 },
        ],
      },
      {
        id: "n4-un-cuento-para-leo", titre: "Un cuento para Léo", sorte: "histoire", unite: 8,
        texte: [
          "Son las ocho de la noche. Léo se baña y después se pone el pijama.",
          "— ¡Lávate los dientes, Léo! — dice Kevin.",
          "— ¡Ya voy, papá!",
          "Léo se sienta en la cama y Kevin le lee un cuento: el cuento de un perro azul. ¡A Léo le encanta! Después del cuento, Kevin apaga la luz.",
          "— Papá, ¡un cuento más!",
          "— No, Léo: son las nueve. ¡A la cama!",
          "Léo está muy cansado y duerme enseguida. Y Dorian lee solo en su cama: ¡ya tiene siete años! Luego, Kevin y Blanca descansan un poco en el salón.",
        ],
        nouveaux: { perro: ["perro"] },
        mots: {
          "son las ocho de la noche": "il est huit heures du soir", "se baña": "il prend son bain (bañarse)", "y después": "et après",
          "se pone el pijama": "il met son pyjama (ponerse)", "lávate los dientes": "brosse-toi les dents (lavarse)", dice: "dit (decir)",
          "ya voy": "j'arrive !", "papá": "papa", "se sienta": "il s'assoit (sentarse)", "en la cama": "sur le lit",
          "le lee": "lui lit (leer)", "un cuento": "une histoire", "el cuento": "l'histoire (el cuento)", "de un perro azul": "d'un chien bleu (el perro)",
          "a léo le encanta": "Léo adore ça (encantar)", "después del cuento": "après l'histoire", "apaga la luz": "éteint la lumière (apagar)",
          lee: "lit (leer)", solo: "seul", "un cuento más": "encore une histoire",
          "son las nueve": "il est neuf heures", "a la cama": "au lit !", "está muy cansado": "il est très fatigué (estar)",
          duerme: "il dort (dormir)", enseguida: "tout de suite", luego: "ensuite", descansan: "se reposent (descansar)",
          "un poco": "un peu", "en el salón": "dans le salon", "en su cama": "dans son lit", "ya tiene siete años": "il a déjà sept ans",
        },
        questions: [
          { es: "Antes del cuento, Léo…", fr: "Avant l'histoire, Léo…", choix: ["se baña.", "come.", "va al cole."], bonne: 0 },
          { es: "El cuento es de…", fr: "L'histoire parle…", choix: ["un perro rojo.", "un perro azul.", "un niño."], bonne: 1 },
          { es: "Dorian…", fr: "Dorian…", choix: ["juega con Léo.", "apaga la luz.", "lee solo en su cama."], bonne: 2 },
        ],
      },
    ],
  },
];

export const TEXTES = NIVEAUX.flatMap(nv => nv.textes.map(t => ({ ...t, niveau: nv.n })));
export const texte = id => TEXTES.find(t => t.id === id) || null;
// Le niveau d'une unité du livre : U1-U2 → 1, U3-U4 → 2… (Noël, sans numéro, compte avec l'unité d'avant.)
export const niveauDe = n => Math.max(1, Math.ceil((n || 1) / 2));
export const nbMots = t => t.texte.join(" ").match(/\p{L}+/gu).length;

// ── Le découpage : paragraphes → phrases → morceaux ──
// Une phrase finit par . ! ? ou … suivi d'un espace (« ¿Cómo te llamas? » reste entière).
export const phrases = paragraphe => paragraphe.split(/(?<=[.!?…])\s+/).filter(Boolean);
const minuscule = s => s.toLocaleLowerCase("es");

// Les morceaux d'une phrase : { t, g, nouveau } pour un mot ou un groupe de mots à toucher,
// { t } pour la ponctuation, les espaces et les prénoms. g : la traduction (null si rien trouvé, le test le signale).
export function morceaux(phrase, tx) {
  const jetons = [...phrase.matchAll(/\p{L}+|[^\p{L}]+/gu)].map(m => m[0]);
  const formesNouvelles = new Set(Object.values(tx.nouveaux || {}).flat().map(minuscule));
  const sortie = [];
  for (let i = 0; i < jetons.length;) {
    const j = jetons[i];
    if (!/\p{L}/u.test(j) || NOMS.has(minuscule(j))) { sortie.push({ t: j }); i++; continue; }
    // Le plus long groupe connu, jusqu'à 10 mots (avec seulement des espaces entre eux).
    let trouve = null;
    for (let n = 10; n >= 1 && !trouve; n--) {
      const bout = jetons.slice(i, i + 2 * n - 1);
      if (bout.length < 2 * n - 1 || bout.some((x, k) => k % 2 ? x !== " " : !/\p{L}/u.test(x))) continue;
      const cle = minuscule(bout.join(""));
      const g = tx.mots?.[cle] ?? GLOSE[cle];
      if (g) trouve = { t: bout.join(""), g, n: bout.length };
    }
    if (!trouve) trouve = { t: j, g: null, n: 1 };
    const nouveau = minuscule(trouve.t).split(" ").some(m => formesNouvelles.has(m));
    sortie.push({ t: trouve.t, g: trouve.g, ...(nouveau && { nouveau: true }) });
    i += trouve.n;
  }
  return sortie;
}
