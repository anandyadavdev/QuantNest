const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");
const User = require("../models/User");

// 👉 1. REGISTER (Modified to bypass email timeout)
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    
    const user = new User({ 
      email, 
      password: hashed,
      isVerified: true // 👈 Render par SMTP issue ki wajah se direct true kar rahe hain
    });
    
    await user.save();

    // Verification Email bhejne ki koshish karenge, par agar fail hua toh bhi registration nahi rukega
    try {
      const verifyUrl = `${process.env.FRONTEND_URL}/login`; // Verification bypass, so redirect to login
      const message = `<h2>Welcome to QuantNest! 🎉</h2><p>Registration successful. You can login now.</p>`;
      
      // Ise hum await nahi kar rahe taaki timeout response ko block na kare
      sendEmail({ email: user.email, subject: "Welcome to QuantNest", message }).catch(e => console.log("Email skip: ", e.message));
    } catch (emailErr) {
      console.log("Email bypass active");
    }

    res.status(201).json({ 
      message: "Registration successful! Email verification bypassed for cloud deployment. You can login now." 
    });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: "Server error" }); 
  }
};

// 👉 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // User isVerified check (Register mein humne true kar diya hai)
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) { 
    res.status(500).json({ message: "Server error" }); 
  }
};

// 👉 3. VERIFY EMAIL (Bypassed but kept for route safety)
exports.verifyEmail = async (req, res) => {
  try {
    res.status(200).json({ message: "Email already verified!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 👉 4. FORGOT PASSWORD (Keep it as is, or use same non-blocking pattern)
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `<h2>QuantNest Password Reset</h2><p>Click below to reset:</p><a href="${resetUrl}">Reset Password</a>`;

    // Try-catch for forgot password email
    sendEmail({ email: user.email, subject: "Password Reset Request", message }).catch(e => console.log("Reset mail fail"));

    res.status(200).json({ message: "If email exists, reset link will be sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 👉 5. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};