const router = require("express").Router();
const { getAll, getStats, create, update } = require("../controllers/paiementController");
const verifyToken = require("../middleware/auth");

router.get("/stats", verifyToken, getStats);
router.get("/",      verifyToken, getAll);
router.post("/",     verifyToken, create);
router.put("/:id",   verifyToken, update);

module.exports = router;