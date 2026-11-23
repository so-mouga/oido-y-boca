// Les exercices écrits à l'avance, une leçon à la fois (générés dans Claude Code à partir du livre et du tableau).
// Ils n'utilisent que les mots et la grammaire déjà vus. Les cartes, elles, viennent des 5 mots du tableau.
//
// ecrire : { consigne, fr, es: [réponses acceptées] }   → tu tapes la réponse, l'appli vérifie.
//          + v, p pour un verbe à conjuguer (p : 0 = yo … 5 = ellos) : l'explication se calcule toute seule.
//            + d ("ue", "ie" ou "i") pour un verbe qui change de voyelle (dormir, empezar, vestirse).
//            ⚠ Jamais de v sur un irrégulier que controles.js ne connaît pas (IRREGULIERS).
//          + expl (facultatif) : l'explication écrite, quand la règle de la leçon n'aide pas pour cette phrase.
// dire   : { fr, es }                                    → tu la dis à voix haute, tu compares, tu te notes.
//
// Unités prêtes : 1 à 8, et Noël. Les suivantes s'ajoutent au fil des leçons.

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
      { fr: "Les parents de Blanca habitent dans un village.", es: "Los padres de Blanca viven en un pueblo." },
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
      { consigne: C, fr: "Nosotros ___ con mis suegros el domingo. (comer)", es: ["comemos"], v: "comer", p: 3 },
      { consigne: T, fr: "Tu as des frères et sœurs ?", es: ["¿Tienes hermanos?"] },
      { consigne: T, fr: "Blanca est ma compagne.", es: ["Blanca es mi pareja."] },
      { consigne: C, fr: "Mis suegros ___ en Huesca hoy. (estar)", es: ["están"], v: "estar", p: 5 },
    ],
    dire: [
      { fr: "Blanca est ma compagne. Nous nous marions en juin.", es: "Blanca es mi pareja. Nos casamos en junio." },
      { fr: "Tes cousins viennent au mariage ?", es: "¿Vienen tus primos a la boda?" },
      { fr: "Ce dimanche, nous mangeons avec mes beaux-parents.", es: "Este domingo comemos con mis suegros." },
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
      { consigne: T, fr: "Tu préfères déjeuner à la maison ou au village ? Ça m'est égal.", es: ["¿Prefieres comer en casa o en el pueblo? Me da igual."] },
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
      { fr: "Mes beaux-parents viennent dimanche.", es: "Mis suegros vienen el domingo." },
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
};
