const db = require("../config/db");

const getAll = async (req, res) => {
  try {
    const { classe_id, statut, search } = req.query;
    let query = `SELECT e.*, c.nom as classe_nom FROM etudiants e
                 LEFT JOIN classes c ON e.classe_id = c.id WHERE 1=1`;
    const params = [];
    if (classe_id) { query += " AND e.classe_id = ?"; params.push(classe_id); }
    if (statut)    { query += " AND e.statut = ?";    params.push(statut);    }
    if (search)    { query += " AND e.nom LIKE ?";    params.push("%" + search + "%"); }
    query += " ORDER BY e.nom ASC";
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT e.*, c.nom as classe_nom FROM etudiants e LEFT JOIN classes c ON e.classe_id = c.id WHERE e.id = ?",
      [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Etudiant introuvable." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const create = async (req, res) => {
  const { matricule, nom, email, phone, age, classe_id, statut } = req.body;
  if (!matricule || !nom) return res.status(400).json({ message: "Matricule et nom requis." });
  try {
    const [result] = await db.query(
      "INSERT INTO etudiants (matricule, nom, email, phone, age, classe_id, statut) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [matricule, nom, email, phone, age, classe_id, statut || "Actif"]);
    res.status(201).json({ message: "Etudiant cree.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const update = async (req, res) => {
  const { nom, email, phone, age, classe_id, statut } = req.body;
  try {
    await db.query(
      "UPDATE etudiants SET nom=?, email=?, phone=?, age=?, classe_id=?, statut=? WHERE id=?",
      [nom, email, phone, age, classe_id, statut, req.params.id]);
    res.json({ message: "Etudiant mis a jour." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await db.query("DELETE FROM etudiants WHERE id = ?", [req.params.id]);
    res.json({ message: "Etudiant supprime." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [[{ total }]]   = await db.query("SELECT COUNT(*) as total FROM etudiants");
    const [[{ actifs }]]  = await db.query("SELECT COUNT(*) as actifs FROM etudiants WHERE statut='Actif'");
    const [[{ difficulte }]] = await db.query("SELECT COUNT(*) as difficulte FROM etudiants WHERE statut='Difficulte'");
    const [[{ nouveaux }]] = await db.query(
      "SELECT COUNT(*) as nouveaux FROM etudiants WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())");
    res.json({ total, actifs, difficulte, nouveaux });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove, getStats };