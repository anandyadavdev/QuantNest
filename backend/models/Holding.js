const mongoose = require("mongoose");
const HoldingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  name: { type: String },
  quantity: { type: Number, required: true },
  avgPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Holding", HoldingSchema);