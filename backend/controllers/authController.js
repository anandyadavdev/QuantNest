const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");
const User = require("../models/User");

// 👉 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    
    // Email Verification Token Generate karein
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = new User({ 
      email, 
      password: hashed,
      verificationToken: hashedToken 
    });
    await user.save();

    // Verification Email Bhejein
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `
      <h2>Welcome to QuantNest! 🎉</h2>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}" style="background:#34d399; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Verify Email</a>
    `;

    await sendEmail({ email: user.email, subject: "Verify Your QuantNest Account", message });

    res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });
  } catch (err) { 
    res.status(500).json({ message: "Server error" }); 
  }
};

// 👉 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check karein ki user verified hai ya nahi
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in. Check your inbox." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) { 
    res.status(500).json({ message: "Server error" }); 
  }
};

// 👉 3. VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    
    const user = await User.findOne({ verificationToken: hashedToken });
    if (!user) return res.status(400).json({ message: "Invalid or expired verification token" });

    user.isVerified = true;
    user.verificationToken = undefined; // Token ka kaam khatam
    await user.save();

    res.status(200).json({ message: "Email successfully verified! You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 👉 4. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create unique token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and save to DB
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <h2>QuantNest Password Reset</h2>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <a href="${resetUrl}" style="background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail({ email: user.email, subject: "Password Reset Request", message });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    // Agar email fail ho jaye toh token hata do
    const user = await User.findOne({ email: req.body.email });
    if(user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }
    res.status(500).json({ message: "Email could not be sent" });
  }
};

// 👉 5. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token from URL
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // Check if token is not expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Set new password
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};