const db     = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
require("dotenv").config();

// POST /api/auth/register
const register = async (req, res) => {
  const { nom, email, password, role } = req.body;
  if (!nom || !email || !password)
    return res.status(400).json({ message: "Tous les champs sont requis." });
  try {
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ message: "Email deja utilise." });
    const hashed = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)",
      [nom, email, hashed, role || "admin"]);
    res.status(201).json({ message: "Compte cree avec succes." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/auth/login — Admin et Enseignant
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Champs requis." });
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable." });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Mot de passe incorrect." });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      message: "Connexion reussie.",
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// POST /api/auth/login-etudiant — Connexion par matricule
const loginEtudiant = async (req, res) => {
  const { matricule, password } = req.body;
  if (!matricule || !password)
    return res.status(400).json({ message: "Matricule et mot de passe requis." });
  try {
    const [rows] = await db.query(
      "SELECT e.*, c.nom as classe_nom FROM etudiants e LEFT JOIN classes c ON e.classe_id = c.id WHERE e.matricule = ?",
      [matricule]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Etudiant introuvable." });
    const etudiant = rows[0];

    // Si pas de mot de passe en base, utiliser matricule comme mot de passe par defaut
    let valid = false;
    if (etudiant.password) {
      valid = await bcrypt.compare(password, etudiant.password);
    } else {
      // Mot de passe par defaut = matricule
      valid = password === matricule || password === "etudiant123";
    }

    if (!valid) return res.status(401).json({ message: "Mot de passe incorrect." });

    const token = jwt.sign(
      { id: etudiant.id, matricule: etudiant.matricule, role: "etudiant" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      message: "Connexion reussie.",
      token,
      user: {
        id: etudiant.id,
        nom: etudiant.nom,
        matricule: etudiant.matricule,
        classe: etudiant.classe_nom,
        role: "etudiant"
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nom, email, role, created_at FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Introuvable." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
  }
};

module.exports = { register, login, loginEtudiant, me };