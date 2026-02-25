import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const AIInsights = ({ dark }) => {
  const [aiText, setAiText] = useState("Click the button below to ask Gemini AI to analyze your portfolio and give you professional financial advice.");
  const [loading, setLoading] = useState(false);
  const { apiFetch } = useAuth(); // API call karne ke liye aapka custom hook

  const fetchInsights = async () => {
    setLoading(true);
    try {
      // Backend ko call lagayega (jahan Gemini API ka code likha hai)
      const data = await apiFetch("/ai/insights");
      setAiText(data.insight);
    } catch (error) {
      setAiText("Oops! AI network busy hai ya API key galat hai. Details: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: "24px", 
      borderRadius: "16px", 
      border: `1px solid ${dark ? "rgba(139,92,246,.3)" : "rgba(139,92,246,.4)"}`, 
      background: dark ? "rgba(139,92,246,.05)" : "#faf5ff",
      animation: "fadeUp 0.4s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span style={{ fontSize: "28px", animation: loading ? "pulse-ring 1s infinite" : "none" }}>
          🧠
        </span>
        <h3 style={{ margin: 0, color: dark ? "#c084fc" : "#9333ea", fontFamily: "'Syne', sans-serif", fontSize: "22px" }}>
          Gemini AI Advisor
        </h3>
      </div>
      
      <p style={{ 
        color: dark ? "#cbd5e1" : "#475569", 
        fontSize: "15px", 
        lineHeight: "1.7", 
        whiteSpace: "pre-wrap", 
        fontFamily: "'DM Mono', monospace",
        background: dark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.6)",
        padding: "16px",
        borderRadius: "8px"
      }}>
        {loading ? "AI aapka portfolio analyze kar raha hai... thoda wait kijiye ⏳" : aiText}
      </p>
      
      <button 
        onClick={fetchInsights} 
        disabled={loading}
        style={{ 
          marginTop: "20px", 
          background: loading ? "#94a3b8" : "linear-gradient(90deg, #8b5cf6, #c084fc)", 
          color: "#fff", 
          border: "none", 
          padding: "12px 24px", 
          borderRadius: "8px", 
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'DM Mono', monospace",
          fontWeight: "bold",
          fontSize: "14px",
          boxShadow: loading ? "none" : "0 4px 14px rgba(139,92,246,.4)",
          transition: "all 0.2s ease"
        }}
      >
        {loading ? "Generating Magic..." : "✨ Generate Live Insights"}
      </button>
    </div>
  );
};

export default AIInsights;