// src/components/PriceAlerts.jsx
import { useState } from "react";
import { darkStyles, lightStyles } from "../styles";

const PriceAlerts = ({ holdings, dark }) => {
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("qn_alerts") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ symbol: "", type: "above", price: "" });
  const s = dark ? darkStyles : lightStyles;

  const save = (a) => { setAlerts(a); localStorage.setItem("qn_alerts", JSON.stringify(a)); };

  const addAlert = (e) => {
    e.preventDefault();
    if (!form.symbol || !form.price) return;
    save([...alerts, { ...form, id: Date.now(), price: Number(form.price) }]);
    setForm({ symbol: "", type: "above", price: "" });
  };

  const removeAlert = (id) => save(alerts.filter(a => a.id !== id));

  const triggered = alerts.filter(a => {
    const h = holdings.find(h => h.symbol === a.symbol);
    if (!h) return false;
    return a.type === "above" ? h.currentPrice >= a.price : h.currentPrice <= a.price;
  });

  return (
    <div>
      <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: dark ? "#f1f5f9" : "#1e293b", margin: "0 0 16px" }}>
        🔔 Price Alerts
      </h3>

      {triggered.length > 0 && (
        <div style={{ background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
          <p style={{ color: "#34d399", fontWeight: 600, fontSize: 13, margin: "0 0 4px" }}>🎯 {triggered.length} Alert(s) Triggered!</p>
          {triggered.map(a => <p key={a.id} style={{ color: "#94a3b8", fontSize: 12, margin: "2px 0" }}>{a.symbol} is {a.type} ₹{a.price}</p>)}
        </div>
      )}

      <form onSubmit={addAlert} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 16, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>SYMBOL</label>
          <select style={s.input} value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })}>
            <option value="">Select</option>
            {holdings.map(h => <option key={h._id} value={h.symbol}>{h.symbol}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>CONDITION</label>
          <select style={s.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="above">Price Above</option>
            <option value="below">Price Below</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>TARGET ₹</label>
          <input style={s.input} type="number" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        </div>
        <button type="submit" style={{ ...s.btn, width: "auto", padding: "10px 16px", marginBottom: 0 }}>+ Add</button>
      </form>

      {alerts.length === 0
        ? <div style={{ textAlign: "center", color: "#475569", padding: "20px 0", fontSize: 13 }}>No alerts set. Add one above!</div>
        : alerts.map(a => {
          const isTrig = triggered.find(t => t.id === a.id);
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: dark ? "rgba(15,17,26,.6)" : "rgba(248,250,252,.8)", border: `1px solid ${isTrig ? "rgba(52,211,153,.4)" : "rgba(255,255,255,.06)"}`, borderRadius: 12, marginBottom: 8 }}>
              <div>
                <span style={{ color: "#60a5fa", fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{a.symbol}</span>
                <span style={{ color: "#64748b", fontSize: 13, marginLeft: 8 }}>{a.type === "above" ? "▲ Above" : "▼ Below"} ₹{a.price.toLocaleString("en-IN")}</span>
                {isTrig && <span style={{ marginLeft: 8, color: "#34d399", fontSize: 12 }}>● Triggered</span>}
              </div>
              <button onClick={() => removeAlert(a.id)} style={s.delBtn}>Remove</button>
            </div>
          );
        })}
    </div>
  );
};

export default PriceAlerts;