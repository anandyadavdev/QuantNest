const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword, verifyEmail } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// 👉 Nayi Route Verification ke liye
router.put("/verify-email/:token", verifyEmail); 

module.exports = router;