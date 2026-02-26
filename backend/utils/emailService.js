const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Port 587 (TLS) use karenge kyunki cloud par 465 aksar block hota hai
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // 587 ke liye false hona chahiye
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Cloud servers par handshake easy banane ke liye
    }
  });

  const mailOptions = {
    from: `"QuantNest Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully: " + info.response);
  } catch (error) {
    console.error("❌ Nodemailer Error: ", error);
    throw error; 
  }
};

module.exports = sendEmail;