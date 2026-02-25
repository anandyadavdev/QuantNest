import { useEffect, useState } from "react";
import { API_BASE } from "../context/AuthContext";
import { darkStyles } from "../styles";

const VerifyEmail = ({ token }) => {
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("Verifying your email please wait...");

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/verify-email/${token}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Verification failed");
        
        setStatus("success");
        setMessage("Email successfully verified! Redirecting to login...");
        
        // 3 second baad login page par bhej do
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verifyUserEmail();
  }, [token]);

  return (
    <div style={{ minHeight:"100vh", background:"#0a0d16", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#0f1118", border:"1px solid #1e293b", borderRadius:20, padding:36, width:"100%", maxWidth:380, textAlign: "center" }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:"#60a5fa", margin:"0 0 16px" }}>QuantNest</h1>
        
        {status === "verifying" && <p style={{ color:"#64748b" }}>⏳ {message}</p>}
        
        {status === "success" && (
          <div style={{...darkStyles.errorBox, background:"rgba(52,211,153,.1)", borderColor:"rgba(52,211,153,.3)", color:"#34d399"}}>
            ✅ {message}
          </div>
        )}
        
        {status === "error" && (
          <div style={darkStyles.errorBox}>
            ❌ {message}
          </div>
        )}

        {status === "error" && (
          <div style={{ marginTop:16 }}>
             <a href="/" style={{ color:"#60a5fa", textDecoration:"none", fontSize:14 }}>Back to Login</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;