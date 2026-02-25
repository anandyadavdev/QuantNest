const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getSummary } = require("../controllers/dashboardController");

router.get("/", authMiddleware, getSummary);
module.exports = router;