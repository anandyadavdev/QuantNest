// src/pages/Portfolio.jsx
import { useState } from "react";
import { useAuth, useApi } from "../context/AuthContext";
import { darkStyles, lightStyles } from "../styles";

const Portfolio = ({ dark }) => {
  const { apiFetch } = useAuth();
  const { data: holdings, loading, error, refetch } = useApi("/portfolio");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symbol: "", name: "", quantity: "", avgPrice: "", currentPrice: "" });
  const [formErr, setFormErr] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [fetchMsg, setFetchMsg] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const s = dark ? darkStyles : lightStyles;

  const searchStock = async (query) => {
    if (!query || query.length < 2) { setSuggestions([]); setShowDrop(false); return; }
    try {
      const res = await fetch("http://localhost:5000/api/stock/search?q=" + query);
      const data = await res.json();
      setSuggestions(data.results || []);
      setShowDrop((data.results || []).length > 0);
    } catch { setSuggestions([]); }
  };

  const selectStock = async (stock) => {
    setShowDrop(false); setSuggestions([]); setFetchMsg("Fetching price...");
    setForm(p => ({ ...p, symbol: stock.symbol, name: stock.name }));
    try {
      const res = await fetch("http://localhost:5000/api/stock/price/" + stock.symbol);
      const data = await res.json();
      setForm(p => ({ ...p, symbol: data.symbol, name: data.name, currentPrice: String(data.price) }));
      setFetchMsg("Live price: ₹" + data.price + " (" + (data.change >= 0 ? "+" : "") + data.change + "%)");
    } catch { setFetchMsg("Price fetch failed - enter manually"); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setFormErr("");
    try {
      await apiFetch("/portfolio", {
        method: "POST",
        body: JSON.stringify({ ...form, quantity: Number(form.quantity), avgPrice: Number(form.avgPrice), currentPrice: Number(form.currentPrice || form.avgPrice) }),
      });
      setForm({ symbol: "", name: "", quantity: "", avgPrice: "", currentPrice: "" });
      setFetchMsg(""); setShowForm(false); refetch();
    } catch (err) { setFormErr(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holding?")) return;
    try { await apiFetch("/portfolio/" + id, { method: "DELETE" }); refetch(); }
    catch (err) { alert(err.message); }
  };

  if (loading) return <p style={{ color: "#64748b" }}>Loading portfolio...</p>;
  if (error) return <div style={s.errorBox}>{error}</div>;

  return (
    <div>
      <div style={s.rowBetween}>
        <h2 style={s.pageTitle}>Portfolio</h2>
        <button style={{ ...s.btn, width: "auto" }} onClick={() => { setShowForm(!showForm); setFetchMsg(""); setSuggestions([]); }}>
          {showForm ? "Cancel" : "+ Add Holding"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 20 }}>
          {formErr && <div style={s.errorBox}>{formErr}</div>}
          <form onSubmit={handleAdd}>
            <div style={s.grid2}>
              <div style={{ position: "relative", gridColumn: "1 / -1" }}>
                <input style={s.input} placeholder="Type stock symbol or name (e.g. RELIANCE, TCS)"
                  value={form.symbol}
                  onChange={e => { setForm({ ...form, symbol: e.target.value.toUpperCase() }); searchStock(e.target.value); }}
                  onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                  autoComplete="off" required />
                {showDrop && suggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, zIndex: 100, maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,.4)" }}>
                    {suggestions.map((s, i) => (
                      <div key={i} onMouseDown={() => selectStock(s)}
                        style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#334155"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: 14 }}>{s.symbol}</span>
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input style={{ ...s.input, color: form.name ? "#34d399" : "#94a3b8" }} placeholder="Company Name (auto-filled)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input style={{ ...s.input, color: form.currentPrice ? "#34d399" : "#94a3b8" }} type="number" placeholder="Current Price (auto-filled)" value={form.currentPrice} onChange={e => setForm({ ...form, currentPrice: e.target.value })} />
              <input style={s.input} type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
              <input style={s.input} type="number" placeholder="Avg Buy Price" value={form.avgPrice} onChange={e => setForm({ ...form, avgPrice: e.target.value })} required />
            </div>
            {fetchMsg && <p style={{ color: fetchMsg.includes("Live") ? "#34d399" : "#f59e0b", fontSize: 13, marginBottom: 10 }}>{fetchMsg}</p>}
            <button style={s.btn} type="submit">Add Holding</button>
          </form>
        </div>
      )}

      {holdings.length === 0
        ? <div style={s.empty}>No holdings yet. Add your first stock!</div>
        : <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>{["Symbol", "Name", "Qty", "Avg Price", "Curr Price", "Invested", "Value", "P&L", ""].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {holdings.map(h => {
                  const inv = h.avgPrice * h.quantity, val = h.currentPrice * h.quantity, pnl = val - inv, pct = inv > 0 ? (pnl / inv) * 100 : 0;
                  return (
                    <tr key={h._id} style={s.tr}>
                      <td style={{ ...s.td, color: "#60a5fa", fontWeight: 700 }}>{h.symbol}</td>
                      <td style={s.td}>{h.name || "-"}</td>
                      <td style={s.td}>{h.quantity}</td>
                      <td style={s.td}>₹{h.avgPrice.toLocaleString("en-IN")}</td>
                      <td style={s.td}>₹{h.currentPrice.toLocaleString("en-IN")}</td>
                      <td style={s.td}>₹{inv.toLocaleString("en-IN")}</td>
                      <td style={s.td}>₹{val.toLocaleString("en-IN")}</td>
                      <td style={{ ...s.td, color: pnl >= 0 ? "#34d399" : "#f87171", fontWeight: 600 }}>{pnl >= 0 ? "+" : ""}₹{pnl.toFixed(0)} ({pct.toFixed(1)}%)</td>
                      <td style={s.td}><button style={s.delBtn} onClick={() => handleDelete(h._id)}>Del</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
};

export default Portfolio;