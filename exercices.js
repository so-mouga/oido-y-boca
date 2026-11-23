// Les exercices écrits à l'avance, une leçon à la fois (générés dans Claude Code à partir du livre et du tableau).
// Ils n'utilisent que les mots et la grammaire déjà vus. Les cartes, elles, viennent des 5 mots du tableau.
//
// ecrire : { consigne, fr, es: [réponses acceptées] }   → tu tapes la réponse, l'appli vérifie.
//          + v, p pour un verbe à conjuguer (p : 0 = yo … 5 = ellos) : l'explication se calcule toute seule.
//            + d ("ue", "ie" ou "i") pour un verbe qui change de voyelle (dormir, empezar, vestirse).
//            ⚠ Jamais de v sur un irrégulier que controles.js ne connaît pas (IRREGULIERS).
//            + t ("pc", "ps" ou "imp") pour un temps du passé (absent = présent) : réponse, explication et « Les 6 formes » au bon temps.
//          + expl (facultatif) : l'explication écrite, quand la règle de la leçon n'aide pas pour cette phrase.
// dire   : { fr, es }                                    → tu la dis à voix haute, tu compares, tu te notes.
//
// Unités prêtes : 1 à 14, et Noël. Les suivantes s'ajoutent au fil des leçons.

const T = "Traduis";
const C = "Complète";
const L = "Écris en lettres";

export const EXERCICES = {
  "U1-L1": {
    ecrire: [
      { consigne: T, fr: "Je ne comprends pas.", es: ["No entiendo."] },
      { consigne: T, fr: "Tu peux parler plus lentement ?", es: ["¿Puedes hablar más despacio?"] },
      { consigne: C, fr: "Nosotros ___ francés en casa. (hablar)", es: ["hablamos"], v: "hablar", p: 3 },
      { consigne: T, fr: "Comment on dit « fourchette » en espagnol ?", es: ["¿Cómo se dice fourchette en español?"] },
    ],
    dire: [
      { fr: "Je ne comprends pas. Tu peux parler plus lentement ?", es: "No entiendo. ¿Puedes hablar más despacio?" },
      { fr: "Tu peux répéter, s'il te plaît ?", es: "¿Puedes repetir, por favor?" },
      { fr: "Que veut dire « apetecer » ?", es: "¿Qué significa «apetecer»?" },
    ],
  },
  "U1-L2": {
    ecrire: [
      { consigne: T, fr: "Je m'appelle Kevin.", es: ["Me llamo Kevin."] },
      { consigne: C, fr: "Blanca ___ española. (ser)", es: ["es"], v: "ser", p: 2 },
      { consigne: T, fr: "Léo a quatre ans.", es: ["Léo tiene cuatro años."] },
      { consigne: T, fr: "Quel est ton nom de famille ?", es: ["¿Cuál es tu apellido?"] },
    ],
    dire: [
      { fr: "Je m'appelle Kevin et je suis français.", es: "Me llamo Kevin y soy francés." },
      { fr: "Comment tu t'appelles ?", es: "¿Cómo te llamas?" },
      { fr: "Nous nous marions en juin.", es: "Nos casamos en junio." },
    ],
  },
  "U1-L3": {
    ecrire: [
      { consigne: T, fr: "J'habite à Huesca depuis cinq ans.", es: ["Vivo en Huesca desde hace cinco años."] },
      { consigne: C, fr: "Nosotros ___ en un piso. (vivir)", es: ["vivimos"], v: "vivir", p: 3 },
      { consigne: T, fr: "Tu habites dans un appartement ou dans une maison ?", es: ["¿Vives en un piso o en una casa?"] },
      { consigne: T, fr: "Huesca est une petite ville.", es: ["Huesca es una ciudad pequeña."] },
    ],
    dire: [
      { fr: "Nous habitons dans un appartement, en ville.", es: "Vivimos en un piso, en la ciudad." },
      { fr: "Où est-ce que tu habites ?", es: "¿Dónde vives?" },
      { fr: "Mes parents habitent à Paris avec ma petite sœur.", es: "Mis padres viven en París con mi hermana pequeña." },
    ],
  },
  "U1-L4": {
    ecrire: [
      { consigne: T, fr: "Je travaille à la maison.", es: ["Trabajo desde casa.", "Trabajo en casa."] },
      { consigne: C, fr: "Hoy ___ muy cansado. (estar, yo)", es: ["estoy"], v: "estar", p: 0 },
      { consigne: T, fr: "J'ai une réunion à dix heures.", es: ["Tengo una reunión a las diez."] },
      { consigne: T, fr: "Je suis dans mon bureau.", es: ["Estoy en mi despacho."] },
    ],
    dire: [
      { fr: "Je travaille à la maison, en français et en anglais.", es: "Trabajo desde casa, en francés y en inglés." },
      { fr: "Dans quelle entreprise tu travailles ?", es: "¿En qué empresa trabajas?" },
      { fr: "Blanca est à la maison.", es: "Blanca está en casa." },
    ],
  },
  "U1-L5": {
    ecrire: [
      { consigne: C, fr: "Nosotros ___ con mi suegro el domingo. (comer)", es: ["comemos"], v: "comer", p: 3 },
      { consigne: T, fr: "Tu as des frères et sœurs ?", es: ["¿Tienes hermanos?"] },
      { consigne: T, fr: "Blanca est ma compagne.", es: ["Blanca es mi pareja."] },
      { consigne: C, fr: "Léo y Dorian ___ en casa hoy. (estar)", es: ["están"], v: "estar", p: 5 },
    ],
    dire: [
      { fr: "Blanca est ma compagne. Nous nous marions en juin.", es: "Blanca es mi pareja. Nos casamos en junio." },
      { fr: "Tes cousins viennent au mariage ?", es: "¿Vienen tus primos a la boda?" },
      { fr: "Ce dimanche, nous mangeons avec mon beau-père.", es: "Este domingo comemos con mi suegro." },
    ],
  },
  "U1-L6": {
    ecrire: [
      { consigne: T, fr: "Je comprends un peu, mais je ne parle pas beaucoup.", es: ["Entiendo un poco, pero no hablo mucho."] },
      { consigne: T, fr: "Je ne parle pas encore bien espagnol.", es: ["Todavía no hablo bien español.", "Todavía no hablo bien el español.", "No hablo bien español todavía."] },
      { consigne: T, fr: "Moi aussi, je travaille à la maison.", es: ["Yo también trabajo desde casa.", "Yo también trabajo en casa."] },
      { consigne: T, fr: "J'apprends l'espagnol parce que j'habite en Espagne.", es: ["Aprendo español porque vivo en España.", "Aprendo el español porque vivo en España."] },
    ],
    dire: [
      { fr: "Je comprends déjà beaucoup de mots.", es: "Ya entiendo muchas palabras." },
      { fr: "Je comprends un peu, mais je ne parle pas encore beaucoup.", es: "Entiendo un poco, pero todavía no hablo mucho." },
      { fr: "Présente-toi en 3 phrases : ton nom, où tu habites, ton travail.", es: "Me llamo Kevin y soy francés. Vivo en Huesca desde hace cinco años. Trabajo desde casa." },
    ],
  },
  "U2-L1": {
    ecrire: [
      { consigne: T, fr: "Dorian a sept ans.", es: ["Dorian tiene siete años."] },
      { consigne: C, fr: "Nosotros ___ dos hijos. (tener)", es: ["tenemos"], v: "tener", p: 3 },
      { consigne: L, fr: "15", es: ["quince"] },
      { consigne: T, fr: "Quand est ton anniversaire ?", es: ["¿Cuándo es tu cumpleaños?"] },
    ],
    dire: [
      { fr: "Léo a quatre ans et Dorian en a sept.", es: "Léo tiene cuatro años y Dorian tiene siete." },
      { fr: "Quel est ton numéro de téléphone ?", es: "¿Cuál es tu número de teléfono?" },
      { fr: "Compte de 11 à 20.", es: "once, doce, trece, catorce, quince, dieciséis, diecisiete, dieciocho, diecinueve, veinte" },
    ],
  },
  "U2-L2": {
    ecrire: [
      { consigne: L, fr: "45", es: ["cuarenta y cinco"] },
      { consigne: L, fr: "21", es: ["veintiuno"] },
      { consigne: T, fr: "Ça fait douze euros cinquante.", es: ["Son doce euros con cincuenta."] },
      { consigne: T, fr: "C'est à peu près quarante euros.", es: ["Son más o menos cuarenta euros."] },
    ],
    dire: [
      { fr: "Ça fait trois euros vingt.", es: "Son tres euros con veinte céntimos." },
      { fr: "La moitié de cent, c'est cinquante.", es: "La mitad de cien es cincuenta." },
      { fr: "Dis ce numéro de portable, comme en Espagne : 6 12 34 56 78", es: "seis, doce, treinta y cuatro, cincuenta y seis, setenta y ocho" },
    ],
  },
  "U2-L3": {
    ecrire: [
      { consigne: T, fr: "Quelle heure est-il ?", es: ["¿Qué hora es?"] },
      { consigne: T, fr: "Il est une heure.", es: ["Es la una."] },
      { consigne: T, fr: "Il est huit heures et demie.", es: ["Son las ocho y media."] },
      { consigne: T, fr: "Je commence à travailler à neuf heures et demie.", es: ["Empiezo a trabajar a las nueve y media."] },
    ],
    dire: [
      { fr: "Il est trois heures moins le quart.", es: "Son las tres menos cuarto." },
      { fr: "À midi, je vais à la salle de sport.", es: "Al mediodía voy al gimnasio." },
      { fr: "Le soir, je parle espagnol avec Blanca.", es: "Por la noche hablo español con Blanca." },
    ],
  },
  "U2-L4": {
    ecrire: [
      { consigne: T, fr: "Aujourd'hui, c'est lundi.", es: ["Hoy es lunes."] },
      { consigne: T, fr: "Le jeudi (tous les jeudis), je ne vais pas à la salle de sport.", es: ["Los jueves no voy al gimnasio."] },
      { consigne: T, fr: "Le week-end, je ne travaille pas.", es: ["El fin de semana no trabajo.", "Los fines de semana no trabajo."] },
      { consigne: T, fr: "Demain, c'est mardi.", es: ["Mañana es martes."] },
    ],
    dire: [
      { fr: "Aujourd'hui, c'est lundi ; hier, c'était dimanche.", es: "Hoy es lunes, ayer fue domingo." },
      { fr: "Je vais à la salle de sport quatre jours par semaine.", es: "Voy al gimnasio cuatro días a la semana." },
      { fr: "Demain matin, je travaille à la maison.", es: "Mañana por la mañana trabajo desde casa." },
    ],
  },
  "U2-L5": {
    ecrire: [
      { consigne: L, fr: "le 19 juin", es: ["el diecinueve de junio"] },
      { consigne: T, fr: "Quel jour sommes-nous ?", es: ["¿Qué día es hoy?"] },
      { consigne: L, fr: "2027", es: ["dos mil veintisiete"] },
      { consigne: T, fr: "Le mois prochain, c'est décembre.", es: ["El próximo mes es diciembre.", "El mes próximo es diciembre.", "El mes que viene es diciembre."] },
    ],
    dire: [
      { fr: "Nous nous marions le 19 juin 2027.", es: "Nos casamos el diecinueve de junio de dos mil veintisiete." },
      { fr: "Quelle est la date du mariage ?", es: "¿Cuál es la fecha de la boda?" },
      { fr: "Noël, c'est le 25 décembre.", es: "Navidad es el veinticinco de diciembre." },
    ],
  },
  "U3-L1": {
    ecrire: [
      { consigne: T, fr: "Je me lève à sept heures.", es: ["Me levanto a las siete."] },
      { consigne: C, fr: "Blanca ___ a las siete y media. (levantarse)", es: ["se levanta"], v: "levantarse", p: 2 },
      { consigne: C, fr: "Léo y Dorian ___ a las ocho. (vestirse)", es: ["se visten"], v: "vestirse", d: "i", p: 5 },
      { consigne: T, fr: "Je me réveille à sept heures et je me douche.", es: ["Me despierto a las siete y me ducho."] },
    ],
    dire: [
      { fr: "Je me réveille à sept heures moins le quart.", es: "Me despierto a las siete menos cuarto." },
      { fr: "À quelle heure tu te lèves ?", es: "¿A qué hora te levantas?" },
      { fr: "Nous prenons le petit-déjeuner à huit heures.", es: "Desayunamos a las ocho." },
    ],
  },
  "U3-L2": {
    ecrire: [
      { consigne: T, fr: "Nous déjeunons à deux heures.", es: ["Comemos a las dos."] },
      { consigne: T, fr: "À la maison, nous dînons à neuf heures.", es: ["En casa cenamos a las nueve."] },
      { consigne: C, fr: "Léo y Dorian ___ a las cinco y media. (merendar)", es: ["meriendan"], v: "merendar", d: "ie", p: 5 },
      { consigne: T, fr: "Le dîner est à neuf heures et demie.", es: ["La cena es a las nueve y media."] },
    ],
    dire: [
      { fr: "En Espagne, nous déjeunons à deux heures.", es: "En España comemos a las dos." },
      { fr: "À quelle heure vous dînez ? (vosotros)", es: "¿A qué hora cenáis?" },
      { fr: "Le déjeuner, c'est à quelle heure ?", es: "¿A qué hora es la comida?" },
    ],
  },
  "U3-L3": {
    ecrire: [
      { consigne: T, fr: "Je me douche avant de prendre le petit-déjeuner.", es: ["Me ducho antes de desayunar."] },
      { consigne: T, fr: "Je me lève tôt.", es: ["Me levanto temprano."] },
      { consigne: T, fr: "Le dimanche (tous les dimanches), nous dînons tard.", es: ["Los domingos cenamos tarde."] },
      { consigne: T, fr: "Après avoir pris le petit-déjeuner, j'emmène Léo à l'école.", es: ["Después de desayunar, llevo a Léo al cole.", "Después de desayunar, llevo a Léo al colegio."] },
    ],
    dire: [
      { fr: "Avant de travailler, je vais à la salle de sport.", es: "Antes de trabajar, voy al gimnasio." },
      { fr: "Je déjeune, et ensuite je travaille.", es: "Como y luego trabajo." },
      { fr: "Après avoir dîné, je parle espagnol avec Blanca.", es: "Después de cenar, hablo español con Blanca." },
    ],
  },
  "U3-L4": {
    ecrire: [
      { consigne: T, fr: "Je rentre de la salle de sport à une heure et demie.", es: ["Vuelvo del gimnasio a la una y media."] },
      { consigne: C, fr: "Hoy no ___ ir al gimnasio. (poder, yo)", es: ["puedo"], v: "poder", d: "ue", p: 0 },
      { consigne: C, fr: "Dorian ___ mucho. (dormir)", es: ["duerme"], v: "dormir", d: "ue", p: 2 },
      { consigne: C, fr: "Nosotros ___ a las diez. (volver)", es: ["volvemos"], v: "volver", d: "ue", p: 3 },
    ],
    dire: [
      { fr: "Aujourd'hui, je ne peux pas aller à la salle de sport.", es: "Hoy no puedo ir al gimnasio." },
      { fr: "Le samedi (tous les samedis), je fais les courses avec Blanca.", es: "Los sábados hago la compra con Blanca." },
      { fr: "Blanca cuisine, et moi, je m'entraîne.", es: "Blanca cocina y yo entreno." },
    ],
  },
  "U3-L5": {
    ecrire: [
      { consigne: C, fr: "Yo ___ a trabajar a las nueve y media. (empezar)", es: ["empiezo"], v: "empezar", d: "ie", p: 0 },
      { consigne: T, fr: "Je ne dîne jamais tard.", es: ["Nunca ceno tarde.", "No ceno nunca tarde."] },
      { consigne: C, fr: "Léo ___ comer en casa. (preferir)", es: ["prefiere"], v: "preferir", d: "ie", p: 2 },
      { consigne: T, fr: "D'habitude, je m'entraîne chaque jour.", es: ["Normalmente entreno cada día."] },
    ],
    dire: [
      { fr: "D'habitude je m'entraîne chaque jour, mais parfois je ne peux pas.", es: "Normalmente entreno cada día, pero a veces no puedo." },
      { fr: "Je ne dîne presque jamais à neuf heures.", es: "Casi nunca ceno a las nueve." },
      { fr: "Tu veux dîner à la maison ?", es: "¿Quieres cenar en casa?" },
    ],
  },
  "U3-L6": {
    ecrire: [
      { consigne: C, fr: "Blanca y yo ___ al gimnasio. (ir)", es: ["vamos"], v: "ir", p: 3 },
      { consigne: T, fr: "À cinq heures, je vais chercher Léo à l'école.", es: ["A las cinco voy a buscar a Léo al cole.", "A las cinco voy a buscar a Léo al colegio."] },
      { consigne: C, fr: "Léo y Dorian ___ a las nueve. (acostarse)", es: ["se acuestan"], v: "acostarse", d: "ue", p: 5 },
      { consigne: T, fr: "J'arrive à la maison à six heures.", es: ["Llego a casa a las seis."] },
    ],
    dire: [
      { fr: "Le dimanche (tous les dimanches), je me repose.", es: "Los domingos descanso." },
      { fr: "Je me couche à onze heures.", es: "Me acuesto a las once." },
      { fr: "Raconte ta journée en 4 phrases : le réveil, le travail, le sport, le coucher.", es: "Me despierto a las siete. Trabajo desde casa. Vuelvo del gimnasio a la una y media. Me acuesto a las once." },
    ],
  },
  "U4-L1": {
    ecrire: [
      { consigne: T, fr: "Léo est mon fils et Dorian est le fils de Blanca.", es: ["Léo es mi hijo y Dorian es el hijo de Blanca."] },
      { consigne: C, fr: "Léo y Dorian son ___ hijos. (notre)", es: ["nuestros"],
        expl: "« Notre » devant un nom masculin pluriel : **nuestros** (*nuestro, nuestra, nuestros, nuestras*)." },
      { consigne: T, fr: "Dorian est l'aîné et Léo est le petit.", es: ["Dorian es el mayor y Léo es el pequeño.", "Dorian es el mayor y Léo el pequeño."] },
      { consigne: C, fr: "Blanca es la madre de Dorian. Dorian es ___ hijo. (son)", es: ["su"],
        expl: "« Son, sa, leur » se dit **su** (*sus* au pluriel), pour un garçon comme pour une fille." },
    ],
    dire: [
      { fr: "Mes enfants s'appellent Léo et Dorian.", es: "Mis hijos se llaman Léo y Dorian." },
      { fr: "Ton fils a quel âge ?", es: "¿Cuántos años tiene tu hijo?" },
      { fr: "Présente Léo et Dorian en 2 phrases.", es: "Léo es mi hijo y tiene cuatro años. Dorian es el hijo de Blanca y tiene siete años." },
    ],
  },
  "U4-L2": {
    ecrire: [
      { consigne: T, fr: "Dorian est très sympathique, mais un peu timide.", es: ["Dorian es muy simpático, pero un poco tímido."] },
      { consigne: C, fr: "Blanca es muy ___. (guapo)", es: ["guapa"], expl: "Au féminin, le **-o** devient **-a** : *guapo* → **guapa**." },
      { consigne: C, fr: "Los padres de Blanca son muy ___. (simpático)", es: ["simpáticos"],
        expl: "Au pluriel, on ajoute **-s** : *simpático* → **simpáticos** (un homme et une femme ensemble : masculin)." },
      { consigne: T, fr: "Comment est ton père ? Il est grand ?", es: ["¿Cómo es tu padre? ¿Es alto?"] },
    ],
    dire: [
      { fr: "Léo est petit, mais très fort.", es: "Léo es pequeño, pero muy fuerte." },
      { fr: "Blanca est grande et très belle.", es: "Blanca es alta y muy guapa." },
      { fr: "Le père de Blanca est un homme grand et sympathique.", es: "El padre de Blanca es un hombre alto y simpático." },
    ],
  },
  "U4-L3": {
    ecrire: [
      { consigne: T, fr: "Léo est fatigué parce qu'il dort peu.", es: ["Léo está cansado porque duerme poco."] },
      { consigne: C, fr: "Los niños están ___ porque es sábado. (contento)", es: ["contentos"],
        expl: "L'adjectif s'accorde aussi avec *estar* : *los niños* → **contentos**." },
      { consigne: C, fr: "Hoy Dorian ___ enfadado. (ser ou estar)", es: ["está"],
        expl: "*Estar* : comment il va aujourd'hui (un état du moment). *Ser* dirait comment il est toujours." },
      { consigne: T, fr: "Blanca est malade et un peu triste.", es: ["Blanca está enferma y un poco triste.", "Blanca está enferma y está un poco triste."] },
    ],
    dire: [
      { fr: "Comment tu vas, Dorian ? Tu es fâché ?", es: "¿Cómo estás, Dorian? ¿Estás enfadado?" },
      { fr: "Je suis nerveux quand je parle espagnol.", es: "Estoy nervioso cuando hablo español." },
      { fr: "Aujourd'hui, Léo est malade : il dort mal.", es: "Hoy Léo está enfermo: duerme mal." },
    ],
  },
  "U4-L4": {
    ecrire: [
      { consigne: T, fr: "Dorian doit faire ses devoirs avant de dîner.", es: ["Dorian tiene que hacer los deberes antes de cenar.", "Dorian tiene que hacer sus deberes antes de cenar."] },
      { consigne: C, fr: "Yo ___ que trabajar hoy. (tener)", es: ["tengo"], v: "tener", p: 0 },
      { consigne: T, fr: "Comment s'appelle le maître de Léo ?", es: ["¿Cómo se llama el profesor de Léo?"] },
      { consigne: C, fr: "Léo y Dorian ___ que ir al cole mañana. (tener)", es: ["tienen"], v: "tener", p: 5 },
    ],
    dire: [
      { fr: "Je dois aller chercher Léo à l'école à cinq heures.", es: "Tengo que ir a buscar a Léo al cole a las cinco." },
      { fr: "Comment ça s'est passé, l'école ?", es: "¿Qué tal el cole?" },
      { fr: "Dorian, tu as des devoirs aujourd'hui ?", es: "Dorian, ¿tienes deberes hoy?" },
    ],
  },
  "U4-L5": {
    ecrire: [
      { consigne: T, fr: "Le père de Blanca est le grand-père de Dorian.", es: ["El padre de Blanca es el abuelo de Dorian."] },
      { consigne: C, fr: "Es el coche ___ abuelo. (de)", es: ["del"], expl: "*de* + *el* = **del** : *el coche del abuelo*." },
      { consigne: C, fr: "Es la casa ___ hermana de Blanca. (de)", es: ["de la"], expl: "Avec *la*, rien ne change : **de la** hermana. Seul *de* + *el* devient *del*." },
      { consigne: T, fr: "Après le mariage, je suis le gendre du père de Blanca.", es: ["Después de la boda, soy el yerno del padre de Blanca."] },
    ],
    dire: [
      { fr: "Ma grande sœur a trois enfants : ce sont mes neveux.", es: "Mi hermana mayor tiene tres hijos: son mis sobrinos." },
      { fr: "Dorian est le petit-fils des parents de Blanca.", es: "Dorian es el nieto de los padres de Blanca." },
      { fr: "Comment s'appelle la tante de Dorian ?", es: "¿Cómo se llama la tía de Dorian?" },
    ],
  },
  "U4-L6": {
    ecrire: [
      { consigne: T, fr: "Nous vivons ensemble avec Léo et Dorian.", es: ["Vivimos juntos con Léo y Dorian."] },
      { consigne: T, fr: "L'après-midi, je m'occupe des enfants.", es: ["Por la tarde cuido de los niños.", "Por la tarde cuido a los niños."] },
      { consigne: C, fr: "¿Tus padres ___ separados? (ser ou estar)", es: ["están"], expl: "*Estar separados* : une situation, avec **estar**." },
      { consigne: C, fr: "Cariño, ¿___ hambre? (tener)", es: ["tienes"], v: "tener", p: 1 },
    ],
    dire: [
      { fr: "Blanca est ma fiancée et nous nous marions en juin.", es: "Blanca es mi novia y nos casamos en junio." },
      { fr: "Chérie, on dîne ensemble ?", es: "Cariño, ¿cenamos juntos?" },
      { fr: "Présente ta famille en 4 phrases : Blanca, Léo, Dorian, tes sœurs.", es: "Blanca es mi novia y vivimos juntos en Huesca. Léo es mi hijo y tiene cuatro años. Dorian es el hijo de Blanca y tiene siete años. Tengo tres hermanas." },
    ],
  },
  "U5-L1": {
    ecrire: [
      { consigne: T, fr: "Salut ! Ça va ? Ça fait longtemps !", es: ["¡Hola! ¿Qué tal? ¡Cuánto tiempo!"] },
      { consigne: C, fr: "Buenos días, señora. ¿Cómo ___ usted? (estar)", es: ["está"], v: "estar", p: 2,
        expl: "Avec *usted*, le verbe se conjugue comme avec *él, ella* : **está**." },
      { consigne: T, fr: "Bien, merci, et toi ?", es: ["Bien, gracias, ¿y tú?"] },
      { consigne: C, fr: "Señor, ¿usted ___ en el barrio? (vivir)", es: ["vive"], v: "vivir", p: 2,
        expl: "Avec *usted*, le verbe se conjugue comme avec *él, ella* : **vive**." },
    ],
    dire: [
      { fr: "Bonjour madame, comment allez-vous ?", es: "Buenos días, señora. ¿Cómo está usted?" },
      { fr: "Salut Dorian, comment ça va ?", es: "Hola, Dorian, ¿cómo estás?" },
      { fr: "Je vais bien, merci. Et vous ? (usted)", es: "Estoy bien, gracias. ¿Y usted?" },
    ],
  },
  "U5-L2": {
    ecrire: [
      { consigne: T, fr: "Aujourd'hui, il fait très froid à Huesca.", es: ["Hoy hace mucho frío en Huesca."] },
      { consigne: C, fr: "En julio hace ___ calor. (très)", es: ["mucho"], expl: "*Calor* est un nom : **mucho** calor. *Muy* va devant un adjectif (*muy cansado*)." },
      { consigne: T, fr: "Il pleut, alors on ne se promène pas.", es: ["Llueve, así que no paseamos.", "Hoy llueve, así que no paseamos."] },
      { consigne: C, fr: "Dorian es ___ simpático. (très)", es: ["muy"], expl: "*Simpático* est un adjectif : **muy** simpático. *Mucho* va devant un nom (*mucho frío*)." },
    ],
    dire: [
      { fr: "Il fait soleil, mais il fait froid.", es: "Hace sol, pero hace frío." },
      { fr: "S'il fait soleil, on se promène avec les enfants.", es: "Si hace sol, paseamos con los niños." },
      { fr: "À Huesca, il y a beaucoup de vent.", es: "En Huesca hace mucho viento." },
    ],
  },
  "U5-L3": {
    ecrire: [
      { consigne: T, fr: "Sérieux ? Super !", es: ["¿En serio? ¡Qué bien!"] },
      { consigne: T, fr: "Tu ne peux pas aller au mariage ? Dommage !", es: ["¿No puedes ir a la boda? ¡Qué pena!"] },
      { consigne: T, fr: "Quel froid !", es: ["¡Qué frío!"] },
      { consigne: T, fr: "Tu peux aller chercher Léo ? Bien sûr.", es: ["¿Puedes ir a buscar a Léo? Claro.", "¿Puedes ir a buscar a Léo? Por supuesto.", "¿Puedes ir a buscar a Léo? ¡Claro!"] },
    ],
    dire: [
      { fr: "Demain, je ne travaille pas. Génial !", es: "Mañana no trabajo. ¡Genial!" },
      { fr: "Zut, aujourd'hui il pleut.", es: "Vaya, hoy llueve." },
      { fr: "Dorian a sept ans ? Sérieux ? Qu'il est grand !", es: "¿Dorian tiene siete años? ¿En serio? ¡Qué mayor!" },
    ],
  },
  "U5-L4": {
    ecrire: [
      { consigne: T, fr: "Et vous ? Quand est-ce que vous rentrez de vacances ? (vosotros)", es: ["¿Y vosotros? ¿Cuándo volvéis de vacaciones?"] },
      { consigne: C, fr: "¿Dónde ___ vosotros? (vivir)", es: ["vivís"], v: "vivir", p: 4 },
      { consigne: T, fr: "Pourquoi tu apprends l'espagnol ?", es: ["¿Por qué aprendes español?", "¿Por qué aprendes el español?"] },
      { consigne: T, fr: "Quelqu'un parle français ?", es: ["¿Alguien habla francés?"] },
    ],
    dire: [
      { fr: "Quand est le mariage ? Le 19 juin.", es: "¿Cuándo es la boda? El diecinueve de junio." },
      { fr: "Combien d'enfants vous avez ? (vosotros)", es: "¿Cuántos hijos tenéis?" },
      { fr: "Pourquoi tu es fâché, Dorian ?", es: "¿Por qué estás enfadado, Dorian?" },
    ],
  },
  "U5-L5": {
    ecrire: [
      { consigne: T, fr: "Je suis très occupé, je travaille beaucoup (en ce moment).", es: ["Estoy muy ocupado, estoy trabajando mucho."] },
      { consigne: C, fr: "¿Qué ___ tú? (hacer, en ce moment)", es: ["estás haciendo"],
        expl: "Ce qu'on fait en ce moment : *estar* + le gérondif. *hacer* → hac + **iendo** : **estás haciendo**." },
      { consigne: T, fr: "Quel est ton programme pour le week-end ?", es: ["¿Qué plan tienes para el finde?", "¿Qué plan tienes para el fin de semana?"] },
      { consigne: C, fr: "Blanca ___ ahora. (cocinar, en ce moment)", es: ["está cocinando"],
        expl: "*estar* + le gérondif. Les verbes en -ar : cocin + **ando** : **está cocinando**." },
    ],
    dire: [
      { fr: "En ce moment, nous préparons les vacances.", es: "Estamos preparando las vacaciones." },
      { fr: "J'ai un problème avec l'ordinateur.", es: "Tengo un problema con el ordenador." },
      { fr: "Ce pont, on se repose à la maison.", es: "Este puente estamos descansando en casa." },
    ],
  },
  "U5-L6": {
    ecrire: [
      { consigne: T, fr: "Je dois y aller, je suis pressé. On se voit !", es: ["Me tengo que ir, que tengo prisa. ¡Nos vemos!", "Me tengo que ir, tengo prisa. ¡Nos vemos!", "Tengo que irme, que tengo prisa. ¡Nos vemos!", "Tengo que irme, tengo prisa. ¡Nos vemos!"] },
      { consigne: T, fr: "Bisous à ta famille.", es: ["Un beso a tu familia."] },
      { consigne: T, fr: "Pardon, je suis en retard. Ce n'est pas grave.", es: ["Perdona, llego tarde. No importa."] },
      { consigne: C, fr: "Perdona, ___ prisa. (tener, yo)", es: ["tengo"], v: "tener", p: 0 },
    ],
    dire: [
      { fr: "Bon, j'y vais. À plus tard !", es: "Bueno, me voy. ¡Hasta luego!" },
      { fr: "On se voit samedi !", es: "¡Nos vemos el sábado!" },
      { fr: "Joue une rencontre dans la rue : bonjour, la météo, une question, au revoir.", es: "¡Hola! ¿Qué tal? ¡Cuánto tiempo! Hoy hace mucho frío. ¿Y vosotros? ¿Cuándo volvéis de vacaciones? Bueno, me tengo que ir. ¡Nos vemos!" },
    ],
  },
  "U6-L1": {
    ecrire: [
      { consigne: T, fr: "J'aime beaucoup cuisiner, mais je n'aime pas nettoyer.", es: ["Me gusta mucho cocinar, pero no me gusta limpiar."] },
      { consigne: C, fr: "A Blanca ___ gusta Huesca. (à elle)", es: ["le"], expl: "« À elle, à lui » : **le** gusta. (me, te, **le**, nos, os, les)" },
      { consigne: C, fr: "A Léo y a Dorian les ___ los sábados. (encantar)", es: ["encantan"], expl: "*Los sábados* est au pluriel : **encantan**. Le verbe s'accorde avec ce qui plaît." },
      { consigne: T, fr: "Tu préfères déjeuner à la maison ou au restaurant ? Ça m'est égal.", es: ["¿Prefieres comer en casa o en el restaurante? Me da igual."] },
    ],
    dire: [
      { fr: "Je déteste me lever tôt.", es: "Odio levantarme temprano." },
      { fr: "Nous aimons beaucoup vivre à Huesca.", es: "Nos gusta mucho vivir en Huesca." },
      { fr: "Tu aimes cuisiner ?", es: "¿Te gusta cocinar?" },
    ],
  },
  "U6-L2": {
    ecrire: [
      { consigne: T, fr: "Tu me mets une petite bière et une eau, s'il te plaît ?", es: ["¿Me pones una caña y un agua, por favor?"] },
      { consigne: C, fr: "Yo ___ un vino. (pedir)", es: ["pido"], v: "pedir", d: "i", p: 0 },
      { consigne: T, fr: "L'addition, s'il vous plaît.", es: ["La cuenta, por favor."] },
      { consigne: C, fr: "Blanca ___ un agua. (pedir)", es: ["pide"], v: "pedir", d: "i", p: 2 },
    ],
    dire: [
      { fr: "Je voudrais une petite bière, s'il vous plaît.", es: "Quería una caña, por favor." },
      { fr: "Qu'est-ce que tu commandes ?", es: "¿Qué pides?" },
      { fr: "Nous commandons deux vins.", es: "Pedimos dos vinos." },
    ],
  },
  "U6-L3": {
    ecrire: [
      { consigne: T, fr: "Je mange beaucoup de viande et peu de poisson.", es: ["Como mucha carne y poco pescado."] },
      { consigne: T, fr: "Je veux de l'eau.", es: ["Quiero agua."] },
      { consigne: C, fr: "Léo come ___ fruta. (beaucoup de)", es: ["mucha"], expl: "*La fruta* est féminin : **mucha** fruta." },
      { consigne: T, fr: "Dorian ne mange pas de légumes.", es: ["Dorian no come verdura.", "Dorian no come verduras."] },
    ],
    dire: [
      { fr: "Nous mangeons des légumes chaque jour.", es: "Comemos verdura cada día." },
      { fr: "Tu aimes le poisson ?", es: "¿Te gusta el pescado?" },
      { fr: "Léo mange beaucoup de pain.", es: "Léo come mucho pan." },
    ],
  },
  "U6-L4": {
    ecrire: [
      { consigne: T, fr: "C'est très bon ! Mais je n'ai plus faim.", es: ["¡Está muy rico! Pero estoy lleno."] },
      { consigne: C, fr: "Este piso ___ demasiado caro. (ser ou estar)", es: ["es"], expl: "*Ser* : comment est la chose en général (le prix)." },
      { consigne: T, fr: "C'est trop épicé.", es: ["Es demasiado picante.", "Está demasiado picante."] },
      { consigne: C, fr: "¿Pruebas la carne? ___ muy rica. (ser ou estar)", es: ["está"], expl: "*Estar* : ce plat-là, maintenant, quand on le goûte : **está** rica." },
    ],
    dire: [
      { fr: "Le pain n'est pas cher.", es: "El pan es barato." },
      { fr: "Tu goûtes le poisson ? Il est très bon.", es: "¿Pruebas el pescado? Está muy rico." },
      { fr: "Non merci, je n'ai plus faim.", es: "No, gracias, estoy lleno." },
    ],
  },
  "U6-L5": {
    ecrire: [
      { consigne: T, fr: "Ça te dit qu'on se retrouve samedi en terrasse ?", es: ["¿Te apetece quedar el sábado en una terraza?"] },
      { consigne: T, fr: "Je n'aime pas le vin. Moi non plus.", es: ["No me gusta el vino. A mí tampoco."] },
      { consigne: C, fr: "¿Te ___ una caña? (apetecer)", es: ["apetece"], expl: "*Apetecer* comme *gustar* : *una caña*, au singulier → **apetece**." },
      { consigne: T, fr: "Le vendredi (tous les vendredis), nous sortons dîner.", es: ["Los viernes salimos a cenar."] },
    ],
    dire: [
      { fr: "Ce samedi, je retrouve des amis.", es: "Este sábado quedo con amigos." },
      { fr: "J'adore Huesca. Moi aussi !", es: "Me encanta Huesca. ¡A mí también!" },
      { fr: "Ça te dit d'aller au restaurant samedi ?", es: "¿Te apetece ir al restaurante el sábado?" },
    ],
  },
  "U6-L6": {
    ecrire: [
      { consigne: T, fr: "Blanca aime les séries, et moi, j'aime le sport.", es: ["A Blanca le gustan las series, y a mí me gusta el deporte."] },
      { consigne: C, fr: "Nos ___ mucho viajar. (gustar)", es: ["gusta"], expl: "Devant un verbe à l'infinitif : **gusta**, au singulier." },
      { consigne: T, fr: "Je lis un peu en espagnol chaque jour.", es: ["Leo un poco en español cada día."] },
      { consigne: C, fr: "A Dorian le ___ las películas. (encantar)", es: ["encantan"], expl: "*Las películas* est au pluriel : **encantan**." },
    ],
    dire: [
      { fr: "J'écoute de la musique quand je m'entraîne.", es: "Escucho música cuando entreno." },
      { fr: "On regarde un film ce soir ?", es: "¿Vemos una película esta noche?" },
      { fr: "Qu'est-ce que tu aimes faire le week-end ?", es: "¿Qué te gusta hacer el fin de semana?" },
    ],
  },
  "U7-L1": {
    ecrire: [
      { consigne: T, fr: "Dans le salon, il y a une grande table.", es: ["En el salón hay una mesa grande."] },
      { consigne: C, fr: "¿Dónde ___ el baño? (hay ou estar)", es: ["está"], expl: "Une chose connue (*el baño*) : où elle se trouve, **está**." },
      { consigne: C, fr: "En mi despacho ___ una silla. (hay ou estar)", es: ["hay"], expl: "Une chose nouvelle (*una silla*) : **hay**, il y a." },
      { consigne: T, fr: "Notre cuisine est très jolie.", es: ["Nuestra cocina es muy bonita."] },
    ],
    dire: [
      { fr: "Où est la salle de bain ?", es: "¿Dónde está el baño?" },
      { fr: "Dans la chambre, il y a deux chaises.", es: "En el dormitorio hay dos sillas." },
      { fr: "Nous avons un salon très joli.", es: "Tenemos un salón muy bonito." },
    ],
  },
  "U7-L2": {
    ecrire: [
      { consigne: T, fr: "Les clés sont sur la table.", es: ["Las llaves están encima de la mesa.", "Las llaves están en la mesa."] },
      { consigne: C, fr: "La silla está ___ ordenador. (devant l')", es: ["delante del"], expl: "*delante de* + *el* = **delante del**." },
      { consigne: T, fr: "La salle de bain est à côté de la chambre.", es: ["El baño está al lado del dormitorio."] },
      { consigne: C, fr: "El ordenador está ___ la mesa. (sur)", es: ["encima de"], expl: "« Sur, au-dessus de » : **encima de**." },
    ],
    dire: [
      { fr: "Le salon est entre la cuisine et la salle de bain.", es: "El salón está entre la cocina y el baño." },
      { fr: "Où est Léo ? Il est derrière la chaise.", es: "¿Dónde está Léo? Está detrás de la silla." },
      { fr: "Mon ordinateur est à côté de la chaise.", es: "Mi ordenador está al lado de la silla." },
    ],
  },
  "U7-L3": {
    ecrire: [
      { consigne: T, fr: "Je ne trouve pas les clés. Où sont-elles ?", es: ["No encuentro las llaves. ¿Dónde están?"] },
      { consigne: C, fr: "Blanca no ___ el ordenador. (encontrar)", es: ["encuentra"], v: "encontrar", d: "ue", p: 2 },
      { consigne: T, fr: "La salle de sport est près de la maison.", es: ["El gimnasio está cerca de casa.", "El gimnasio está cerca de la casa."] },
      { consigne: C, fr: "___ silla es de Léo. (cette, près de moi)", es: ["esta"], expl: "Près de moi : **este** (masculin), **esta** (féminin)." },
    ],
    dire: [
      { fr: "La France n'est pas loin de Huesca.", es: "Francia no está lejos de Huesca." },
      { fr: "La salle de bain est à droite.", es: "El baño está a la derecha." },
      { fr: "Les clés sont dans le cartable.", es: "Las llaves están dentro de la mochila." },
    ],
  },
  "U7-L4": {
    ecrire: [
      { consigne: T, fr: "Je mets la table et Dorian apporte les verres.", es: ["Yo pongo la mesa y Dorian trae los vasos.", "Pongo la mesa y Dorian trae los vasos."] },
      { consigne: C, fr: "Yo ___ la cena. (hacer)", es: ["hago"], v: "hacer", p: 0 },
      { consigne: T, fr: "Tu me donnes une cuillère ?", es: ["¿Me das una cuchara?"] },
      { consigne: C, fr: "Yo ___ el pan. (traer)", es: ["traigo"], v: "traer", p: 0 },
    ],
    dire: [
      { fr: "La fourchette est par terre.", es: "El tenedor está en el suelo." },
      { fr: "Un verre d'eau, s'il te plaît.", es: "Un vaso de agua, por favor." },
      { fr: "Je mets les assiettes sur la table.", es: "Pongo los platos en la mesa." },
    ],
  },
  "U7-L5": {
    ecrire: [
      { consigne: T, fr: "Je descends la poubelle et je reviens.", es: ["Bajo la basura y vuelvo."] },
      { consigne: C, fr: "¿Qué ___ el vecino? (decir)", es: ["dice"], v: "decir", p: 2 },
      { consigne: C, fr: "Yo ___ de casa a las ocho. (salir)", es: ["salgo"], v: "salir", p: 0 },
      { consigne: T, fr: "L'ascenseur ne marche pas.", es: ["El ascensor no funciona."] },
    ],
    dire: [
      { fr: "Je t'attends à l'entrée de l'immeuble.", es: "Te espero en el portal." },
      { fr: "Tu viens à la terrasse avec nous ?", es: "¿Vienes a la terraza con nosotros?" },
      { fr: "Mon beau-père vient dimanche.", es: "Mi suegro viene el domingo." },
    ],
  },
  "U7-L6": {
    ecrire: [
      { consigne: T, fr: "J'ai besoin de quelque chose pour la toux. Vous avez quelque chose ?", es: ["Necesito algo para la tos. ¿Tiene algo?"] },
      { consigne: C, fr: "¿Cuánto ___ el pan? (costar)", es: ["cuesta"], v: "costar", d: "ue", p: 2 },
      { consigne: T, fr: "Vous voulez un sac ? Non, merci.", es: ["¿Quiere bolsa? No, gracias.", "¿Quiere una bolsa? No, gracias."] },
      { consigne: C, fr: "Señora, ¿___ usted pan? (tener)", es: ["tiene"], v: "tener", p: 2,
        expl: "Avec *usted*, le verbe se conjugue comme avec *él, ella* : **tiene**." },
    ],
    dire: [
      { fr: "Il y a une pharmacie près d'ici ?", es: "¿Hay una farmacia cerca de aquí?" },
      { fr: "Aujourd'hui, je vais au supermarché avec Blanca.", es: "Hoy voy al supermercado con Blanca." },
      { fr: "Je n'ai aucun sac.", es: "No tengo ninguna bolsa." },
    ],
  },
  "U8-L1": {
    ecrire: [
      { consigne: T, fr: "Finis ton petit-déjeuner, Léo ! On est en retard.", es: ["¡Termina el desayuno, Léo! Llegamos tarde."] },
      { consigne: C, fr: "¡Dorian, ___ tu mochila! (llevar, impératif)", es: ["lleva"], v: "llevar", p: 2,
        expl: "L'impératif avec *tú* : la forme *él* du présent. *Dorian lleva* → **¡lleva!**" },
      { consigne: T, fr: "Dépêche-toi, Léo !", es: ["¡Date prisa, Léo!"] },
      { consigne: C, fr: "¡___, Léo! (comer, impératif)", es: ["come"], v: "comer", p: 2,
        expl: "L'impératif avec *tú* : la forme *él* du présent. *Léo come* → **¡come!**" },
    ],
    dire: [
      { fr: "Tu es prêt, Léo ? On est en retard.", es: "¿Estás listo, Léo? Llegamos tarde." },
      { fr: "Il fait froid : prends ton manteau, Dorian !", es: "Hace frío: ¡coge el abrigo, Dorian!" },
      { fr: "Vite, Léo ! Mange !", es: "¡Rápido, Léo! ¡Come!" },
    ],
  },
  "U8-L2": {
    ecrire: [
      { consigne: T, fr: "Viens ici, Léo ! Allez, on est en retard !", es: ["¡Ven aquí, Léo! ¡Vamos, que llegamos tarde!", "¡Ven aquí, Léo! ¡Vamos, llegamos tarde!"] },
      { consigne: C, fr: "¡___ los deberes, Dorian! (hacer, impératif)", es: ["haz"], expl: "Un des 8 impératifs irréguliers : *hacer* → **¡haz!**" },
      { consigne: T, fr: "Attention à la porte, Léo !", es: ["¡Cuidado con la puerta, Léo!"] },
      { consigne: C, fr: "¡___ los platos en la mesa! (poner, impératif)", es: ["pon"], expl: "Un des 8 impératifs irréguliers : *poner* → **¡pon!**" },
    ],
    dire: [
      { fr: "J'arrive !", es: "¡Ya voy!" },
      { fr: "Arrête, Dorian !", es: "¡Para, Dorian!" },
      { fr: "Allez Dorian, finis ton petit-déjeuner !", es: "¡Venga, Dorian, termina el desayuno!" },
    ],
  },
  "U8-L3": {
    ecrire: [
      { consigne: T, fr: "Lave-toi les mains et assieds-toi à table !", es: ["¡Lávate las manos y siéntate a la mesa!"] },
      { consigne: C, fr: "¡___ el abrigo, que hace frío! (ponerse, impératif)", es: ["ponte"], expl: "*Ponerse* : *pon* + **te** collé à la fin : **¡ponte!**" },
      { consigne: C, fr: "¡___ los zapatos, Dorian! (quitarse, impératif)", es: ["quítate"], expl: "*Quitarse* : *quita* + **te** collé à la fin, avec un accent : **¡quítate!**" },
      { consigne: T, fr: "Brosse-toi les dents, Léo !", es: ["¡Lávate los dientes, Léo!"] },
    ],
    dire: [
      { fr: "Lave-toi le visage, Léo.", es: "Lávate la cara, Léo." },
      { fr: "Mets le manteau rouge.", es: "Ponte el abrigo rojo." },
      { fr: "Tu mets les chaussures noires ?", es: "¿Te pones los zapatos negros?" },
    ],
  },
  "U8-L4": {
    ecrire: [
      { consigne: T, fr: "Mets ton pyjama, je te lis une histoire.", es: ["Ponte el pijama, que te leo un cuento.", "Ponte el pijama, te leo un cuento."] },
      { consigne: T, fr: "Ne cours pas !", es: ["¡No corras!"] },
      { consigne: T, fr: "Ne touche pas à ça !", es: ["¡No toques eso!"] },
      { consigne: T, fr: "Bonne nuit, Léo. J'éteins la lumière.", es: ["Buenas noches, Léo. Apago la luz."] },
    ],
    dire: [
      { fr: "Ne crie pas !", es: "¡No grites!" },
      { fr: "Ne fais pas ça !", es: "¡No hagas eso!" },
      { fr: "Au lit, Léo !", es: "¡A la cama, Léo!" },
    ],
  },
  "U8-L5": {
    ecrire: [
      { consigne: T, fr: "On joue au foot, Dorian ? Qu'est-ce que tu le fais bien !", es: ["¿Jugamos al fútbol, Dorian? ¡Qué bien lo haces!"] },
      { consigne: C, fr: "Léo ___ con Dorian en el salón. (jugar)", es: ["juega"], v: "jugar", p: 2 },
      { consigne: C, fr: "¡Siempre ___ tú, Dorian! (ganar)", es: ["ganas"], v: "ganar", p: 1 },
      { consigne: T, fr: "Ce n'est pas grave si tu perds, Léo.", es: ["No pasa nada si pierdes, Léo."] },
    ],
    dire: [
      { fr: "Très bien, Léo !", es: "¡Muy bien, Léo!" },
      { fr: "Ce n'est pas ma faute, papa !", es: "¡No es mi culpa, papá!" },
      { fr: "On joue à un jeu, Dorian ?", es: "¿Jugamos a un juego, Dorian?" },
    ],
  },
  "Noël-L1": {
    ecrire: [
      { consigne: T, fr: "Joyeuses fêtes ! Qu'est-ce que vous faites pour le réveillon ? (vosotros)", es: ["¡Felices fiestas! ¿Qué hacéis en Nochebuena?"] },
      { consigne: T, fr: "Où est-ce que tu passes Noël ?", es: ["¿Dónde pasas la Navidad?"] },
      { consigne: C, fr: "En Nochebuena ___ con la familia de Blanca. (cenar, nosotros)", es: ["cenamos"], v: "cenar", p: 3 },
      { consigne: T, fr: "J'ai un cadeau pour Léo.", es: ["Tengo un regalo para Léo."] },
    ],
    dire: [
      { fr: "Le 6 janvier, les Rois mages apportent des cadeaux aux enfants.", es: "El seis de enero los Reyes traen regalos a los niños." },
      { fr: "Joyeuses fêtes à tous !", es: "¡Felices fiestas a todos!" },
      { fr: "Le 24 décembre, nous dînons avec la famille de Blanca.", es: "El veinticuatro de diciembre cenamos con la familia de Blanca." },
    ],
  },
  "Noël-L2": {
    ecrire: [
      { consigne: T, fr: "Tout est très bon ! J'adore le touron.", es: ["¡Está todo muy rico! Me encanta el turrón.", "¡Todo está muy rico! Me encanta el turrón."] },
      { consigne: T, fr: "Trinquons à la famille !", es: ["¡Brindamos por la familia!", "¡Brindemos por la familia!"] },
      { consigne: C, fr: "Me ___ el cava. (gustar)", es: ["gusta"], expl: "*El cava*, au singulier : **gusta**." },
      { consigne: T, fr: "Le repas du réveillon est très long.", es: ["La cena de Nochebuena es muy larga."] },
    ],
    dire: [
      { fr: "Nous trinquons avec du cava.", es: "Brindamos con cava." },
      { fr: "J'appelle mes sœurs pour leur souhaiter les fêtes.", es: "Llamo a mis hermanas para felicitarlas." },
      { fr: "Le touron est très bon.", es: "El turrón está muy rico." },
    ],
  },
  "Noël-L3": {
    ecrire: [
      { consigne: T, fr: "Ravi de te connaître. Je t'aide à mettre la table ?", es: ["Encantado de conocerte. ¿Te ayudo a poner la mesa?"] },
      { consigne: T, fr: "Bon appétit !", es: ["¡Que aproveche!"] },
      { consigne: T, fr: "Santé, et joyeuses fêtes !", es: ["¡Salud y felices fiestas!"] },
      { consigne: C, fr: "¿Y vosotros? ¿Dónde ___? (vivir)", es: ["vivís"], v: "vivir", p: 4 },
    ],
    dire: [
      { fr: "Bonjour, je suis Kevin, le fiancé de Blanca. Ravi de te connaître.", es: "Hola, soy Kevin, el novio de Blanca. Encantado de conocerte." },
      { fr: "En Espagne, le temps à table après le repas est très long.", es: "En España la sobremesa es muy larga." },
      { fr: "Tu as des enfants ? Quel âge ont-ils ?", es: "¿Tienes hijos? ¿Cuántos años tienen?" },
    ],
  },
  // ── Unité 9 : le passé composé (t: "pc"). L'indice dit le temps : « (ir, passé composé) ». ──
  "U9-L1": {
    ecrire: [
      { consigne: T, fr: "Aujourd'hui, j'ai travaillé à la maison toute la journée.", es: ["Hoy he trabajado en casa todo el día.", "Hoy he trabajado desde casa todo el día."] },
      { consigne: C, fr: "Esta mañana ___ al gimnasio. (ir, passé composé)", es: ["he ido"], v: "ir", p: 0, t: "pc" },
      { consigne: T, fr: "Cet après-midi, Blanca a déjeuné avec sa sœur.", es: ["Esta tarde Blanca ha comido con su hermana."] },
      { consigne: C, fr: "Esta semana Léo y Dorian ___ un montón. (dormir, passé composé)", es: ["han dormido"], v: "dormir", d: "ue", p: 5, t: "pc" },
    ],
    dire: [
      { fr: "Qu'est-ce que tu as mangé aujourd'hui ?", es: "¿Qué has comido hoy?" },
      { fr: "Ce matin j'ai travaillé, et cet après-midi je suis allé à la salle.", es: "Esta mañana he trabajado y esta tarde he ido al gimnasio." },
      { fr: "Cette semaine, j'ai cuisiné un tas de fois.", es: "Esta semana he cocinado un montón." },
    ],
  },
  "U9-L2": {
    ecrire: [
      { consigne: T, fr: "Aujourd'hui, je n'ai pas envoyé de courriels.", es: ["Hoy no he enviado correos.", "Hoy no he enviado ningún correo."] },
      { consigne: C, fr: "Esta mañana ___ a las siete. (levantarse, passé composé)", es: ["me he levantado"], v: "levantarse", p: 0, t: "pc" },
      { consigne: T, fr: "Tu t'es douché ?", es: ["¿Te has duchado?"] },
      { consigne: C, fr: "Hoy mi ordenador no ___. (funcionar, passé composé)", es: ["ha funcionado"], v: "funcionar", p: 2, t: "pc",
        expl: "*No* se met avant *haber* : no **ha funcionado** (jamais entre *ha* et le participe)." },
    ],
    dire: [
      { fr: "Ça a été, ta journée ? Tu as beaucoup travaillé ?", es: "¿Qué tal el día? ¿Has trabajado mucho?" },
      { fr: "Ce matin, j'ai eu trois réunions et j'ai envoyé un tas de courriels.", es: "Esta mañana he tenido tres reuniones y he enviado un montón de correos." },
      { fr: "J'ai travaillé de la maison toute la journée et je ne suis pas sorti.", es: "He trabajado desde casa todo el día y no he salido." },
    ],
  },
  "U9-L3": {
    ecrire: [
      { consigne: T, fr: "J'ai lancé la machine et j'ai regardé les infos.", es: ["He puesto la lavadora y he visto las noticias."] },
      { consigne: C, fr: "¿Qué ___ hoy, Blanca? (hacer, passé composé)", es: ["has hecho"], v: "hacer", p: 1, t: "pc" },
      { consigne: T, fr: "Léo a regardé la télé tout l'après-midi.", es: ["Léo ha visto la tele toda la tarde."] },
      { consigne: C, fr: "Mis hermanas me ___ un correo. (escribir, passé composé)", es: ["han escrito"], v: "escribir", p: 5, t: "pc" },
    ],
    dire: [
      { fr: "Qu'est-ce que tu as fait aujourd'hui ?", es: "¿Qué has hecho hoy?" },
      { fr: "Dorian a dit qu'il n'a pas de devoirs.", es: "Dorian ha dicho que no tiene deberes." },
      { fr: "J'ai fait les courses et j'ai lancé la machine.", es: "He hecho la compra y he puesto la lavadora." },
    ],
  },
  "U9-L4": {
    ecrire: [
      { consigne: T, fr: "Je suis rentré de la salle et Léo a cassé un verre.", es: ["He vuelto del gimnasio y Léo ha roto un vaso."] },
      { consigne: C, fr: "Blanca ___ a casa a las seis. (volver, passé composé)", es: ["ha vuelto"], v: "volver", d: "ue", p: 2, t: "pc",
        expl: "*volver* a un participe irrégulier : **ha vuelto**. Il ne change jamais, même pour Blanca (pas « vuelta »)." },
      { consigne: T, fr: "Qui a ouvert la fenêtre ?", es: ["¿Quién ha abierto la ventana?"] },
      { consigne: C, fr: "Hoy yo ___ los platos. (fregar, passé composé)", es: ["he fregado"], v: "fregar", d: "ie", p: 0, t: "pc" },
    ],
    dire: [
      { fr: "Dorian a fermé la porte.", es: "Dorian ha cerrado la puerta." },
      { fr: "Léo a cassé une assiette !", es: "¡Léo ha roto un plato!" },
      { fr: "Les enfants sont rentrés à cinq heures.", es: "Los niños han vuelto a las cinco." },
    ],
  },
  "U9-L5": {
    ecrire: [
      { consigne: T, fr: "J'ai déjà fait les courses, mais je n'ai pas encore cuisiné.", es: ["Ya he hecho la compra, pero todavía no he cocinado.", "Ya he hecho la compra, pero aún no he cocinado."] },
      { consigne: C, fr: "___ llegar a casa. (je viens de)", es: ["Acabo de"], expl: "« Je viens de » + infinitif : **acabo de** (*acabar de*, au présent)." },
      { consigne: T, fr: "Dorian a oublié son sac à dos.", es: ["Dorian ha olvidado la mochila.", "Dorian ha olvidado su mochila.", "Dorian se ha olvidado la mochila."] },
      { consigne: C, fr: "Léo ___ no ha cenado. (pas encore)", es: ["todavía", "aún"], expl: "« Pas encore » : **todavía no** (ou **aún no**), avant *haber*." },
    ],
    dire: [
      { fr: "Tu as déjà mangé ? Non, pas encore.", es: "¿Ya has comido? No, todavía no." },
      { fr: "Je viens de rentrer de la salle.", es: "Acabo de volver del gimnasio." },
      { fr: "Enfin ! Léo et Dorian sont au lit.", es: "¡Por fin! Léo y Dorian ya están en la cama." },
    ],
  },
  // ── Unité 10 : l'école. a devant une personne, lo / la / los / las (le accepté pour un garçon : leísmo admis par la RAE). ──
  "U10-L1": {
    ecrire: [
      { consigne: T, fr: "Aujourd'hui, c'est moi qui récupère Léo à cinq heures.", es: ["Hoy recojo yo a Léo a las cinco.", "Hoy recojo a Léo a las cinco.", "Hoy yo recojo a Léo a las cinco."] },
      { consigne: C, fr: "Yo ___ a Dorian a la salida del cole. (recoger)", es: ["recojo"], v: "recoger", p: 0 },
      { consigne: T, fr: "Je vois la maîtresse de Léo dans la cour.", es: ["Veo a la tutora de Léo en el patio."] },
      { consigne: C, fr: "Blanca recoge ___ Léo y yo recojo la mochila. (a ?)", es: ["a"],
        expl: "Devant une personne, on met **a** : *recoge **a** Léo*. Pas devant une chose : *recojo la mochila*." },
    ],
    dire: [
      { fr: "On se voit à la sortie de l'école.", es: "Nos vemos a la salida del cole." },
      { fr: "Je suis à l'entrée de l'école.", es: "Estoy en la entrada del cole." },
      { fr: "Tu prends le sac de Dorian ?", es: "¿Coges tú la mochila de Dorian?" },
    ],
  },
  "U10-L2": {
    ecrire: [
      { consigne: T, fr: "Le sac de Léo ? C'est moi qui l'ai.", es: ["¿La mochila de Léo? La tengo yo."] },
      { consigne: C, fr: "¿Los zapatos? ___ llevo yo. (les)", es: ["Los"], expl: "*Los zapatos* (masculin pluriel) → **los**, avant le verbe." },
      { consigne: T, fr: "Aujourd'hui, Dorian a été sage.", es: ["Hoy Dorian se ha portado bien.", "Dorian se ha portado bien hoy."] },
      { consigne: C, fr: "¿El libro? Dorian ___ tiene. (le)", es: ["lo"], expl: "*El libro* (masculin) → **lo**, avant le verbe." },
    ],
    dire: [
      { fr: "Léo a pleuré aujourd'hui en classe ?", es: "¿Léo ha llorado hoy en clase?" },
      { fr: "Tu t'es disputé avec un camarade ?", es: "¿Te has peleado con un compañero?" },
      { fr: "La maîtresse ? Je la vois demain.", es: "¿La tutora? La veo mañana." },
    ],
  },
  "U10-L3": {
    ecrire: [
      { consigne: T, fr: "Le goûter de Dorian, je l'ai mis dans le sac.", es: ["La merienda de Dorian, la he puesto en la mochila.", "La merienda de Dorian la he puesto en la mochila."] },
      { consigne: C, fr: "¿El zumo? ___ he olvidado. (le)", es: ["Lo"], expl: "Avec le passé composé, **lo** se met avant *haber* : **lo** he olvidado." },
      { consigne: T, fr: "Les biscuits ? Je dois les acheter.", es: ["¿Las galletas? Tengo que comprarlas.", "¿Las galletas? Las tengo que comprar."] },
      { consigne: C, fr: "¿El bocadillo? Tengo que ___. (le faire)", es: ["hacerlo"], expl: "Avec un infinitif, **lo** se colle à la fin : *hacer* + *lo* = **hacerlo**." },
    ],
    dire: [
      { fr: "Qu'est-ce que tu as mangé à la cantine ?", es: "¿Qué has comido en el comedor?" },
      { fr: "Le jus, je l'ai mis dans le sac.", es: "El zumo lo he puesto en la mochila." },
      { fr: "Je le mets ici.", es: "Lo pongo aquí." },
    ],
  },
  "U10-L4": {
    ecrire: [
      { consigne: T, fr: "J'ai déjà signé l'autorisation : c'est Dorian qui l'a dans son cahier.", es: ["Ya he firmado la autorización: la tiene Dorian en la agenda.", "Ya he firmado la autorización: la tiene Dorian en su agenda."] },
      { consigne: C, fr: "¿La circular? ¡___, Blanca! (signe-la)", es: ["Fírmala"], expl: "À l'impératif, **la** se colle à la fin : *firma* + *la* = **fírmala**. Accent, car *firma* a 2 syllabes." },
      { consigne: T, fr: "Le livre ? Apporte-le, Dorian !", es: ["¿El libro? ¡Tráelo, Dorian!"] },
      { consigne: C, fr: "¿Los zapatos? ¡___ aquí, Léo! (mets-les)", es: ["Ponlos"], expl: "*pon* + *los* = **ponlos**. Pas d'accent, car *pon* n'a qu'une syllabe." },
    ],
    dire: [
      { fr: "Tu as lu la circulaire de l'école ?", es: "¿Has leído la circular del cole?" },
      { fr: "La maîtresse a écrit un mot dans le cahier.", es: "La tutora ha escrito una nota en la agenda." },
      { fr: "Le sac ? Prends-le !", es: "¿La mochila? ¡Cógela!" },
    ],
  },
  "U10-L5": {
    ecrire: [
      { consigne: T, fr: "À quelle heure est le rendez-vous avec la maîtresse jeudi prochain ?", es: ["¿A qué hora es la tutoría el jueves que viene?"] },
      { consigne: C, fr: "La excursión es la semana ___. (prochaine)", es: ["que viene"], expl: "« La semaine prochaine » : la semana **que viene**, après le mot." },
      { consigne: T, fr: "Le spectacle de Noël est le mois prochain.", es: ["La función de Navidad es el mes que viene."] },
      { consigne: C, fr: "¿___ a Dorian a una actividad? (on inscrit)", es: ["Apuntamos"], expl: "*apuntar* (inscrire), avec *nosotros* : **apuntamos**." },
    ],
    dire: [
      { fr: "Léo a besoin d'un déguisement pour vendredi prochain.", es: "Léo necesita un disfraz para el viernes que viene." },
      { fr: "La sortie scolaire, c'est quel jour ?", es: "¿Qué día es la excursión?" },
      { fr: "Qu'est-ce que les enfants doivent apporter ?", es: "¿Qué tienen que traer los niños?" },
    ],
  },
  "U10-L6": {
    ecrire: [
      { consigne: T, fr: "Léo parle français à la maison. Comment le trouves-tu en classe ?", es: ["Léo habla francés en casa. ¿Cómo lo ves en clase?", "Léo habla francés en casa. ¿Cómo le ves en clase?"] },
      { consigne: C, fr: "A Léo le ___ hablar en clase. (costar)", es: ["cuesta"], expl: "*Costar* (avoir du mal) se construit comme *gustar* : a Léo le **cuesta** hablar." },
      { consigne: T, fr: "Il a bien mangé aujourd'hui ?", es: ["¿Ha comido bien hoy?", "¿Hoy ha comido bien?"] },
      { consigne: C, fr: "¿Cómo ___ Léo a la clase? (adaptarse, passé composé)", es: ["se ha adaptado"], v: "adaptarse", p: 2, t: "pc" },
    ],
    dire: [
      { fr: "Est-ce que je dois m'inquiéter ?", es: "¿Tengo que preocuparme?" },
      { fr: "Léo a beaucoup progressé cette année.", es: "Léo ha mejorado mucho este año." },
      { fr: "Dorian a beaucoup grandi cette année.", es: "Dorian ha crecido mucho este año." },
    ],
  },
  // ── Unité 11 : chez le pédiatre. « pedir hora » accepté comme « pedir cita ». ──
  "U11-L1": {
    ecrire: [
      { consigne: T, fr: "Je voudrais prendre rendez-vous avec la pédiatre pour mon fils Léo.", es: ["Quería pedir cita con la pediatra para mi hijo Léo.", "Quería pedir una cita con la pediatra para mi hijo Léo.", "Quería pedir hora con la pediatra para mi hijo Léo."] },
      { consigne: C, fr: "Blanca ___ cita para Dorian. (pedir)", es: ["pide"], v: "pedir", d: "i", p: 2 },
      { consigne: T, fr: "Un rendez-vous pour demain, s'il vous plaît.", es: ["Una cita para mañana, por favor."] },
      { consigne: C, fr: "¿Tiene la ___ del niño? (carte de santé)", es: ["tarjeta sanitaria"], expl: "La carte de santé : **la tarjeta sanitaria**." },
    ],
    dire: [
      { fr: "Ce matin, j'ai appelé le centre de santé.", es: "Esta mañana he llamado al centro de salud." },
      { fr: "Léo a rendez-vous avec le médecin demain.", es: "Léo tiene cita con el médico mañana." },
      { fr: "Je voudrais un rendez-vous pour Dorian, pour lundi.", es: "Quería una cita para Dorian, para el lunes." },
    ],
  },
  "U11-L2": {
    ecrire: [
      { consigne: T, fr: "Léo a mal au ventre.", es: ["A Léo le duele la tripa.", "Léo tiene dolor de tripa."] },
      { consigne: C, fr: "Me ___ los oídos. (doler)", es: ["duelen"], expl: "*Doler* se construit comme *gustar* : avec un pluriel (*los oídos*), **duelen**. Le o devient ue." },
      { consigne: T, fr: "Où as-tu mal, Dorian ?", es: ["¿Dónde te duele, Dorian?"] },
      { consigne: C, fr: "A Dorian le ___ la garganta. (doler)", es: ["duele"], expl: "*Doler* se construit comme *gustar* : avec un singulier (*la garganta*), **duele**. Le o devient ue." },
    ],
    dire: [
      { fr: "J'ai mal à la tête.", es: "Me duele la cabeza." },
      { fr: "Tu as mal à l'œil, Léo ?", es: "¿Te duele el ojo, Léo?" },
      { fr: "Ouvre la bouche, Léo.", es: "Abre la boca, Léo." },
    ],
  },
  "U11-L3": {
    ecrire: [
      { consigne: T, fr: "Il a vomi deux fois cette nuit et il a de la fièvre.", es: ["Ha vomitado dos veces esta noche y tiene fiebre."] },
      { consigne: C, fr: "Léo tiene ___. (de la toux)", es: ["tos"], expl: "*Tener tos*, sans article (comme *tener fiebre, tener mocos*)." },
      { consigne: T, fr: "Aujourd'hui, Dorian a eu de la fièvre.", es: ["Hoy Dorian ha tenido fiebre.", "Dorian ha tenido fiebre hoy."] },
      { consigne: C, fr: "Esta noche Léo ___ dos veces. (vomitar, passé composé)", es: ["ha vomitado"], v: "vomitar", p: 2, t: "pc" },
    ],
    dire: [
      { fr: "Léo a le nez qui coule et il tousse beaucoup.", es: "Léo tiene mocos y mucha tos." },
      { fr: "Il a eu la diarrhée ?", es: "¿Ha tenido diarrea?" },
      { fr: "Cette nuit, Dorian a beaucoup toussé.", es: "Esta noche Dorian ha tenido mucha tos." },
    ],
  },
  "U11-L4": {
    ecrire: [
      { consigne: T, fr: "Il a de la fièvre depuis hier. Ce matin, il a eu trente-neuf.", es: ["Tiene fiebre desde ayer. Esta mañana ha tenido treinta y nueve."] },
      { consigne: C, fr: "Tiene tos ___ dos días. (depuis)", es: ["desde hace"], expl: "« Depuis » + une durée (*dos días*) : **desde hace**. + un moment (*ayer*) : *desde*." },
      { consigne: T, fr: "Depuis quand a-t-il de la fièvre ?", es: ["¿Desde cuándo tiene fiebre?"] },
      { consigne: C, fr: "Ha vomitado tres ___. (fois)", es: ["veces"], expl: "*Una vez, dos veces, tres veces*." },
    ],
    dire: [
      { fr: "Il a trente-huit et demi.", es: "Tiene treinta y ocho y medio." },
      { fr: "Combien de fois a-t-il vomi ?", es: "¿Cuántas veces ha vomitado?" },
      { fr: "La fièvre a baissé cet après-midi.", es: "La fiebre ha bajado esta tarde." },
    ],
  },
  "U11-L5": {
    ecrire: [
      { consigne: T, fr: "D'habitude il mange bien, mais aujourd'hui il n'a rien mangé, seulement un peu de riz.", es: ["Normalmente come bien, pero hoy no ha comido nada, solo un poco de arroz."] },
      { consigne: C, fr: "Normalmente Léo ___ a las nueve. (acostarse)", es: ["se acuesta"], v: "acostarse", d: "ue", p: 2 },
      { consigne: T, fr: "Aujourd'hui, il a bu beaucoup d'eau.", es: ["Hoy ha bebido mucha agua."] },
      { consigne: C, fr: "Hoy Dorian no ___ apetito. (tener, passé composé)", es: ["ha tenido"], v: "tener", p: 2, t: "pc" },
    ],
    dire: [
      { fr: "Le soir, il boit un verre de lait.", es: "Por la noche bebe un vaso de leche." },
      { fr: "Aujourd'hui, il a mangé un yaourt.", es: "Hoy ha comido un yogur. (ou : Hoy se ha comido un yogur.)" },
      { fr: "À quelle heure il dîne ? À huit heures.", es: "¿A qué hora cena? A las ocho." },
    ],
  },
  "U11-L6": {
    ecrire: [
      { consigne: T, fr: "Combien de fois par jour doit-il prendre le sirop ?", es: ["¿Cuántas veces al día tiene que tomar el jarabe?"] },
      { consigne: C, fr: "Tiene que tomar el antibiótico ___ cinco días. (pendant)", es: ["durante"], expl: "« Pendant » + une durée : **durante**." },
      { consigne: T, fr: "La pédiatre m'a donné une ordonnance.", es: ["La pediatra me ha dado una receta."] },
      { consigne: C, fr: "Tiene que tomar el jarabe ___ ocho horas. (toutes les)", es: ["cada"], expl: "« Toutes les huit heures » : **cada** ocho horas." },
    ],
    dire: [
      { fr: "Quelle est la dose pour un enfant de quatre ans ?", es: "¿Cuál es la dosis para un niño de cuatro años?" },
      { fr: "Avant ou après manger ?", es: "¿Antes o después de comer?" },
      { fr: "Il a des allergies ?", es: "¿Tiene alergias?" },
    ],
  },
  // ── Unité 12 : le passé simple (t: "ps"), seulement des verbes réguliers (les irréguliers arrivent en U13). ──
  "U12-L1": {
    ecrire: [
      { consigne: T, fr: "Hier, je me suis entraîné une heure et ensuite j'ai cuisiné pour tout le monde.", es: ["Ayer entrené una hora y luego cociné para todos."] },
      { consigne: C, fr: "Anoche Blanca ___ tarde. (cenar, passé simple)", es: ["cenó"], v: "cenar", p: 2, t: "ps" },
      { consigne: T, fr: "La semaine dernière, j'ai beaucoup travaillé.", es: ["La semana pasada trabajé mucho."] },
      { consigne: C, fr: "El sábado pasado nosotros ___ con los niños. (pasear, passé simple)", es: ["paseamos"], v: "pasear", p: 3, t: "ps" },
    ],
    dire: [
      { fr: "Avant-hier, Blanca a travaillé toute la journée.", es: "Anteayer Blanca trabajó todo el día." },
      { fr: "Samedi dernier, on a dîné chez mon beau-père.", es: "El sábado pasado cenamos en casa de mi suegro." },
      { fr: "Hier, je n'ai pas travaillé.", es: "Ayer no trabajé." },
    ],
  },
  "U12-L2": {
    ecrire: [
      { consigne: T, fr: "Samedi, les enfants ont couru dans le parc et sont montés sur le toboggan.", es: ["El sábado los niños corrieron por el parque y subieron al tobogán.", "El sábado los niños corrieron en el parque y subieron al tobogán.", "El sábado los niños corrieron por el parque y se subieron al tobogán."] },
      { consigne: C, fr: "Ayer Léo ___ mucho. (comer, passé simple)", es: ["comió"], v: "comer", p: 2, t: "ps" },
      { consigne: T, fr: "Hier soir, j'ai écrit à ma sœur.", es: ["Anoche escribí a mi hermana.", "Anoche le escribí a mi hermana."] },
      { consigne: C, fr: "El sábado pasado Dorian ___ al tobogán diez veces. (subir, passé simple)", es: ["subió"], v: "subir", p: 2, t: "ps" },
    ],
    dire: [
      { fr: "Qu'est-ce que tu as mangé samedi, Dorian ?", es: "¿Qué comiste el sábado, Dorian?" },
      { fr: "Léo est monté sur la balançoire.", es: "Léo subió al columpio. (ou : Léo se subió al columpio.)" },
      { fr: "Hier, on a bu beaucoup d'eau.", es: "Ayer bebimos mucha agua." },
    ],
  },
  "U12-L3": {
    ecrire: [
      { consigne: T, fr: "Aujourd'hui je suis allé à la salle, mais hier je ne me suis pas entraîné.", es: ["Hoy he ido al gimnasio, pero ayer no entrené."] },
      { consigne: C, fr: "Ayer ___ en casa todo el día. (trabajar, yo)", es: ["trabajé"], v: "trabajar", p: 0, t: "ps",
        expl: "*Ayer* : un temps fini, donc le passé simple : **trabajé**." },
      { consigne: T, fr: "Je suis arrivé à Huesca il y a cinq ans.", es: ["Llegué a Huesca hace cinco años."] },
      { consigne: C, fr: "Esta mañana ___ un correo a mi jefe. (enviar, yo)", es: ["he enviado"], v: "enviar", p: 0, t: "pc",
        expl: "*Esta mañana* : un temps pas encore fini (aujourd'hui), donc le passé composé : **he enviado**." },
    ],
    dire: [
      { fr: "Il y a un moment, j'ai mangé un yaourt.", es: "Hace un rato he comido un yogur." },
      { fr: "Ces derniers temps, j'ai beaucoup travaillé.", es: "Últimamente he trabajado mucho." },
      { fr: "Pour l'instant, je n'ai pas eu le temps.", es: "De momento no he tenido tiempo." },
    ],
  },
  "U12-L4": {
    ecrire: [
      { consigne: T, fr: "Vendredi, je suis rentré tard : on a pris un verre avec des amis, et ensuite on a dansé.", es: ["El viernes llegué tarde: tomamos algo con unos amigos y luego bailamos.", "El viernes llegué tarde: tomamos algo con unos amigos y después bailamos."] },
      { consigne: C, fr: "Anoche yo ___ la cena. (pagar, passé simple)", es: ["pagué"], v: "pagar", p: 0, t: "ps" },
      { consigne: T, fr: "J'ai cherché les clés toute la matinée.", es: ["Busqué las llaves toda la mañana."] },
      { consigne: C, fr: "Ayer yo ___ a trabajar a las ocho. (empezar, passé simple)", es: ["empecé"], v: "empezar", d: "ie", p: 0, t: "ps" },
    ],
    dire: [
      { fr: "Samedi dernier, j'ai joué avec Léo et Dorian.", es: "El sábado pasado jugué con Léo y Dorian." },
      { fr: "Qui t'a invité ?", es: "¿Quién te invitó?" },
      { fr: "Après le dîner, on a pris un verre.", es: "Después de cenar tomamos una copa." },
    ],
  },
  "U12-L5": {
    ecrire: [
      { consigne: T, fr: "Dimanche, Léo a beaucoup dormi et Dorian a joué au parc.", es: ["El domingo Léo durmió mucho y Dorian jugó en el parque."] },
      { consigne: C, fr: "En el restaurante, Blanca ___ pescado. (pedir, passé simple)", es: ["pidió"], v: "pedir", d: "i", p: 2, t: "ps" },
      { consigne: T, fr: "Les enfants ont dormi dix heures.", es: ["Los niños durmieron diez horas."] },
      { consigne: C, fr: "Ayer Léo ___ solo. (vestirse, passé simple)", es: ["se vistió"], v: "vestirse", d: "i", p: 2, t: "ps" },
    ],
    dire: [
      { fr: "Dimanche, on s'est promenés à la montagne.", es: "El domingo paseamos por la montaña." },
      { fr: "Tu as joué au padel dimanche ?", es: "¿Jugaste al pádel el domingo?" },
      { fr: "Les enfants ont joué dans la piscine.", es: "Los niños jugaron en la piscina." },
    ],
  },
  "U12-L6": {
    ecrire: [
      { consigne: T, fr: "Comment s'est passé le week-end ? — Très bien, on s'est super bien amusés.", es: ["¿Qué tal el finde? —Muy bien, lo pasamos genial.", "¿Qué tal el fin de semana? —Muy bien, lo pasamos genial."] },
      { consigne: C, fr: "El sábado yo ___ tarde. (levantarse, passé simple)", es: ["me levanté"], v: "levantarse", p: 0, t: "ps" },
      { consigne: T, fr: "Dimanche, on s'est couchés tôt.", es: ["El domingo nos acostamos temprano."] },
      { consigne: C, fr: "Anoche Dorian ___ a las diez. (acostarse, passé simple)", es: ["se acostó"], v: "acostarse", d: "ue", p: 2, t: "ps" },
    ],
    dire: [
      { fr: "Bof, un week-end ennuyeux.", es: "Regular, un finde aburrido." },
      { fr: "Samedi, on s'est bien amusés au parc.", es: "El sábado lo pasamos bien en el parque." },
      { fr: "Quel week-end amusant !", es: "¡Qué finde tan divertido!" },
    ],
  },
  // ── Unité 13 : les passés simples irréguliers (t: "ps"), seulement ceux déjà vus dans l'unité. ──
  "U13-L1": {
    ecrire: [
      { consigne: T, fr: "L'été dernier, on est allés à la plage et c'était génial.", es: ["El verano pasado fuimos a la playa y fue genial."] },
      { consigne: C, fr: "Anoche Blanca y yo ___ al cine. (ir, passé simple)", es: ["fuimos"], v: "ir", p: 3, t: "ps" },
      { consigne: T, fr: "Comment était l'hôtel ?", es: ["¿Cómo fue el hotel?", "¿Qué tal fue el hotel?"] },
      { consigne: C, fr: "El viaje ___ muy largo. (ser, passé simple)", es: ["fue"], v: "ser", p: 2, t: "ps" },
    ],
    dire: [
      { fr: "D'abord on est allés au parc, et ensuite à la maison.", es: "Primero fuimos al parque y luego a casa." },
      { fr: "Tu es allé au cinéma samedi ?", es: "¿Fuiste al cine el sábado?" },
      { fr: "Le voyage a été génial.", es: "El viaje fue genial." },
    ],
  },
  "U13-L2": {
    ecrire: [
      { consigne: T, fr: "On a eu un embouteillage et on est restés deux heures sur la route.", es: ["Tuvimos un atasco y estuvimos dos horas en la carretera."] },
      { consigne: C, fr: "Ayer yo ___ que trabajar hasta tarde. (tener, passé simple)", es: ["tuve"], v: "tener", p: 0, t: "ps" },
      { consigne: T, fr: "Le train a eu une heure de retard.", es: ["El tren tuvo una hora de retraso."] },
      { consigne: C, fr: "El sábado nosotros ___ en casa de mi suegro. (estar, passé simple)", es: ["estuvimos"], v: "estar", p: 3, t: "ps" },
    ],
    dire: [
      { fr: "Hier, j'ai été à la maison toute la journée.", es: "Ayer estuve en casa todo el día." },
      { fr: "Tu as eu un problème avec la voiture ?", es: "¿Tuviste un problema con el coche?" },
      { fr: "Blanca conduit et moi, je dors.", es: "Blanca conduce y yo duermo." },
    ],
  },
  "U13-L3": {
    ecrire: [
      { consigne: T, fr: "Tout à coup il y a eu une coupure de courant, et alors je n'ai pas pu finir le dîner.", es: ["De repente se fue la luz, y entonces no pude terminar la cena.", "De repente se fue la luz y entonces no pude terminar la cena."] },
      { consigne: C, fr: "Anoche yo ___ la cena. (hacer, passé simple)", es: ["hice"], v: "hacer", p: 0, t: "ps" },
      { consigne: T, fr: "Qu'est-ce qui s'est passé hier à l'école ?", es: ["¿Qué pasó ayer en el cole?"] },
      { consigne: C, fr: "Léo ___ en el patio. (caerse, passé simple)", es: ["se cayó"], v: "caerse", p: 2, t: "ps" },
    ],
    dire: [
      { fr: "Dorian a mis la table.", es: "Dorian puso la mesa." },
      { fr: "Je n'ai pas pu dormir.", es: "No pude dormir." },
      { fr: "Quelle frayeur !", es: "¡Qué susto!" },
    ],
  },
  "U13-L4": {
    ecrire: [
      { consigne: T, fr: "Le père de Blanca est venu manger et il m'a dit que mon espagnol était meilleur.", es: ["El padre de Blanca vino a comer y me dijo que mi español estaba mejor.", "El padre de Blanca vino a comer y me dijo que mi español está mejor."] },
      { consigne: C, fr: "Léo no ___ comer. (querer, passé simple)", es: ["quiso"], v: "querer", d: "ie", p: 2, t: "ps",
        expl: "*Querer* au passé simple : **quiso**. *No quiso* = il a refusé. *Querer* : quise, quisiste, quiso, quisimos, quisisteis, quisieron." },
      { consigne: T, fr: "La maîtresse m'a demandé des nouvelles de Léo.", es: ["La tutora me preguntó por Léo."] },
      { consigne: C, fr: "Los vecinos ___ a cenar. (venir, passé simple)", es: ["vinieron"], v: "venir", p: 5, t: "ps" },
    ],
    dire: [
      { fr: "Tu m'as dit la vérité ?", es: "¿Me dijiste la verdad?" },
      { fr: "C'est un mensonge !", es: "¡Es mentira!" },
      { fr: "Quelle belle surprise !", es: "¡Qué sorpresa tan bonita!" },
    ],
  },
  "U13-L5": {
    ecrire: [
      { consigne: T, fr: "Heureusement, à la fin, le voisin m'a rendu les clés et je l'ai remercié.", es: ["Por suerte, al final el vecino me devolvió las llaves y le di las gracias."] },
      { consigne: C, fr: "Ayer le ___ un libro a Dorian. (dar, passé simple, yo)", es: ["di"], v: "dar", p: 0, t: "ps" },
      { consigne: T, fr: "J'ai eu un embouteillage ; c'est pour ça que je suis arrivé en retard.", es: ["Tuve un atasco; por eso llegué tarde.", "Tuve un atasco, por eso llegué tarde."] },
      { consigne: C, fr: "___, fuimos al parque; luego, a casa. (d'abord)", es: ["Primero"], expl: "Pour raconter dans l'ordre : **primero** → luego → después → al final." },
    ],
    dire: [
      { fr: "Finalement, tout s'est bien passé.", es: "Al final todo salió bien." },
      { fr: "J'ai réessayé et ça a marché.", es: "Lo intenté de nuevo y funcionó." },
      { fr: "Heureusement, il ne s'est rien passé.", es: "Por suerte, no pasó nada." },
    ],
  },
  "U13-L6": {
    ecrire: [
      { consigne: T, fr: "Que c'est drôle ! D'abord Dorian s'est caché au supermarché, et à la fin on l'a retrouvé avec la voisine.", es: ["¡Qué gracioso! Primero Dorian se escondió en el súper, y al final lo encontramos con la vecina.", "¡Qué gracioso! Primero Dorian se escondió en el supermercado, y al final lo encontramos con la vecina.", "¡Qué gracioso! Primero Dorian se escondió en el súper y al final lo encontramos con la vecina."] },
      { consigne: C, fr: "Dorian ___ detrás de la puerta. (esconderse, passé simple)", es: ["se escondió"], v: "esconderse", p: 2, t: "ps" },
      { consigne: T, fr: "On a beaucoup ri avec les enfants.", es: ["Nos reímos mucho con los niños."] },
      { consigne: C, fr: "El sábado nosotros ___ a la playa. (ir, passé simple)", es: ["fuimos"], v: "ir", p: 3, t: "ps" },
    ],
    dire: [
      { fr: "Je te raconte une anecdote de l'école.", es: "Te cuento una anécdota del cole." },
      { fr: "Dorian nous a raconté une histoire très longue.", es: "Dorian nos contó una historia muy larga." },
      { fr: "L'histoire a été très drôle.", es: "La historia fue muy graciosa." },
    ],
  },
  // ── Unité 14 : l'imparfait (t: "imp"). Les vrais souvenirs de Kevin (Hyères, foot, console, Dragon Ball, grands-mères, le bras à 12 ans). ──
  "U14-L1": {
    ecrire: [
      { consigne: T, fr: "Petit, je jouais toujours au foot.", es: ["De pequeño siempre jugaba al fútbol.", "Cuando era pequeño, siempre jugaba al fútbol.", "De pequeño jugaba siempre al fútbol."] },
      { consigne: C, fr: "De pequeño, yo ___ a la consola con mis amigos. (jugar, imparfait)", es: ["jugaba"], v: "jugar", p: 0, t: "imp" },
      { consigne: T, fr: "Tu te souviens de ton enfance ?", es: ["¿Te acuerdas de tu infancia?"] },
      { consigne: C, fr: "De joven, ___ en París. (trabajar, imparfait, yo)", es: ["trabajaba"], v: "trabajar", p: 0, t: "imp" },
    ],
    dire: [
      { fr: "Quel est ton meilleur souvenir d'enfance ?", es: "¿Cuál es tu mejor recuerdo de pequeño?" },
      { fr: "Petit, je jouais toujours à la console.", es: "De pequeño siempre jugaba a la consola." },
      { fr: "Tu jouais dans la rue ?", es: "¿Jugabas en la calle?" },
    ],
  },
  "U14-L2": {
    ecrire: [
      { consigne: T, fr: "J'habitais à Hyères et je mangeais à la maison.", es: ["Vivía en Hyères y comía en casa."] },
      { consigne: C, fr: "Mis abuelas ___ con nosotros. (vivir, imparfait)", es: ["vivían"], v: "vivir", p: 5, t: "imp" },
      { consigne: T, fr: "Comment s'appelait ta maîtresse ?", es: ["¿Cómo se llamaba tu maestra?"] },
      { consigne: C, fr: "De pequeño, yo ___ en casa a mediodía. (comer, imparfait)", es: ["comía"], v: "comer", p: 0, t: "imp" },
    ],
    dire: [
      { fr: "Tu mangeais à l'école ou à la maison ?", es: "¿Comías en la escuela o en casa?" },
      { fr: "Mes grands-mères vivaient avec nous.", es: "Mis abuelas vivían con nosotros." },
      { fr: "Tu avais des images à collectionner ?", es: "¿Tenías cromos?" },
    ],
  },
  "U14-L3": {
    ecrire: [
      { consigne: T, fr: "Quand j'étais petit, j'étais très timide.", es: ["Cuando era pequeño, era muy tímido.", "Cuando era pequeño era muy tímido.", "De pequeño era muy tímido."] },
      { consigne: C, fr: "De pequeño, yo ___ Dragon Ball. (ver, imparfait)", es: ["veía"], v: "ver", p: 0, t: "imp" },
      { consigne: T, fr: "Tu portais des lunettes ?", es: ["¿Llevabas gafas?"] },
      { consigne: C, fr: "De pequeño ___ a jugar al fútbol con mis amigos. (ir, imparfait, yo)", es: ["iba"], v: "ir", p: 0, t: "imp" },
    ],
    dire: [
      { fr: "Tu étais un enfant turbulent ?", es: "¿Eras un niño travieso?" },
      { fr: "Comment tu étais, petite ? (à Blanca)", es: "¿Cómo eras de pequeña?" },
      { fr: "Je regardais Dragon Ball tous les jours.", es: "Veía Dragon Ball todos los días." },
    ],
  },
  "U14-L4": {
    ecrire: [
      { consigne: T, fr: "À Hyères, il faisait toujours beau.", es: ["En Hyères siempre hacía buen tiempo.", "En Hyères hacía siempre buen tiempo."] },
      { consigne: C, fr: "En la escuela ___ un patio muy grande. (il y avait)", es: ["había"], expl: "« Il y avait » : **había** (l'imparfait de *hay*), pour décrire le décor." },
      { consigne: T, fr: "La maison était près de la plage ?", es: ["¿La casa estaba cerca de la playa?"] },
      { consigne: C, fr: "Ese día ___ frío. (hacer, imparfait)", es: ["hacía"], v: "hacer", p: 2, t: "imp", expl: "Le temps qu'il faisait, c'est le décor : l'imparfait, **hacía** frío." },
    ],
    dire: [
      { fr: "Il y avait un chien dans ta maison ?", es: "¿Había un perro en tu casa?" },
      { fr: "Il y avait un grand arbre dans le jardin ?", es: "¿Había un árbol grande en el jardín?" },
      { fr: "Il faisait chaud et on était à la campagne.", es: "Hacía calor y estábamos en el campo." },
    ],
  },
  "U14-L5": {
    ecrire: [
      { consigne: T, fr: "Pendant que je jouais dans la rue, je suis tombé.", es: ["Mientras jugaba en la calle, me caí.", "Mientras jugaba en la calle me caí."] },
      { consigne: C, fr: "Cuando tenía doce años, me ___ daño en el brazo. (hacerse, passé simple)", es: ["hice"], sens: "el brazo = le bras",
        expl: "L'action qui arrive (une fois) : le passé simple, me **hice** daño. Le décor (*tenía doce años*) : l'imparfait." },
      { consigne: T, fr: "Il faisait beau et nous jouions dans le jardin.", es: ["Hacía buen tiempo y jugábamos en el jardín."] },
      { consigne: C, fr: "Mientras Léo ___, Dorian vio la tele. (dormir, imparfait)", es: ["dormía"], v: "dormir", d: "ue", p: 2, t: "imp",
        expl: "*Mientras* + l'imparfait : ce qui durait, **dormía**." },
    ],
    dire: [
      { fr: "Comment c'est arrivé ?", es: "¿Cómo ocurrió?" },
      { fr: "Tu es allé à l'hôpital ?", es: "¿Fuiste al hospital?" },
      { fr: "J'avais douze ans et je me suis fait mal au bras.", es: "Tenía doce años y me hice daño en el brazo." },
    ],
  },
  "U14-L6": {
    ecrire: [
      { consigne: T, fr: "Avant je vivais en France ; maintenant je vis à Huesca et je m'y suis déjà habitué.", es: ["Antes vivía en Francia; ahora vivo en Huesca y ya me he acostumbrado.", "Antes vivía en Francia, ahora vivo en Huesca y ya me he acostumbrado."] },
      { consigne: C, fr: "___ ir al gimnasio. (j'ai l'habitude de)", es: ["Suelo"], expl: "« J'ai l'habitude de » : **suelo** + infinitif (*soler* : o → ue, comme *poder*)." },
      { consigne: T, fr: "Ma famille me manque.", es: ["Echo de menos a mi familia."] },
      { consigne: C, fr: "Antes ___ en París; ahora vivo en Huesca. (vivir, imparfait, yo)", es: ["vivía"], v: "vivir", p: 0, t: "imp" },
    ],
    dire: [
      { fr: "Ici, tout est moins cher.", es: "Aquí todo es más barato." },
      { fr: "À Huesca, c'est facile de sortir prendre un verre.", es: "En Huesca es fácil salir a tomar algo." },
      { fr: "Avant je ne parlais pas espagnol ; maintenant je le parle un peu.", es: "Antes no hablaba español; ahora lo hablo un poco." },
    ],
  },
};
