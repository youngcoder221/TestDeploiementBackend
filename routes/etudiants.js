const router = require("express").Router();
const { getAll, getOne, create, update, remove, getStats } = require("../controllers/etudiantController");
const verifyToken = require("../middleware/auth");

router.get("/stats", verifyToken, getStats);
router.get("/",      verifyToken, getAll);
router.get("/:id",   verifyToken, getOne);
router.post("/",     verifyToken, create);
router.put("/:id",   verifyToken, update);
router.delete("/:id",verifyToken, remove);

module.exports = router;