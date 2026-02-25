// src/components/charts/LineChart.jsx
const LineChart = ({ data, color = "#818cf8", dark = true }) => {
  if (!data || data.length < 2) return (
    <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:40 }}>No data yet</div>
  );
  const W = 500, H = 160, PAD = 44;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const pts = data.map((d, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((d.value - min) / range) * (H - PAD * 2),
    label: d.label, value: d.value,
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${H - PAD} ` + polyline + ` ${pts[pts.length - 1].x},${H - PAD}`;
  const tc = dark ? "#64748b" : "#94a3b8";
  const gradId = `lg-${color.replace("#", "")}`;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 260, height: "auto" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map(i => {
          const y = PAD + (i / 3) * (H - PAD * 2);
          const val = max - (i / 3) * range;
          return (
            <g key={i}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
              <text x={PAD - 6} y={y + 4} textAnchor="end" fontSize="10" fill={tc}>
                {val >= 1000 ? (val / 1000).toFixed(0) + "k" : val.toFixed(0)}
              </text>
            </g>
          );
        })}
        <polygon points={area} fill={`url(#${gradId})`} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={color}
              stroke={dark ? "#0a0d16" : "#fff"} strokeWidth="2" />
            <text x={p.x} y={H - 8} textAnchor="middle" fontSize="10" fill={tc}>{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default LineChart;