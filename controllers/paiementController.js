const db = require("../config/db");

const getAll = async (req, res) => {
  try {
    const { statut, type, mois, annee } = req.query;
    let query = `SELECT p.*, e.nom as etudiant_nom, e.matricule, c.nom as classe
                 FROM paiements p
                 JOIN etudiants e ON p.etudiant_id = e.id
                 LEFT JOIN classes c ON e.classe_id = c.id
                 WHERE 1=1`;
    const params = [];
    if (statut) { query += " AND p.statut = ?"; params.push(statut); }
    if (type)   { query += " AND p.type = ?";   params.push(type);   }
    if (mois)   { query += " AND MONTH(p.created_at) = ?"; params.push(mois); }
    if (annee)  { query += " AND YEAR(p.created_at) = ?";  params.push(annee); }
    query += " ORDER BY p.created_at DESC";
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [[{ total_recettes }]] = await db.query(
      "SELECT SUM(montant) as total_recettes FROM paiements WHERE statut='Paye'");
    const [[{ payes }]]    = await db.query("SELECT COUNT(*) as payes FROM paiements WHERE statut='Paye'");
    const [[{ attente }]]  = await db.query("SELECT COUNT(*) as attente FROM paiements WHERE statut='En attente'");
    const [[{ impayes }]]  = await db.query("SELECT COUNT(*) as impayes FROM paiements WHERE statut='Impaye'");
    res.json({ total_recettes: total_recettes || 0, payes, attente, impayes });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const create = async (req, res) => {
  const { reference, etudiant_id, type, montant, mode, statut, date_paiement } = req.body;
  if (!reference || !etudiant_id || !montant)
    return res.status(400).json({ message: "Champs requis manquants." });
  try {
    const [result] = await db.query(
      "INSERT INTO paiements (reference, etudiant_id, type, montant, mode, statut, date_paiement) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [reference, etudiant_id, type, montant, mode, statut || "En attente", date_paiement]);
    res.status(201).json({ message: "Paiement enregistre.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const update = async (req, res) => {
  const { statut, date_paiement } = req.body;
  try {
    await db.query(
      "UPDATE paiements SET statut = ?, date_paiement = ? WHERE id = ?",
      [statut, date_paiement, req.params.id]);
    res.json({ message: "Paiement mis a jour." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { getAll, getStats, create, update };