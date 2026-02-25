// src/components/Gauge.jsx
const Gauge = ({ pct, color }) => {
  const r = 42, cx = 52, cy = 52;
  const circumference = Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width="104" height="60" viewBox="0 0 104 60" style={{ overflow: "visible" }}>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)" }}
      />
    </svg>
  );
};

export default Gauge;