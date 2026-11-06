# Questionnaire — bannière rollup Biodiversité Québec

Page statique (GitHub Pages) qui recueille l'avis de l'équipe sur une deuxième bannière rollup, en 2 ou 3 rondes. Les réponses vont dans un Google Sheet, une ligne par envoi.

Ce dépôt est public et temporaire. Il ne contient que ce qui peut être publié : les maquettes, nos propres visuels et les logos. Les notes de travail, les décisions et les réponses restent dans le dossier de travail local `work/COORDO_banniere_rollup_20261106`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | La page : introduction, identité, questions, envoi |
| `questions.js` | **Le contenu** de la ronde : titres, consignes, options. C'est le fichier à modifier d'une ronde à l'autre |
| `config.js` | Numéro de ronde, adresse du script Google, exemples externes (liens) |
| `app.js` | La mécanique : classement de 1 à 4, brouillon local, envoi |
| `style.css` | Couleurs du Manifeste de marque, mini-bannières en CSS |
| `apps_script/Code.gs` | Le script à coller dans le Google Sheet |
| `assets/` | Images redimensionnées et SVG (logos, motifs, pictogrammes) |

## Brancher le Google Sheet (une fois, environ 10 min)

1. Créer un Google Sheet vide, par exemple « Questionnaire bannière BQ ».
2. Dans le Sheet : **Extensions → Apps Script**. Effacer le contenu de `Code.gs`, coller celui de `apps_script/Code.gs`, enregistrer.
3. **Déployer → Nouveau déploiement**. Type : **Application Web**.
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde** (sinon les personnes sans compte Google ne peuvent pas répondre)
4. Autoriser l'accès quand Google le demande. Le script ne touche qu'à ce Sheet.
5. Copier l'**URL de l'application Web** (elle se termine par `/exec`) et la coller dans `config.js`, champ `ENDPOINT`.

Après une modification de `Code.gs`, il faut **Gérer les déploiements → Modifier → Nouvelle version** : l'URL reste la même.

**À savoir :** l'adresse du script est visible dans la page. N'importe qui qui la trouve pourrait envoyer de fausses réponses. Pour un questionnaire interne de quelques semaines, le risque est faible. Le script refuse les envois trop longs et neutralise les formules.

## Lire les réponses

Dans le Sheet : **Fichier → Télécharger → CSV** (onglet `ronde_1`). Déposer le fichier dans `work/COORDO_banniere_rollup_20261106/reponses/`. Ne pas utiliser « Publier sur le web » : les noms et commentaires deviendraient publics.

Si une personne envoie deux fois, c'est son dernier envoi qui compte (colonne `recu_le`).

## Tester en local

```bash
python -m http.server 8765
```

Puis ouvrir http://localhost:8765. Si `ENDPOINT` est vide, la page fonctionne en mode test : rien n'est envoyé, et la réponse s'affiche dans la console du navigateur.

## Types de questions et colonnes du Sheet

| Type | Ce que fait le répondant | Colonnes |
|---|---|---|
| `classement` | Classe les options de 1 au dernier rang (4 ou 6) | `<q>_<option>` (rang), `<q>_<option>_eviter` (« oui » si à éviter), `<q>_ordre_affiche` |
| `choix` | Choisit une seule option | `<q>_choix`, `<q>_<option>_eviter`, `<q>_ordre_affiche` |
| `grille` | Trie des éléments (indispensable, bienvenu, inutile) et choisit une action | `<q>_<élément>`, `<q>_action` |

`<option>` est l'id stable de l'option dans `questions.js` (par exemple `paire_miroir`, `visuels_diagramme`). Chaque question a aussi `<q>_commentaire`. À la fin : `liens` et `libre`.

Les options sont affichées dans un ordre au hasard pour chaque répondant. Les lettres A, B, C… suivent seulement la position à l'écran : elles ne servent pas à l'analyse. `<q>_ordre_affiche` garde l'ordre vu, pour vérifier l'effet d'ordre.

## Ajouter des exemples externes

Dans `config.js`, `EXEMPLES_EXTERNES`, ajouter des liens ; ils s'affichent dans la dernière section :

```js
EXEMPLES_EXTERNES: [{ titre: "Rollup de X au congrès Y", url: "https://..." }],
```

On met des **liens**, pas des copies d'images : ces visuels appartiennent à d'autres organisations. Les répondants peuvent aussi coller leurs propres liens dans le champ « Exemples vus ailleurs », à la fin.

## Droits des visuels

- Photos de forêt et de baleine : Unsplash (Damien Schnorhk, Bart van Meele), licence Unsplash.
- Photos de terrain : photothèque du portail Biodiversité Québec.
- Logos, illustrations, motifs : Biodiversité Québec. Pictogrammes : `bq-design-system`.
- La police des titres de la marque (Brother 1816) est commerciale et n'est pas publiée ici. Les maquettes utilisent **Cabin**, son équivalent sur Google Fonts recommandé dans `Polices.docx`.
