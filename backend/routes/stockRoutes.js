const express = require("express");
const router = express.Router();
const { searchStock, getStockPrice } = require("../controllers/stockController");

router.get("/search", searchStock);
router.get("/price/:symbol", getStockPrice);
module.exports = router;