const router = require("express").Router();
const { register, login, me, loginEtudiant } = require("../controllers/authController");
const verifyToken = require("../middleware/auth");

router.post("/register",        register);
router.post("/login",           login);
router.post("/login-etudiant",  loginEtudiant);
router.get("/me",               verifyToken, me);

module.exports = router;