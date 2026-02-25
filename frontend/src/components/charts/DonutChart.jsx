// src/components/charts/DonutChart.jsx
import { useState } from "react";

const DonutChart = ({ data, dark = true }) => {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) return (
    <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: 40 }}>No data yet</div>
  );

  const total = data.reduce((s, d) => s + d.value, 0);
  const COLORS = ["#818cf8","#34d399","#f59e0b","#f87171","#c084fc","#38bdf8","#fb923c"];
  const cx = 100, cy = 100, r = 70, ir = 44;
  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const ratio = d.value / total, startAngle = angle;
    angle += ratio * 2 * Math.PI;
    const endAngle = angle;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(startAngle), iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(endAngle),   iy2 = cy + ir * Math.sin(endAngle);
    const large = ratio > 0.5 ? 1 : 0;
    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { path, color: COLORS[i % COLORS.length], label: d.label, value: d.value, ratio };
  });

  const hov = hovered !== null ? slices[hovered] : null;
  const tc = dark ? "#94a3b8" : "#64748b";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, flexShrink: 0 }}>
        {slices.map((sl, i) => (
          <path key={i} d={sl.path} fill={sl.color}
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.35, cursor: "pointer", transition: "opacity .2s", filter: hovered === i ? `drop-shadow(0 0 8px ${sl.color})` : "none" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill={tc}>{hov ? hov.label : "Total"}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fontWeight="700" fill={hov ? hov.color : "#e2e8f0"}>
          {hov ? "₹" + hov.value.toLocaleString("en-IN") : "₹" + total.toLocaleString("en-IN")}
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle" fontSize="10" fill={tc}>
          {hov ? (hov.ratio * 100).toFixed(1) + "%" : `${data.length} items`}
        </text>
      </svg>
      <div style={{ flex: 1, minWidth: 100 }}>
        {slices.map((sl, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, opacity: hovered === null || hovered === i ? 1 : 0.35, transition: "opacity .2s", cursor: "pointer" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: sl.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: tc, flex: 1 }}>{sl.label}</span>
            <span style={{ fontSize: 12, color: sl.color, fontFamily: "'DM Mono',monospace" }}>{(sl.ratio * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;