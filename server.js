const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth",        require("./routes/auth"));
app.use("/api/etudiants",   require("./routes/etudiants"));
app.use("/api/enseignants", require("./routes/enseignants"));
app.use("/api/classes",     require("./routes/classes"));
app.use("/api/notes",       require("./routes/notes"));
app.use("/api/paiements",   require("./routes/paiements"));

app.get("/", (req, res) => res.json({ message: "API DigiSchool operationnelle" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Serveur demarre sur le port " + PORT));