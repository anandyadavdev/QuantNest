const Holding = require("../models/Holding");
const Expense = require("../models/Expense");

exports.getSummary = async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.userId });
    const expenses = await Expense.find({ userId: req.userId });

    const totalInvested = holdings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);
    const currentValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pnl = currentValue - totalInvested;
    const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

    res.json({ totalInvested, currentValue, pnl, pnlPercent, totalExpenses, holdingsCount: holdings.length });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};