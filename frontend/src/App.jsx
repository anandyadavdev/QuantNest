// src/App.jsx
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";

// ── Inject Fonts & Global CSS ────────────────
if (!document.getElementById("qn-fonts")) {
  const link = document.createElement("link");
  link.id = "qn-fonts"; link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap";
  document.head.appendChild(link);
}

if (!document.getElementById("dash-styles")) {
  const s = document.createElement("style");
  s.id = "dash-styles";
  s.textContent = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(99,102,241,.35)} 70%{box-shadow:0 0 0 14px rgba(99,102,241,0)} 100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} }
    @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes shimmer { 0%{opacity:.6} 50%{opacity:1} 100%{opacity:.6} }
    .stat-card { background:rgba(15,17,26,.7); border:1px solid rgba(255,255,255,.07); border-radius:20px; padding:24px; position:relative; overflow:hidden; cursor:default; transition:transform .25s,border-color .25s,box-shadow .25s; animation:fadeUp .5s ease both; backdrop-filter:blur(12px); }
    .stat-card:hover { transform:translateY(-4px); border-color:rgba(99,102,241,.4); box-shadow:0 20px 60px rgba(0,0,0,.4); }
    .stat-card-light { background:rgba(255,255,255,.9); border:1px solid rgba(0,0,0,.08); border-radius:20px; padding:24px; position:relative; overflow:hidden; cursor:default; transition:transform .25s,box-shadow .25s; animation:fadeUp .5s ease both; }
    .stat-card-light:hover { transform:translateY(-4px); box-shadow:0 20px 60px rgba(0,0,0,.1); }
    .risk-badge { display:inline-flex; align-items:center; gap:8px; padding:6px 16px; border-radius:100px; font-family:'DM Mono',monospace; font-size:13px; font-weight:500; letter-spacing:.04em; }
    .ticker-wrap { overflow:hidden; white-space:nowrap; }
    .ticker-inner { display:inline-block; animation:ticker 28s linear infinite; }
    .nav-btn-hover:hover { background:rgba(96,165,250,.08) !important; color:#60a5fa !important; }
    .ai-shimmer { animation:shimmer 2s ease infinite; }
  `;
  document.head.appendChild(s);
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "portfolio", label: "Portfolio",  icon: "📊" },
  { id: "expenses",  label: "Expenses",   icon: "💸" },
  { id: "analytics", label: "Analytics",  icon: "📈" },
];

const AppContent = () => {
  const { token, user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [page, setPage] = useState("dashboard");

  if (!token) return <AuthPage />;

  const bg     = dark ? "#0a0d16" : "#f1f5f9";
  const side   = dark ? "#0f1118" : "#ffffff";
  const border = dark ? "#1e293b" : "#e2e8f0";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:bg, color:dark?"#e2e8f0":"#1e293b", fontFamily:"'Syne',sans-serif", transition:"background .3s,color .3s" }}>

      {/* Sidebar */}
      <div style={{ width:220, background:side, borderRight:`1px solid ${border}`, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", transition:"background .3s" }}>
        <div style={{ padding:"24px 16px 12px" }}>
          <h1 style={{ fontSize:20, fontWeight:800, color:"#60a5fa", margin:0, fontFamily:"'Syne',sans-serif" }}>QuantNest</h1>
          <p style={{ fontSize:11, color:"#475569", marginTop:4, fontFamily:"'DM Mono',monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user?.email}
          </p>
        </div>

        <nav style={{ flex:1, padding:"8px" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} className="nav-btn-hover"
              style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 14px", marginBottom:4, borderRadius:10, border:"none",
                background: page===item.id ? "rgba(96,165,250,.12)" : "transparent",
                color: page===item.id ? "#60a5fa" : dark ? "#64748b" : "#94a3b8",
                fontSize:14, fontWeight:page===item.id?600:400, cursor:"pointer", transition:"all .2s" }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding:"12px 16px 20px", borderTop:`1px solid ${border}` }}>
          <button onClick={toggle}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", background:dark?"rgba(255,255,255,.05)":"rgba(0,0,0,.04)", border:`1px solid ${border}`, borderRadius:10, padding:"8px 12px", color:dark?"#94a3b8":"#64748b", cursor:"pointer", fontSize:13, marginBottom:8 }}>
            <span>{dark ? "🌙 Dark" : "☀️ Light"}</span>
            <div style={{ width:32, height:18, borderRadius:99, background:dark?"#6366f1":"#cbd5e1", position:"relative", transition:"background .3s" }}>
              <div style={{ width:14, height:14, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:dark?16:2, transition:"left .3s" }} />
            </div>
          </button>
          <button onClick={logout}
            style={{ width:"100%", padding:"11px 16px", background:"#1e293b", color:"#64748b", border:`1px solid ${border}`, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex:1, padding:28, overflowY:"auto" }}>
        {page === "dashboard" && <Dashboard dark={dark} />}
        {page === "portfolio" && <Portfolio dark={dark} />}
        {page === "expenses"  && <Expenses  dark={dark} />}
        {page === "analytics" && <Analytics dark={dark} />}
      </div>
    </div>
  );
};
export default function App() {
  const path = window.location.pathname;
  
  // 👉 Forgot Password pakadne ke liye
  if (path.startsWith("/reset-password/")) {
    const token = path.split("/")[2];
    return <ResetPassword token={token} />;
  }

  // 👉 Email Verify pakadne ke liye (Naya add kiya)
  if (path.startsWith("/verify-email/")) {
    const token = path.split("/")[2];
    return <VerifyEmail token={token} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}