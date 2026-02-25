const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getHoldings, addHolding, deleteHolding } = require("../controllers/portfolioController");

router.get("/", authMiddleware, getHoldings);
router.post("/", authMiddleware, addHolding);
router.delete("/:id", authMiddleware, deleteHolding);

module.exports = router;