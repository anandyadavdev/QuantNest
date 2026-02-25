// src/pages/Expenses.jsx
import { useState } from "react";
import { useAuth, useApi } from "../context/AuthContext";
import { darkStyles, lightStyles } from "../styles";
import DonutChart from "../components/charts/DonutChart";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];

const Expenses = ({ dark }) => {
  const { apiFetch } = useAuth();
  const { data: expenses, loading, error, refetch } = useApi("/expenses");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: "" });
  const s = dark ? darkStyles : lightStyles;

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/expenses", { method: "POST", body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
      setForm({ title: "", amount: "", category: "Food", date: "" });
      setShowForm(false); refetch();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await apiFetch("/expenses/" + id, { method: "DELETE" }); refetch(); }
    catch (err) { alert(err.message); }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const chartData = Object.entries(catMap).map(([label, value]) => ({ label, value }));

  if (loading) return <p style={{ color: "#64748b" }}>Loading expenses...</p>;
  if (error) return <div style={s.errorBox}>{error}</div>;

  return (
    <div>
      <div style={s.rowBetween}>
        <h2 style={s.pageTitle}>Expenses</h2>
        <button style={{ ...s.btn, width: "auto" }} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      <div style={s.badge}>Total: ₹{total.toLocaleString("en-IN")}</div>

      {chartData.length > 0 && (
        <div style={{ ...s.card, marginBottom: 20 }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: dark ? "#475569" : "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 14px" }}>
            🍩 Spending Breakdown
          </p>
          <DonutChart data={chartData} dark={dark} />
        </div>
      )}

      {showForm && (
        <div style={{ ...s.card, marginBottom: 20 }}>
          <form onSubmit={handleAdd}>
            <div style={s.grid2}>
              <input style={s.input} placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <input style={s.input} type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              <select style={s.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input style={s.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <button style={s.btn} type="submit">Add Expense</button>
          </form>
        </div>
      )}

      {expenses.length === 0
        ? <div style={s.empty}>No expenses yet!</div>
        : expenses.map(exp => (
          <div key={exp._id} style={s.expRow}>
            <div>
              <p style={{ fontWeight: 600, color: dark ? "#e2e8f0" : "#1e293b", margin: 0 }}>{exp.title}</p>
              <p style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{exp.category} - {new Date(exp.date).toLocaleDateString("en-IN")}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#f87171", fontWeight: 700 }}>₹{exp.amount.toLocaleString("en-IN")}</span>
              <button style={s.delBtn} onClick={() => handleDelete(exp._id)}>Del</button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Expenses;