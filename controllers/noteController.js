const db = require("../config/db");

const getAll = async (req, res) => {
  try {
    const { etudiant_id, matiere, trimestre } = req.query;
    let query = `SELECT n.*, e.nom as etudiant_nom, e.matricule
                 FROM notes n JOIN etudiants e ON n.etudiant_id = e.id WHERE 1=1`;
    const params = [];
    if (etudiant_id) { query += " AND n.etudiant_id = ?"; params.push(etudiant_id); }
    if (matiere)     { query += " AND n.matiere = ?";     params.push(matiere);     }
    if (trimestre)   { query += " AND n.trimestre = ?";   params.push(trimestre);   }
    query += " ORDER BY e.nom, n.matiere";
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const getMoyennes = async (req, res) => {
  try {
    const { trimestre = 1, annee_scolaire } = req.query;
    let query = `SELECT e.id, e.nom, e.matricule, c.nom as classe,
                 AVG(n.note) as moyenne,
                 RANK() OVER (ORDER BY AVG(n.note) DESC) as rang
                 FROM etudiants e
                 LEFT JOIN notes n ON e.id = n.etudiant_id AND n.trimestre = ?
                 LEFT JOIN classes c ON e.classe_id = c.id
                 GROUP BY e.id ORDER BY moyenne DESC`;
    const params = [trimestre];
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const create = async (req, res) => {
  const { etudiant_id, matiere, note, trimestre, annee_scolaire } = req.body;
  if (!etudiant_id || !matiere || note === undefined)
    return res.status(400).json({ message: "Champs requis manquants." });
  try {
    const [result] = await db.query(
      "INSERT INTO notes (etudiant_id, matiere, note, trimestre, annee_scolaire) VALUES (?, ?, ?, ?, ?)",
      [etudiant_id, matiere, note, trimestre || 1, annee_scolaire || "2025-2026"]);
    res.status(201).json({ message: "Note ajoutee.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const update = async (req, res) => {
  const { note } = req.body;
  try {
    await db.query("UPDATE notes SET note = ? WHERE id = ?", [note, req.params.id]);
    res.json({ message: "Note mise a jour." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await db.query("DELETE FROM notes WHERE id = ?", [req.params.id]);
    res.json({ message: "Note supprimee." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { getAll, getMoyennes, create, update, remove };