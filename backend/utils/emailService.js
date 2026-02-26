const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Gmail ke liye specific settings use karein
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Port 465 ke liye true
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"QuantNest Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Error handling add kariye taaki logs mein dikhe agar fail ho
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Nodemailer Error: ", error);
    throw error; // Isse authController ko pata chalega ki mail fail hua hai
  }
};

module.exports = sendEmail;