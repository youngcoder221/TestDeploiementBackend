const router = require("express").Router();
const { getAll, getOne, create, update, remove } = require("../controllers/classeController");
const verifyToken = require("../middleware/auth");

router.get("/",      verifyToken, getAll);
router.get("/:id",   verifyToken, getOne);
router.post("/",     verifyToken, create);
router.put("/:id",   verifyToken, update);
router.delete("/:id",verifyToken, remove);

module.exports = router;