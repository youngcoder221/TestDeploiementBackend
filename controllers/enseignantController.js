const db = require("../config/db");

const getAll = async (req, res) => {
  try {
    const { matiere, statut, search } = req.query;
    let query = "SELECT * FROM enseignants WHERE 1=1";
    const params = [];
    if (matiere) { query += " AND matiere = ?";   params.push(matiere); }
    if (statut)  { query += " AND statut = ?";    params.push(statut);  }
    if (search)  { query += " AND nom LIKE ?";    params.push("%" + search + "%"); }
    query += " ORDER BY nom ASC";
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM enseignants WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Enseignant introuvable." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const create = async (req, res) => {
  const { nom, email, phone, matiere, heures_semaine, statut } = req.body;
  if (!nom || !email) return res.status(400).json({ message: "Nom et email requis." });
  try {
    const [result] = await db.query(
      "INSERT INTO enseignants (nom, email, phone, matiere, heures_semaine, statut) VALUES (?, ?, ?, ?, ?, ?)",
      [nom, email, phone, matiere, heures_semaine || 0, statut || "Actif"]);
    res.status(201).json({ message: "Enseignant cree.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const update = async (req, res) => {
  const { nom, email, phone, matiere, heures_semaine, note, statut } = req.body;
  try {
    await db.query(
      "UPDATE enseignants SET nom=?, email=?, phone=?, matiere=?, heures_semaine=?, note=?, statut=? WHERE id=?",
      [nom, email, phone, matiere, heures_semaine, note, statut, req.params.id]);
    res.json({ message: "Enseignant mis a jour." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await db.query("DELETE FROM enseignants WHERE id = ?", [req.params.id]);
    res.json({ message: "Enseignant supprime." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };