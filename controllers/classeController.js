const db = require("../config/db");

const getAll = async (req, res) => {
  try {
    const { niveau, search } = req.query;
    let query = "SELECT * FROM classes WHERE 1=1";
    const params = [];
    if (niveau) { query += " AND niveau = ?"; params.push(niveau); }
    if (search) { query += " AND nom LIKE ?"; params.push("%" + search + "%"); }
    query += " ORDER BY niveau, nom";
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM classes WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Classe introuvable." });
    const [etudiants] = await db.query(
      "SELECT id, matricule, nom, statut FROM etudiants WHERE classe_id = ?", [req.params.id]);
    res.json({ ...rows[0], etudiants });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const create = async (req, res) => {
  const { nom, niveau, serie, max_effectif, titulaire, salle } = req.body;
  if (!nom) return res.status(400).json({ message: "Nom requis." });
  try {
    const [result] = await db.query(
      "INSERT INTO classes (nom, niveau, serie, max_effectif, titulaire, salle) VALUES (?, ?, ?, ?, ?, ?)",
      [nom, niveau, serie, max_effectif || 50, titulaire, salle]);
    res.status(201).json({ message: "Classe creee.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const update = async (req, res) => {
  const { nom, niveau, serie, max_effectif, titulaire, salle } = req.body;
  try {
    await db.query(
      "UPDATE classes SET nom=?, niveau=?, serie=?, max_effectif=?, titulaire=?, salle=? WHERE id=?",
      [nom, niveau, serie, max_effectif, titulaire, salle, req.params.id]);
    res.json({ message: "Classe mise a jour." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await db.query("DELETE FROM classes WHERE id = ?", [req.params.id]);
    res.json({ message: "Classe supprimee." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };