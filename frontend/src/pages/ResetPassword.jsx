import { useState } from "react";
import { API_BASE } from "../context/AuthContext";
import { darkStyles } from "../styles";

const ResetPassword = ({ token }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      
      setMessage("Password successfully reset! You can now login.");
      setTimeout(() => {
        window.location.href = "/"; // Go back to login
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0d16", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#0f1118", border:"1px solid #1e293b", borderRadius:20, padding:36, width:"100%", maxWidth:380, animation:"fadeUp .5s ease both" }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:"#60a5fa", textAlign:"center", margin:"0 0 4px", fontFamily:"'Syne',sans-serif" }}>Set New Password</h1>
        <p style={{ color:"#64748b", textAlign:"center", marginBottom:28, fontSize:14 }}>Enter your new password below</p>
        
        {error && <div style={darkStyles.errorBox}>{error}</div>}
        {message && <div style={{...darkStyles.errorBox, background:"rgba(52,211,153,.1)", borderColor:"rgba(52,211,153,.3)", color:"#34d399"}}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <input style={darkStyles.input} type="password" placeholder="New Password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="6" />
          <input style={darkStyles.input} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required minLength="6" />
          <button style={darkStyles.btn} type="submit" disabled={loading || message}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div style={{ textAlign:"center", marginTop:16 }}>
           <a href="/" style={{ color:"#60a5fa", textDecoration:"none", fontSize:14 }}>Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;