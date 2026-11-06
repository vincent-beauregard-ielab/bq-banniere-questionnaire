// Contenu de la ronde 1.
//
// type de question :
//   "classement" (par défaut) : options à classer de 1 au dernier rang, case « à éviter » sous chacune
//   "choix"                   : un seul choix, case « à éviter » sous chaque option
//   "grille"                  : des éléments à trier (indispensable, bienvenu, inutile)
//                               et une action suivante à choisir
//
// Chaque option a un id stable (« miroir », « motif »…) : c'est le nom de sa colonne dans le Sheet.
// Les lettres A, B, C… affichées suivent la position à l'écran, qui est tirée au hasard pour chaque répondant.
//
// visuel.type (options) :
//   "texte"    accroche rédigée sur fond vert
//   "image"    vignette tirée de nos documents
//   "schema"   la bannière actuelle à côté d'un schéma de la nouvelle (blocs, sans style)
//   "maquette" mini-bannière en blocs gris (gabarit dans app.js)
//
// Les chiffres sont remplacés par « XX » : on choisit une forme, pas des valeurs.

window.QUESTIONS = [
  {
    id: "paire",
    titre: "La relation avec la bannière actuelle",
    consigne:
      "Au kiosque, les deux bannières sont montées côte à côte. Comment doivent-elles se répondre ? À droite, la nouvelle est un simple schéma en blocs : on regarde la relation, pas le style.",
    options: [
      { id: "miroir", nom: "Miroir", description: "Même structure que la bannière actuelle : logo en haut, image en bas, bande de logos. Le contenu change.", visuel: { type: "schema", gabarit: "miroir" } },
      { id: "contraste", nom: "Contraste", description: "Même structure que l'actuelle, couleurs inversées : la nouvelle est foncée là où l'actuelle est claire.", visuel: { type: "schema", gabarit: "contraste" } },
      { id: "continuite", nom: "Continuité", description: "Un seul paysage pour les deux : l'image du bas traverse d'une bannière à l'autre, à la même hauteur.", visuel: { type: "schema", gabarit: "continuite", pont: true } },
      { id: "independante", nom: "Indépendante", description: "Seuls le logo et les couleurs sont communs ; la nouvelle a sa propre mise en page.", visuel: { type: "schema", gabarit: "independante" } },
    ],
  },
  {
    id: "message",
    titre: "Le message principal",
    consigne:
      "La bannière actuelle dit déjà qui nous sommes et porte le slogan « Observer, Analyser, Partager ». Quel message la nouvelle devrait-elle porter, en un coup d'œil, à 3 mètres ? Les « XX » seront remplacés par de vrais chiffres.",
    options: [
      {
        id: "mission",
        nom: "La mission",
        visuel: {
          type: "texte",
          titre: "Informer sur l'état de la biodiversité au Québec pour de meilleures décisions",
          texte: "Un partenariat scientifique qui réunit XX organisations autour des mêmes données.",
        },
      },
      {
        id: "donnees",
        nom: "Les données",
        visuel: {
          type: "texte",
          titre: "La plus grande banque de données sur la biodiversité au Québec",
          texte: "XX M d'observations et XX jeux de données, ouverts à tous.",
        },
      },
      {
        id: "outils",
        nom: "Outils et aide à la décision",
        visuel: {
          type: "texte",
          titre: "Des outils prêts à utiliser pour éclairer vos décisions",
          texte: "XX outils, dont l'Atlas, les indicateurs et Bioscope, pour votre organisation.",
        },
      },
      {
        id: "suivi",
        nom: "Le suivi",
        visuel: {
          type: "texte",
          titre: "Un réseau qui suit la biodiversité du Québec sur le terrain, depuis 2016",
          texte: "XX sites échantillonnés chaque année et revisités dans le temps.",
        },
      },
    ],
  },
  {
    id: "soutien",
    type: "grille",
    titre: "Ce que la bannière contient",
    consigne:
      "Sous le message, quels éléments sont indispensables ? On parle du contenu, pas de la forme. Choisissez au plus 3 indispensables : une bannière ne peut pas tout dire. Puis choisissez où la bannière doit mener la personne.",
    maxIndispensable: 3,
    niveaux: [
      { id: "indispensable", nom: "Indispensable" },
      { id: "bienvenu", nom: "Bienvenu" },
      { id: "inutile", nom: "Inutile" },
    ],
    elements: [
      { id: "chiffres", nom: "Des chiffres clés (observations, espèces, sites)" },
      { id: "volets", nom: "Les 4 volets de la mission (partenariat scientifique, état de la biodiversité, analyses, outils d'aide à la décision)" },
      { id: "outils", nom: "La liste de nos plateformes (Atlas, réseau de suivi, indicateurs, Bioscope, rAtlas)" },
      { id: "qr", nom: "Un code QR (vers la destination choisie ci-dessous)" },
      { id: "partenaires", nom: "Les logos des partenaires" },
      { id: "web", nom: "L'adresse du site web" },
      { id: "bilingue", nom: "Le texte aussi en anglais" },
    ],
    action: {
      titre: "Après avoir lu la bannière, la personne devrait surtout…",
      choix: [
        { id: "accueil", nom: "visiter la page d'accueil du portail" },
        { id: "atlas", nom: "explorer l'Atlas" },
        { id: "reseau", nom: "découvrir le réseau de suivi" },
        { id: "bioscope", nom: "découvrir Bioscope" },
        { id: "infolettre", nom: "s'abonner à l'infolettre" },
        { id: "contact", nom: "nous écrire ou planifier une rencontre" },
      ],
    },
  },
  {
    id: "densite",
    ordreFixe: true, // une échelle : on garde l'ordre 1, 3, 6, 10
    titre: "La quantité d'information",
    consigne:
      "Une bannière se lit en marchant. Jusqu'où aller ? Classez les 4 niveaux, du plus juste (1) au moins juste (4). Sous le titre et l'image, chaque bloc gris représente un élément (phrase, chiffre, liste…) ; leur disposition n'est qu'un exemple.",
    options: [
      { id: "une", nom: "Une idée", description: "Logo, une phrase, une adresse.", visuel: { type: "maquette", gabarit: "densite", blocs: 1 } },
      { id: "quelques", nom: "Quelques repères", description: "Un message et 3 éléments courts.", visuel: { type: "maquette", gabarit: "densite", blocs: 3 } },
      { id: "plusieurs", nom: "Plusieurs éléments", description: "Un message et 6 éléments.", visuel: { type: "maquette", gabarit: "densite", blocs: 6 } },
      { id: "detaillee", nom: "Très détaillée", description: "Un message et 10 éléments, à lire de près.", visuel: { type: "maquette", gabarit: "densite", blocs: 10 } },
    ],
  },
  {
    id: "visuels",
    titre: "L'élément visuel principal",
    consigne:
      "Quelle image doit porter le message ? Classez les 6 options. Le fond de la bannière vient à la question suivante. Tous les exemples viennent de nos réalisations : jugez le type d'image, pas cet exemple en particulier.",
    options: [
      { id: "illustration", nom: "Une grande illustration de la marque", description: "Les dessins de la marque (oiseau, quenouilles, fleurs, gouttes…), réunis en une grande illustration.", visuel: { type: "image", src: "assets/img/illustration.jpg", legende: "Dessins du guide de l'identité visuelle, regroupés" } },
      { id: "pictos", nom: "Les cartes-pictogrammes du Québec", description: "Une silhouette du Québec qui symbolise un type de données : sites du réseau de suivi, observations, aires de répartition, tendances. On peut en créer d'autres.", visuel: { type: "image", src: "assets/img/cartes_pictos.jpg", legende: "Cartes de l'affiche de 2022" } },
      { id: "plateformes", nom: "Nos plateformes dans un ordinateur ou un téléphone", description: "Une capture d'une de nos plateformes dans un appareil : la page d'accueil du portail, l'Atlas, le réseau de suivi ou Bioscope.", visuel: { type: "image", src: "assets/img/plateformes_bioscope.jpg", legende: "Exemple : Bioscope (maquette de l'interface)" } },
      { id: "photos", nom: "Des photos de terrain ou d'espèces", description: "Le réseau au travail, ou les espèces suivies.", visuel: { type: "image", src: "assets/img/terrain.jpg", legende: "Photothèque du portail" } },
      { id: "cartes", nom: "Des cartes de données (une ou plusieurs)", description: "De vraies cartes, lisibles : observations, sites du réseau de suivi, aire de répartition d'une espèce… Une grande ou plusieurs petites.", visuel: { type: "image", src: "assets/img/carte_donnees.jpg", legende: "Exemple : nombre d'espèces observées" } },
      { id: "diagramme", nom: "Un diagramme méthodologique", description: "Un schéma qui montre comment on passe des données aux indicateurs, puis à la décision.", visuel: { type: "image", src: "assets/img/diagramme_bioscope.jpg", legende: "Exemple : le parcours des données dans Bioscope (2026)" } },
    ],
  },
  {
    id: "fond",
    titre: "Le fond de la bannière",
    consigne:
      "Sur quoi le reste est-il posé ? Classez les 4 fonds. Le contenu par-dessus est le même dans les quatre exemples.",
    options: [
      { id: "clair", nom: "Uni clair", description: "Un fond blanc ou très pâle, sans image.", visuel: { type: "maquette", gabarit: "fond", fond: "clair" } },
      { id: "fonce", nom: "Uni foncé", description: "Le vert foncé de la marque, sans image.", visuel: { type: "maquette", gabarit: "fond", fond: "fonce" } },
      { id: "photo", nom: "Une photo", description: "Une photo occupe le fond, comme la forêt de la bannière actuelle.", visuel: { type: "maquette", gabarit: "fond", fond: "photo" } },
      { id: "motif", nom: "Le motif d'illustrations", description: "Les dessins de la marque répétés en motif, discrets, sur un fond de couleur.", visuel: { type: "maquette", gabarit: "fond", fond: "motif" } },
    ],
  },
  {
    id: "style",
    titre: "La mise en page",
    consigne:
      "Les cinq bannières contiennent exactement les mêmes éléments (logo, titre, texte, une image, code QR, partenaires). Seule leur disposition change. Tout est en gris : les couleurs et les images viendront plus tard.",
    options: [
      { id: "bas", nom: "Image en bas, comme l'actuelle", description: "Logo et message en haut, l'image dans le bas, la bande de logos au pied.", visuel: { type: "maquette", gabarit: "mp_bas" } },
      { id: "pleine", nom: "Image en grand, texte posé dessus", description: "L'image occupe toute la bannière ; le texte est posé dessus. Imaginez une photo forte.", visuel: { type: "maquette", gabarit: "mp_pleine" } },
      { id: "bandeau", nom: "Image et bandeau", description: "L'image en haut, le message dans un bandeau plein, le reste en dessous.", visuel: { type: "maquette", gabarit: "mp_bandeau" } },
      { id: "tuiles", nom: "Grille de tuiles", description: "Les mêmes éléments, découpés en tuiles, comme un tableau de bord.", visuel: { type: "maquette", gabarit: "mp_tuiles" } },
      { id: "typo", nom: "Typographique, fond clair", description: "Un très grand titre domine ; l'image est petite.", visuel: { type: "maquette", gabarit: "mp_typo" } },
    ],
  },
];
