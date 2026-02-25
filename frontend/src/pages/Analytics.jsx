// src/pages/Analytics.jsx
import { useApi } from "../context/AuthContext";
import { darkStyles, lightStyles } from "../styles";
import LineChart from "../components/charts/LineChart";
import DonutChart from "../components/charts/DonutChart";
import BarChart from "../components/charts/BarChart";

const Analytics = ({ dark }) => {
  const { data: holdings } = useApi("/portfolio");
  const { data: expenses } = useApi("/expenses");
  const s = dark ? darkStyles : lightStyles;

  const totalInvested = holdings.reduce((s, h) => s + h.avgPrice * h.quantity, 0);
  const currentValue  = holdings.reduce((s, h) => s + h.currentPrice * h.quantity, 0);
  const pnlPct = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);

  const holdingsBarData = holdings.slice(0, 8).map(h => ({ label: h.symbol, value: h.avgPrice * h.quantity }));
  const expDonutData = Object.entries(catMap).map(([label, value]) => ({ label, value }));
  const pnlLineData = [
    { label: "Jan", value: totalInvested * 0.85 },
    { label: "Feb", value: totalInvested * 0.90 },
    { label: "Mar", value: totalInvested * 0.88 },
    { label: "Apr", value: totalInvested * 0.95 },
    { label: "May", value: totalInvested * 1.02 },
    { label: "Jun", value: currentValue },
  ];

  const textMuted = dark ? "#475569" : "#94a3b8";

  return (
    <div>
      <h2 style={s.pageTitle}>Analytics</h2>

      {/* Summary Cards */}
      <div style={s.grid4}>
        {[
          { label: "Portfolio Growth", value: pnlPct.toFixed(2) + "%", color: pnlPct >= 0 ? "#34d399" : "#f87171" },
          { label: "Holdings",         value: String(holdings.length),  color: "#60a5fa" },
          { label: "Categories",       value: String(Object.keys(catMap).length), color: "#f59e0b" },
          { label: "Total Expenses",   value: "₹" + totalExp.toLocaleString("en-IN"), color: "#c084fc" },
        ].map(({ label, value, color }) => (
          <div key={label} style={s.card}>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color, margin: "6px 0 0", fontFamily: "'Syne',sans-serif" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
        <div style={s.card}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 14px" }}>📈 Growth Trend</p>
          <LineChart data={pnlLineData} color={pnlPct >= 0 ? "#34d399" : "#f87171"} dark={dark} />
        </div>
        <div style={s.card}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 14px" }}>🍩 Expense Categories</p>
          <DonutChart data={expDonutData.length > 0 ? expDonutData : [{ label: "No Data", value: 1 }]} dark={dark} />
        </div>
      </div>

      {holdingsBarData.length > 0 && (
        <div style={{ ...s.card, marginTop: 14 }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 14px" }}>📊 Holdings Distribution</p>
          <BarChart data={holdingsBarData} dark={dark} />
        </div>
      )}
    </div>
  );
};

export default Analytics;