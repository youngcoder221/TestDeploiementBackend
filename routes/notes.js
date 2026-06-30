const router = require("express").Router();
const { getAll, getMoyennes, create, update, remove } = require("../controllers/noteController");
const verifyToken = require("../middleware/auth");

router.get("/moyennes", verifyToken, getMoyennes);
router.get("/",         verifyToken, getAll);
router.post("/",        verifyToken, create);
router.put("/:id",      verifyToken, update);
router.delete("/:id",   verifyToken, remove);

module.exports = router;