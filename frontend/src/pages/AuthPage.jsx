import { useState } from "react";
import { useAuth, API_BASE } from "../context/AuthContext";
import { darkStyles } from "../styles";

const AuthPage = () => {
  const { login } = useAuth();
  const [view, setView] = useState("login"); // "login", "register", "forgot"
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    
    try {
      if (view === "forgot") {
        const res = await fetch(API_BASE + "/auth/forgot-password", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Something went wrong");
        setMessage("Password reset link sent to your email!");
      } else {
        const endpoint = view === "login" ? "/auth/login" : "/auth/register";
        const res = await fetch(API_BASE + endpoint, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Authentication failed");
        
        // 👉 MAIN LOGIC YAHAN HAI
        if (view === "register") {
          setMessage("Registration successful! Please check your email to verify your account.");
          setView("login"); // User ko login view par bhej do
          setPassword("");  // Password field khali kar do
        } else if (view === "login") {
          login(data.token, data.user); // Sirf tab login karo jab view "login" ho
        }
      }
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0d16", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#0f1118", border:"1px solid #1e293b", borderRadius:20, padding:36, width:"100%", maxWidth:380, animation:"fadeUp .5s ease both" }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:"#60a5fa", textAlign:"center", margin:"0 0 4px", fontFamily:"'Syne',sans-serif" }}>QuantNest</h1>
        
        <p style={{ color:"#64748b", textAlign:"center", marginBottom:28, fontSize:14 }}>
          {view === "login" ? "Welcome back" : view === "register" ? "Create your account" : "Reset your password"}
        </p>
        
        {error && <div style={darkStyles.errorBox}>{error}</div>}
        {message && <div style={{...darkStyles.errorBox, background:"rgba(52,211,153,.1)", borderColor:"rgba(52,211,153,.3)", color:"#34d399"}}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <input style={darkStyles.input} type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} required />
          
          {view !== "forgot" && (
            <input style={darkStyles.input} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          )}

          <button style={darkStyles.btn} type="submit" disabled={loading}>
            {loading ? "Please wait..." : view === "login" ? "Login" : view === "register" ? "Register" : "Send Reset Link"}
          </button>
        </form>

        <div style={{ textAlign:"center", marginTop:16, color:"#64748b", fontSize:14 }}>
          {view === "login" && (
            <>
              <p style={{ margin: "8px 0" }}><span style={{ color:"#60a5fa", cursor:"pointer" }} onClick={() => {setView("forgot"); setError(""); setMessage("");}}>Forgot Password?</span></p>
              <p style={{ margin: 0 }}>No account? <span style={{ color:"#60a5fa", cursor:"pointer" }} onClick={() => {setView("register"); setError(""); setMessage("");}}>Register</span></p>
            </>
          )}
          {view === "register" && (
            <p style={{ margin: 0 }}>Have account? <span style={{ color:"#60a5fa", cursor:"pointer" }} onClick={() => {setView("login"); setError(""); setMessage("");}}>Login</span></p>
          )}
          {view === "forgot" && (
            <p style={{ margin: 0 }}>Remember your password? <span style={{ color:"#60a5fa", cursor:"pointer" }} onClick={() => {setView("login"); setError(""); setMessage("");}}>Login</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;