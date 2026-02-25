const Groq = require("groq-sdk");
const Holding = require("../models/Holding");

// Groq setup
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.getMarketInsights = async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.userId });
    
    if (holdings.length === 0) {
      return res.json({ insight: "Aapka portfolio khali hai. Kuch stocks add karein!" });
    }

    let portfolioSummary = holdings.map(h => `${h.name} (${h.symbol}): ${h.quantity} shares`).join(", ");

    // Llama 3.3 model use kar rahe hain jo Gemini se tez hai
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a financial advisor for QuantNest. Analyze this portfolio: ${portfolioSummary}. Provide 3 short, professional financial insights in plain text bullets. Keep it encouraging.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const aiText = chatCompletion.choices[0]?.message?.content || "AI is thinking...";

    res.status(200).json({ insight: aiText });

  } catch (error) {
    console.error("Groq AI Error:", error);
    res.status(500).json({ message: "AI process failed. Check your API key." });
  }
};