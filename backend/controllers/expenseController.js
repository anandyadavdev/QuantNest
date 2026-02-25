const Expense = require("../models/Expense");

exports.getExpenses = async (req, res) => {
  try { res.json(await Expense.find({ userId: req.userId }).sort({ date: -1 })); } 
  catch (err) { res.status(500).json({ message: "Server error" }); }
};

exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const expense = new Expense({ userId: req.userId, title, amount, category, date });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};