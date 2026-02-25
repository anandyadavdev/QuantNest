const Holding = require("../models/Holding");

// 1. Get Holdings
exports.getHoldings = async (req, res) => {
  try { res.json(await Holding.find({ userId: req.userId })); } 
  catch (err) { res.status(500).json({ message: "Server error" }); }
};

// 2. Add Holding (Ye wala missing tha!)
exports.addHolding = async (req, res) => {
  try {
    const { symbol, name, quantity, avgPrice, currentPrice } = req.body;
    const holding = new Holding({ userId: req.userId, symbol, name, quantity, avgPrice, currentPrice: currentPrice || avgPrice });
    await holding.save();
    res.status(201).json(holding);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

// 3. Delete Holding
exports.deleteHolding = async (req, res) => {
  try {
    const holding = await Holding.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!holding) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};