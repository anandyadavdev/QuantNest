// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useAuth, useApi } from "../context/AuthContext";
import { darkStyles, lightStyles } from "../styles";
import Gauge from "../components/Gauge";
import AIInsights from "../components/AIInsights";
import PriceAlerts from "../components/PriceAlerts";
import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";
import BarChart from "../components/charts/BarChart";

const Spark = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const w = 80, h = 32, min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
};

const IconBlob = ({ emoji, color }) => (
  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
    {emoji}
  </div>
);

const exportToCSV = (holdings, expenses, summary) => {
  let csv = "PORTFOLIO HOLDINGS\nSymbol,Name,Qty,Avg Price,Current Price,Invested,Value,P&L,P&L%\n";
  holdings.forEach(h => {
    const inv = h.avgPrice * h.quantity, val = h.currentPrice * h.quantity, pnl = val - inv;
    csv += `${h.symbol},${h.name || ""},${h.quantity},${h.avgPrice},${h.currentPrice},${inv},${val},${pnl.toFixed(0)},${inv > 0 ? ((pnl / inv) * 100).toFixed(2) : 0}%\n`;
  });
  csv += "\nEXPENSES\nTitle,Amount,Category,Date\n";
  expenses.forEach(e => { csv += `${e.title},${e.amount},${e.category},${new Date(e.date).toLocaleDateString("en-IN")}\n`; });
  csv += `\nSUMMARY\nTotal Invested,${summary?.totalInvested || 0}\nCurrent Value,${summary?.currentValue || 0}\nP&L,${summary?.pnl || 0}\nP&L%,${summary?.pnlPercent || 0}%\n`;
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `QuantNest_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
};

const Dashboard = ({ dark }) => {
  const { apiFetch } = useAuth();
  const { data: holdings = [] } = useApi("/portfolio");
  const { data: expenses = [] } = useApi("/expenses");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const s = dark ? darkStyles : lightStyles;
  const cardClass = dark ? "stat-card" : "stat-card-light";
  const textMuted = dark ? "#475569" : "#94a3b8";
  const textMain = dark ? "#f1f5f9" : "#1e293b";

  useEffect(() => {
    apiFetch("/dashboard")
      .then(setSummary)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Risk calc
  const total = holdings.reduce((s, h) => s + h.avgPrice * h.quantity, 0);
  const highestWeight = total > 0 ? Math.max(...holdings.map(h => (h.avgPrice * h.quantity) / total)) : 0;
  let risk = "Low", riskColor = "#34d399", riskPct = 22, riskEmoji = "🟢";
  if (highestWeight > 0.6)      { risk = "High";     riskColor = "#f87171"; riskPct = 82; riskEmoji = "🔴"; }
  else if (highestWeight > 0.4) { risk = "Moderate"; riskColor = "#f59e0b"; riskPct = 52; riskEmoji = "🟡"; }

  const s2 = summary || {}, pnl = s2.pnl || 0, pnlPos = pnl >= 0;

  const pnlChartData = [
    { label: "Jan", value: (s2.totalInvested || 245000) * 0.85 },
    { label: "Feb", value: (s2.totalInvested || 245000) * 0.90 },
    { label: "Mar", value: (s2.totalInvested || 245000) * 0.88 },
    { label: "Apr", value: (s2.totalInvested || 245000) * 0.95 },
    { label: "May", value: (s2.totalInvested || 245000) * 1.02 },
    { label: "Jun", value: s2.currentValue || 298430 },
  ];

  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const expDonutData = Object.entries(catMap).map(([label, value]) => ({ label, value }));
  const holdingsBarData = holdings.slice(0, 6).map(h => ({ label: h.symbol, value: h.avgPrice * h.quantity }));

  const sparkData = {
    invested: [210000, 215000, 220000, 228000, 235000, 240000, 245000],
    current:  [210000, 222000, 231000, 248000, 260000, 278000, 298430],
    pnl:      [0, 7000, 11000, 20000, 25000, 38000, 53430],
    expenses: [12000, 13200, 14100, 15500, 16200, 17400, 18200],
  };

  const stats = [
    { label: "Total Invested", value: s2.totalInvested || 0, color: "#818cf8", emoji: "💼", spark: sparkData.invested, prefix: "₹" },
    { label: "Current Value",  value: s2.currentValue  || 0, color: "#34d399", emoji: "📈", spark: sparkData.current,  prefix: "₹" },
    { label: "P&L",            value: Math.abs(pnl),          color: pnlPos ? "#34d399" : "#f87171", emoji: pnlPos ? "🚀" : "📉", spark: sparkData.pnl, prefix: pnlPos ? "+₹" : "-₹" },
    { label: "Total Expenses", value: s2.totalExpenses || 0, color: "#f59e0b", emoji: "💸", spark: sparkData.expenses, prefix: "₹" },
  ];

  const tickerItems = holdings.map(h => `${h.symbol}  ₹${h.avgPrice.toLocaleString("en-IN")}  ×${h.quantity}`);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 340 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, margin: "0 auto 16px", border: "3px solid rgba(99,102,241,.2)", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin-slow 1s linear infinite" }} />
        <p style={{ color: "#64748b", fontFamily: "'DM Mono',monospace", fontSize: 13 }}>loading dashboard…</p>
      </div>
    </div>
  );

  if (error) return <div style={s.errorBox}>⚠ {error}</div>;

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* BG Orbs */}
      {dark && <>
        <div style={{ position: "absolute", width: 420, height: 420, top: -120, right: -80, background: "rgba(99,102,241,.10)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: 300, height: 300, bottom: 40, left: -60, background: "rgba(52,211,153,.06)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      </>}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, position: "relative", zIndex: 1, animation: "fadeUp .4s ease both", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>Portfolio Overview</p>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: textMain, margin: 0 }}>Dashboard</h2>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setShowAlerts(v => !v)}
            style={{ background: "rgba(96,165,250,.15)", border: "1px solid rgba(96,165,250,.3)", borderRadius: 10, padding: "8px 14px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#60a5fa", cursor: "pointer" }}>
            🔔 Alerts
          </button>
          <button onClick={() => setShowAI(v => !v)}
            style={{ background: "rgba(139,92,246,.15)", border: "1px solid rgba(139,92,246,.3)", borderRadius: 10, padding: "8px 14px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#c084fc", cursor: "pointer" }}>
            🤖 AI Insights
          </button>
          <div style={{ background: "rgba(99,102,241,.15)", border: "1px solid rgba(99,102,241,.3)", borderRadius: 10, padding: "8px 14px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#818cf8", animation: "pulse-ring 2.5s ease infinite" }}>
            ● LIVE
          </div>
        </div>
      </div>

      {/* Ticker */}
      {tickerItems.length > 0 && (
        <div style={{ marginBottom: 24, position: "relative", zIndex: 1, background: dark ? "rgba(15,17,26,.6)" : "rgba(255,255,255,.6)", border: `1px solid ${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}`, borderRadius: 12, padding: "10px 0", overflow: "hidden" }}>
          <div className="ticker-wrap">
            <div className="ticker-inner">
              {[...tickerItems, ...tickerItems].map((t, i) => (
                <span key={i} style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: textMuted, padding: "0 32px" }}>
                  <span style={{ color: "#818cf8" }}>◆</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 16, position: "relative", zIndex: 1 }}>
        {stats.map((st, i) => (
          <div key={st.label} className={cardClass} style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", background: `${st.color}14`, top: -20, right: -10, filter: "blur(20px)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <IconBlob emoji={st.emoji} color={st.color} />
              <Spark data={st.spark} color={st.color} />
            </div>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 6px" }}>{st.label}</p>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: st.color, margin: 0 }}>
              {st.prefix}{st.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      {/* Holdings + PnL% */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16, position: "relative", zIndex: 1 }}>
        <div className={cardClass} style={{ animationDelay: ".32s" }}>
          <IconBlob emoji="🗂️" color="#818cf8" />
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "12px 0 4px" }}>Holdings</p>
          <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#818cf8", margin: 0 }}>
            {s2.holdingsCount || 0}<span style={{ fontSize: 13, fontWeight: 400, color: textMuted, marginLeft: 6 }}>stocks</span>
          </p>
        </div>
        <div className={cardClass} style={{ animationDelay: ".4s" }}>
          <IconBlob emoji="%" color={pnlPos ? "#34d399" : "#f87171"} />
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "12px 0 4px" }}>P&L Return</p>
          <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: pnlPos ? "#34d399" : "#f87171", margin: 0 }}>
            {pnlPos ? "+" : ""}{(s2.pnlPercent || 0).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16, position: "relative", zIndex: 1 }}>
        <div className={cardClass} style={{ animationDelay: ".44s" }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 14px" }}>📈 Portfolio Growth</p>
          <LineChart data={pnlChartData} color="#818cf8" dark={dark} />
        </div>
        <div className={cardClass} style={{ animationDelay: ".52s" }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 14px" }}>🍩 Expense Breakdown</p>
          <DonutChart data={expDonutData.length > 0 ? expDonutData : [{ label: "No Data", value: 1 }]} dark={dark} />
        </div>
      </div>

      {/* Holdings Bar */}
      {holdingsBarData.length > 0 && (
        <div className={cardClass} style={{ animationDelay: ".56s", marginBottom: 16, position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 14px" }}>📊 Holdings Value</p>
          <BarChart data={holdingsBarData} dark={dark} />
        </div>
      )}

      {/* Risk Card */}
      <div className={cardClass} style={{ animationDelay: ".6s", position: "relative", zIndex: 1, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 10px" }}>Portfolio Risk Level</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: riskColor, margin: 0 }}>{risk}</p>
              <span className="risk-badge" style={{ background: `${riskColor}18`, border: `1px solid ${riskColor}44`, color: riskColor }}>
                {riskEmoji} {(highestWeight * 100).toFixed(1)}% concentration
              </span>
            </div>
            <div style={{ marginTop: 12, height: 6, borderRadius: 99, background: "rgba(255,255,255,.07)", overflow: "hidden", maxWidth: 280 }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${riskPct}%`, background: `linear-gradient(90deg,${riskColor}88,${riskColor})`, boxShadow: `0 0 10px ${riskColor}66`, transition: "width 1s cubic-bezier(.22,1,.36,1)" }} />
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <Gauge pct={riskPct} color={riskColor} />
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, marginTop: 4 }}>{riskPct}%</p>
          </div>
        </div>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div className={cardClass} style={{ marginBottom: 16, position: "relative", zIndex: 1 }}>
          <AIInsights holdings={holdings} expenses={expenses} summary={summary} dark={dark} />
        </div>
      )}

      {/* Alerts Panel */}
      {showAlerts && (
        <div className={cardClass} style={{ marginBottom: 16, position: "relative", zIndex: 1 }}>
          <PriceAlerts holdings={holdings} dark={dark} />
        </div>
      )}

      {/* Export */}
      <div style={{ display: "flex", justifyContent: "flex-end", position: "relative", zIndex: 1, marginTop: 8 }}>
        <button onClick={() => exportToCSV(holdings, expenses, summary)}
          style={{ background: "rgba(52,211,153,.15)", border: "1px solid rgba(52,211,153,.3)", color: "#34d399", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
          ⬇ Export to CSV
        </button>
      </div>
    </div>
  );
};

export default Dashboard;