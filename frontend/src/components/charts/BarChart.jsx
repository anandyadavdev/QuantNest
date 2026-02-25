// src/components/charts/BarChart.jsx
const BarChart = ({ data, dark = true }) => {
  const COLORS = ["#818cf8","#34d399","#f59e0b","#f87171","#c084fc","#38bdf8"];
  const max = Math.max(...data.map(d => d.value), 1);
  const tc = dark ? "#64748b" : "#94a3b8";

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, padding: "0 4px" }}>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * 100, 4);
        const c = COLORS[i % COLORS.length];
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: tc, fontFamily: "'DM Mono',monospace" }}>
              {d.value >= 1000 ? (d.value / 1000).toFixed(0) + "k" : d.value}
            </span>
            <div style={{ width: "100%", height: `${h}%`, background: c, borderRadius: "6px 6px 0 0", boxShadow: `0 0 8px ${c}55`, transition: "height .7s cubic-bezier(.22,1,.36,1)" }} />
            <span style={{ fontSize: 10, color: tc, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%", textOverflow: "ellipsis" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;