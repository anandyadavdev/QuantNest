const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // 👉 Naye fields Verification ke liye
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  
  // Password reset wale fields (jo pehle add kiye the)
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);