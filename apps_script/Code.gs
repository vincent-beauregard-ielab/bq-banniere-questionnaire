/**
 * Reçoit les réponses du questionnaire bannière BQ et les ajoute au Google Sheet.
 * Une ligne par envoi, un onglet par ronde (« ronde_1 », « ronde_2 »…).
 * Les colonnes se créent toutes seules à partir des réponses reçues.
 *
 * Installation : voir le README du dépôt, section « Brancher le Google Sheet ».
 */

const TAILLE_MAX = 50000; // caractères : un envoi normal en fait environ 2 000

function doPost(e) {
  const verrou = LockService.getScriptLock();
  try {
    verrou.waitLock(10000);
    const brut = (e && e.postData && e.postData.contents) || "";
    if (brut.length > TAILLE_MAX) return repondre({ ok: false, erreur: "trop long" });

    const donnees = JSON.parse(brut);
    if (!donnees.nom || !donnees.ronde) return repondre({ ok: false, erreur: "nom ou ronde manquant" });

    const ronde = String(donnees.ronde).replace(/[^0-9A-Za-z_-]/g, "").slice(0, 10);
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    const onglet = classeur.getSheetByName("ronde_" + ronde) || classeur.insertSheet("ronde_" + ronde);

    donnees.recu_le = new Date().toISOString();

    // En-têtes : on garde l'ordre existant et on ajoute les nouvelles colonnes à droite.
    const entetes = onglet.getLastColumn() > 0
      ? onglet.getRange(1, 1, 1, onglet.getLastColumn()).getValues()[0]
      : [];
    Object.keys(donnees).forEach(function (cle) {
      if (entetes.indexOf(cle) === -1) entetes.push(cle);
    });
    onglet.getRange(1, 1, 1, entetes.length).setValues([entetes]);

    const ligne = entetes.map(function (cle) {
      return nettoyer(donnees[cle]);
    });
    onglet.appendRow(ligne);
    return repondre({ ok: true });
  } catch (err) {
    return repondre({ ok: false, erreur: String(err) });
  } finally {
    verrou.releaseLock();
  }
}

// Une valeur qui commence par = + - @ serait lue comme une formule par Google Sheets.
// On la préfixe d'une apostrophe pour qu'elle reste du texte.
function nettoyer(valeur) {
  if (valeur === undefined || valeur === null) return "";
  if (typeof valeur === "number") return valeur;
  const texte = String(valeur).slice(0, 5000);
  return /^[=+\-@]/.test(texte) ? "'" + texte : texte;
}

function repondre(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(ContentService.MimeType.JSON);
}
