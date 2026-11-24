// Les jeux à deux de la Feria (La Bomba, En la frente) : les 8 thèmes à mots et les gages.
// Écrits exprès, hors du livre (le livre n'a presque pas d'animaux, ni de mots d'Halloween) : espagnol d'Espagne,
// simples, faciles à mimer ou à expliquer. Chaque mot : [espagnol, français, émoji s'il en existe un d'évident].
// À faire relire par Blanca. Pour corriger un mot, il suffit de le changer ici.

const T = (nom, fr, ico, liste) => ({ nom, fr, ico, mots: liste.map(([es, f, e = ""]) => ({ es, fr: f, e })) });
export const THEMES = {
  animales: T("Los animales", "les animaux", "🐶", [["el perro","le chien","🐶"],["el gato","le chat","🐱"],["la vaca","la vache","🐮"],["el caballo","le cheval","🐴"],["el cerdo","le cochon","🐷"],["la oveja","le mouton","🐑"],["la gallina","la poule","🐔"],["el pato","le canard","🦆"],["el conejo","le lapin","🐰"],["el ratón","la souris","🐭"],["el león","le lion","🦁"],["el tigre","le tigre","🐯"],["el elefante","l'éléphant","🐘"],["la jirafa","la girafe","🦒"],["el mono","le singe","🐒"],["el oso","l'ours","🐻"],["el lobo","le loup","🐺"],["el zorro","le renard","🦊"],["la serpiente","le serpent","🐍"],["el pez","le poisson","🐟"],["el tiburón","le requin","🦈"],["la tortuga","la tortue","🐢"],["la rana","la grenouille","🐸"],["el pájaro","l'oiseau","🐦"],["la mariposa","le papillon","🦋"]]),
  navidad: T("Navidad", "Noël", "🎄", [["el árbol de Navidad","le sapin de Noël","🎄"],["el regalo","le cadeau","🎁"],["Papá Noel","le Père Noël","🎅"],["los Reyes Magos","les Rois mages","👑"],["la estrella","l'étoile","⭐"],["la nieve","la neige","❄️"],["el muñeco de nieve","le bonhomme de neige","⛄"],["el reno","le renne","🦌"],["el trineo","le traîneau","🛷"],["la campana","la cloche","🔔"],["la vela","la bougie","🕯️"],["el calcetín","la chaussette","🧦"],["la galleta","le biscuit","🍪"],["el ángel","l'ange","👼"],["el villancico","le chant de Noël","🎶"],["las uvas","les raisins (du 31)","🍇"],["el turrón","le turrón (nougat)"],["el roscón de Reyes","la galette des Rois espagnole"],["el belén","la crèche"],["la chimenea","la cheminée","🔥"],["la bufanda","l'écharpe","🧣"],["el cava","le cava","🥂"]]),
  halloween: T("Halloween", "Halloween", "🎃", [["la bruja","la sorcière","🧙‍♀️"],["el fantasma","le fantôme","👻"],["la calabaza","la citrouille","🎃"],["la araña","l'araignée","🕷️"],["la telaraña","la toile d'araignée","🕸️"],["el murciélago","la chauve-souris","🦇"],["el esqueleto","le squelette","💀"],["el vampiro","le vampire","🧛"],["el zombi","le zombie","🧟"],["el monstruo","le monstre","👹"],["la escoba","le balai","🧹"],["el gato negro","le chat noir","🐈‍⬛"],["el caramelo","le bonbon","🍬"],["la piruleta","la sucette","🍭"],["la luna","la lune","🌕"],["el búho","le hibou","🦉"],["el disfraz","le déguisement","🎭"],["el castillo","le château","🏰"],["la tumba","la tombe","🪦"],["el miedo","la peur","😱"],["¿Truco o trato?","Des bonbons ou un sort ?"]]),
  juguetes: T("Los juguetes", "les jouets", "🧸", [["la pelota","le ballon","⚽"],["el oso de peluche","l'ours en peluche","🧸"],["la muñeca","la poupée"],["el coche de juguete","la petite voiture","🚗"],["el tren","le train","🚂"],["el avión","l'avion","✈️"],["el barco","le bateau","⛵"],["la bici","le vélo","🚲"],["el patinete","la trottinette","🛴"],["la cometa","le cerf-volant","🪁"],["el globo","le ballon de baudruche","🎈"],["el puzle","le puzzle","🧩"],["los dados","les dés","🎲"],["los bloques","les cubes","🧱"],["el robot","le robot","🤖"],["el dinosaurio","le dinosaure","🦖"],["la consola","la console","🎮"],["el libro","le livre","📚"],["las ceras","les crayons de couleur","🖍️"],["el tambor","le tambour","🥁"],["la guitarra","la guitare","🎸"],["el cubo y la pala","le seau et la pelle","🪣"]]),
  comida: T("La comida", "la nourriture", "🍎", [["el pan","le pain","🍞"],["el queso","le fromage","🧀"],["el huevo","l'œuf","🥚"],["la leche","le lait","🥛"],["la manzana","la pomme","🍎"],["el plátano","la banane","🍌"],["la naranja","l'orange","🍊"],["la fresa","la fraise","🍓"],["la sandía","la pastèque","🍉"],["el tomate","la tomate","🍅"],["la zanahoria","la carotte","🥕"],["la patata","la pomme de terre","🥔"],["el pollo","le poulet","🍗"],["el pescado","le poisson (à manger)","🐟"],["el arroz","le riz","🍚"],["la pasta","les pâtes","🍝"],["la pizza","la pizza","🍕"],["la hamburguesa","le hamburger","🍔"],["el helado","la glace","🍦"],["el chocolate","le chocolat","🍫"],["la tarta","le gâteau","🎂"],["el zumo","le jus","🧃"],["el agua","l'eau","💧"],["el bocadillo","le sandwich","🥖"]]),
  cuerpo: T("El cuerpo", "le corps", "✋", [["la cabeza","la tête"],["el pelo","les cheveux","💇"],["la cara","le visage","🙂"],["el ojo","l'œil","👁️"],["la nariz","le nez","👃"],["la boca","la bouche","👄"],["la oreja","l'oreille","👂"],["el diente","la dent","🦷"],["la lengua","la langue","👅"],["el cuello","le cou"],["el hombro","l'épaule"],["el brazo","le bras","💪"],["la mano","la main","✋"],["el dedo","le doigt","👆"],["la uña","l'ongle","💅"],["la barriga","le ventre"],["la espalda","le dos"],["la pierna","la jambe","🦵"],["la rodilla","le genou"],["el pie","le pied","🦶"],["el corazón","le cœur","❤️"],["las cosquillas","les chatouilles","🤭"]]),
  ropa: T("La ropa", "les vêtements", "👕", [["la camiseta","le tee-shirt","👕"],["el pantalón","le pantalon","👖"],["el vestido","la robe","👗"],["la falda","la jupe"],["el abrigo","le manteau","🧥"],["la bufanda","l'écharpe","🧣"],["los guantes","les gants","🧤"],["el gorro","le bonnet"],["la gorra","la casquette","🧢"],["el sombrero","le chapeau","👒"],["los zapatos","les chaussures","👞"],["las zapatillas","les baskets","👟"],["las botas","les bottes","🥾"],["los calcetines","les chaussettes","🧦"],["el pijama","le pyjama"],["las gafas","les lunettes","👓"],["el bañador","le maillot de bain","🩱"],["las chanclas","les tongs","🩴"],["la mochila","le sac à dos","🎒"],["el cinturón","la ceinture"],["el jersey","le pull"]]),
  parque: T("En el parque", "au parc", "🌳", [["el columpio","la balançoire"],["el tobogán","le toboggan"],["el banco","le banc"],["el árbol","l'arbre","🌳"],["la flor","la fleur","🌸"],["la hierba","l'herbe","🌿"],["la hoja","la feuille","🍃"],["la fuente","la fontaine","⛲"],["el arenero","le bac à sable"],["la paloma","le pigeon","🕊️"],["la ardilla","l'écureuil","🐿️"],["la mariquita","la coccinelle","🐞"],["el sol","le soleil","☀️"],["la nube","le nuage","☁️"],["la lluvia","la pluie","🌧️"],["el charco","la flaque"],["correr","courir","🏃"],["saltar","sauter"],["esconderse","se cacher","🙈"],["jugar","jouer"],["la pelota","le ballon","⚽"],["el helado","la glace","🍦"]]),
};

// Les gages de La Bomba : communs, puis pour jouer avec Blanca (en couple), puis avec Dorian (enfant).
// {autre} = le joueur qui n'a pas perdu : c'est à lui que le perdant fait son gage.
export const GAGES = {
  tous: [
    "Dis 3 mots de la cuisine, en espagnol.", "Fais une phrase en espagnol avec le mot « mañana ».", "Chante une phrase d'une chanson en espagnol.",
    "Compte jusqu'à 10 en espagnol, le plus vite possible.", "Fais deviner un animal en le mimant, sans un bruit.",
    "Dis ta dernière phrase avec la voix d'un serveur très pressé : « ¿Qué os pongo? »", "Raconte ta journée en 3 phrases, en espagnol.",
  ],
  Blanca: [
    "Fais un compliment en espagnol à {autre}, les yeux dans les yeux.", "Nomme 3 choses que tu aimes chez {autre}, en espagnol.",
    "Demande à {autre} de danser, en espagnol, comme dans un film.", "Dis « te quiero » de 3 façons différentes : chuchoté, en criant, en chantant.",
  ],
  Dorian: [
    "Fais le bruit de 3 animaux et dis leur nom en espagnol.", "Marche comme un robot en disant « soy un robot ».",
    "Dis bonjour à {autre} comme à un roi d'Espagne.", "Saute 5 fois en comptant en espagnol.",
  ],
};

// La Caseta de tiro : les pièges de l'oreille. Des paires de mots qui sonnent presque pareil (prononciation d'Espagne).
// Chaque paire : [mot, sens, son jumeau, sens, ce qui les distingue]. Jamais de paires qui sonnent exactement pareil
// (hola / ola, vaca / baca, b et v, ll et y) : à l'oreille, on ne peut pas les distinguer. À faire relire par Blanca.
export const PIEGES = [
  ["pero", "mais", "perro", "le chien", "r ou rr"], ["caro", "cher", "carro", "le chariot", "r ou rr"], ["cero", "zéro", "cerro", "la colline", "r ou rr"],
  ["pera", "la poire", "perra", "la chienne", "r ou rr"], ["coro", "le chœur", "corro", "la ronde", "r ou rr"],
  ["papa", "la pomme de terre", "papá", "papa", "l'accent"], ["hablo", "je parle", "habló", "il a parlé", "l'accent"], ["esta", "cette", "está", "il est", "l'accent"],
  ["tomo", "je prends", "tomó", "il a pris", "l'accent"], ["llego", "j'arrive", "llegó", "il est arrivé", "l'accent"], ["paso", "je passe", "pasó", "il est passé", "l'accent"],
  ["mesa", "la table", "misa", "la messe", "une voyelle"], ["peso", "le poids", "piso", "l'appartement", "une voyelle"], ["pelo", "les cheveux", "palo", "le bâton", "une voyelle"],
  ["mano", "la main", "mono", "le singe", "une voyelle"], ["sopa", "la soupe", "sapo", "le crapaud", "une voyelle"], ["lado", "le côté", "lodo", "la boue", "une voyelle"],
  ["casa", "la maison", "caza", "la chasse", "s ou z"], ["coser", "coudre", "cocer", "cuire", "s ou z"], ["sien", "la tempe", "cien", "cent", "s ou z"],
  ["seta", "le champignon", "zeta", "la lettre z", "s ou z"], ["masa", "la pâte", "maza", "la massue", "s ou z"],
  ["pena", "la peine", "peña", "le rocher", "n ou ñ"], ["cana", "le cheveu blanc", "caña", "le demi (de bière)", "n ou ñ"], ["una", "une", "uña", "l'ongle", "n ou ñ"],
  ["gato", "le chat", "pato", "le canard", "une consonne"], ["boca", "la bouche", "foca", "le phoque", "une consonne"], ["vaso", "le verre", "paso", "le pas", "une consonne"],
];
