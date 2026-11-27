# « Remplis mes erreurs » : remplir la réserve de « Mes erreurs »

Quand Kevin dit « remplis mes erreurs » (environ une fois par semaine, ou après que le prof a réorganisé le carnet),
une session Claude Code suit ces étapes. Décidé le 27 nov. (APPLI.md, point 8 quindecies, Q11-13 à Q11-18).

## 1. Lire le carnet

- Lire le Google Doc « Espagnol – Carnet de suivi » (id `1O4NmpsYuUI5BbBkOqrypKecP_wp9s2J23qGSutxFMHE`) avec l'outil
  Google Drive `read_file_content`. **Lecture seule : ne jamais modifier le carnet.**
- Copier le tableau de la section « 2. Mes erreurs fréquentes » (les lignes qui commencent par `|`) dans un fichier
  du dossier de travail temporaire, par exemple `carnet.md`.
- Lancer, depuis `appli/` :

  ```
  node outils/test-erreurs-phrases.mjs --carnet <chemin>/carnet.md
  ```

  Pour chaque carte, il affiche sa clé, son morceau piège et le nombre de phrases déjà en réserve.
  Une flèche `→` marque les cartes qui ont moins de 4 phrases. Il liste aussi les clés de la réserve
  qui ne sont plus dans le carnet (lignes coupées ou supprimées par le prof) : on les retire.

## 2. Écrire les phrases manquantes, dans `appli/erreurs-phrases.js`

Pour chaque carte marquée `→` (sauf « aucun piège » : elle reste une carte « Corrige ») : environ 4 phrases.

- **La clé** : exactement celle affichée par la commande (`"e:blanca está en huesca"`).
- **`fr`** : une phrase française simple, qu'on traduit naturellement avec le piège. Niveau A1, courte.
- **`es`** : la phrase modèle, juste, en espagnol d'Espagne.
- **`piege`** : le morceau que l'appli vérifie. Il doit se trouver tel quel dans `es`, et n'avoir **qu'une seule bonne
  écriture** : seulement le piège lui-même (« desde hace », pas « desde hace diez », car « desde hace 10 » serait juste aussi ;
  « está en », pas « está en casa »). Pas de chiffre, pas de prénom. Le piège proposé par la commande est un bon départ ;
  on peut le changer pour une phrase précise (« están en » pour un sujet pluriel).
- **`apres`** : la leçon à partir de laquelle tous les mots de la phrase sont vus. En général, la leçon en cours ou
  une leçon déjà faite (voir « Leçon en cours » dans la fiche du carnet).
- **Le contenu** : la vraie vie de Kevin (Huesca, Blanca, Léo, Dorian, le télétravail, sa vraie famille : voir la mémoire),
  jamais de famille inventée. Seulement la grammaire déjà vue. On peut reprendre une bonne phrase des exercices
  (`exercices.js`) si elle teste vraiment le piège.
- Varier les phrases : sujets, lieux et tournures différents, pour qu'on ne puisse pas apprendre la réponse par cœur.

## 3. Vérifier

```
node outils/test-erreurs-phrases.mjs
node outils/test-carnet.mjs
```

Le premier vérifie chaque phrase (piège présent, une seule écriture, mots vus à la leçon `apres` d'après le Sheet).
Corriger jusqu'à « tout est bon ».

## 4. Montrer, puis publier

- Montrer à Kevin la liste des phrases ajoutées (français → espagnol, piège en gras), carte par carte.
- Publier seulement quand Kevin dit « publie » : prendre le prochain numéro de version libre (`git log`),
  le passer partout (`?v=N`), commiter seulement ses propres fichiers.
