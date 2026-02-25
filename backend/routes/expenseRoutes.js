const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getExpenses, addExpense, deleteExpense } = require("../controllers/expenseController");

router.get("/", authMiddleware, getExpenses);
router.post("/", authMiddleware, addExpense);
router.delete("/:id", authMiddleware, deleteExpense);
module.exports = router;