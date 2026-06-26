import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  APPLIED:     { color: "#6366f1", bg: "rgba(99,102,241,0.12)",  label: "Applied",     icon: "📨" },
  SHORTLISTED: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Shortlisted", icon: "⭐" },
  HIRED:       { color: "#10b981", bg: "rgba(16,185,129,0.12)",  label: "Hired",       icon: "🎉" },
  REJECTED:    { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Rejected",    icon: "✕"  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function monthYear(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function groupByMonth(apps) {
  const map = {};
  apps.forEach((app) => {
    const key = monthYear(app.appliedAt);
    if (!map[key]) map[key] = [];
    map[key].push(app);
  });
  return map;
}

// ─── Single history card ──────────────────────────────────────────────────────
function HistoryCard({ app, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
    >
      {/* Timeline dot + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div
          style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: cfg.bg, border: `2px solid ${cfg.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", flexShrink: 0,
          }}
        >
          {cfg.icon}
        </div>
        <div style={{ width: "2px", flex: 1, background: "rgba(255,255,255,0.06)", marginTop: "6px" }} />
      </div>

      {/* Card body */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px", padding: "16px 20px", cursor: "pointer",
          transition: "border-color 0.2s, background 0.2s",
          marginBottom: "4px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.borderColor = cfg.color + "55";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#f1f5f9" }}>
              {app.jobTitle || "Unknown Role"}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
              {app.company || "Company"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`,
                letterSpacing: "0.3px",
              }}
            >
              {cfg.label}
            </span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
              {formatDate(app.appliedAt)}
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              ▾
            </span>
          </div>
        </div>

        {/* AI score strip */}
        {app.aiScore != null && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>AI Match</span>
            <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%", width: `${app.aiScore}%`,
                  background: app.aiScore >= 70 ? "#10b981" : app.aiScore >= 45 ? "#f59e0b" : "#ef4444",
                  borderRadius: "10px", transition: "width 1s ease",
                }}
              />
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: app.aiScore >= 70 ? "#10b981" : app.aiScore >= 45 ? "#f59e0b" : "#ef4444" }}>
              {Math.round(app.aiScore)}%
            </span>
          </div>
        )}

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                  {[
                    { label: "Education",       value: app.education },
                    { label: "College",         value: app.collegeName },
                    { label: "Year of Passing", value: app.yearOfPassing },
                    { label: "Phone",           value: app.phone },
                    { label: "Gender",          value: app.gender },
                    { label: "Date of Birth",   value: app.dateOfBirth },
                  ].filter((f) => f.value).map((field) => (
                    <div key={field.label}>
                      <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                        {field.label}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#e2e8f0" }}>{field.value}</p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {app.skillsMatch && (
                  <div style={{ marginTop: "14px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                      Matched Skills
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {app.skillsMatch.split(",").map((s) => (
                        <span key={s} style={{ padding: "3px 10px", background: "rgba(16,185,129,0.12)", color: "#10b981", borderRadius: "20px", fontSize: "12px", border: "1px solid rgba(16,185,129,0.25)" }}>
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendation */}
                {app.aiRecommendation && (
                  <div style={{ marginTop: "14px", padding: "10px 14px", background: "rgba(99,102,241,0.08)", borderRadius: "10px", borderLeft: "3px solid #6366f1" }}>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>AI Recommendation</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#c7d2fe", lineHeight: 1.5 }}>{app.aiRecommendation}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicationHistory() {
  const navigate = useNavigate();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    const token       = localStorage.getItem("token");
    const candidateId = localStorage.getItem("userId");

    if (!token || !candidateId) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:8080/api/applications/candidate/${candidateId}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setHistory(sorted);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Filter + search
  const filtered = history.filter((app) => {
    const matchStatus = filter === "ALL" || app.status === filter;
    const q           = search.toLowerCase();
    const matchSearch =
      !q ||
      (app.jobTitle || "").toLowerCase().includes(q) ||
      (app.company  || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const grouped = groupByMonth(filtered);
  const months  = Object.keys(grouped);

  const STATUS_FILTERS = ["ALL", "APPLIED", "SHORTLISTED", "HIRED", "REJECTED"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", color: "#94a3b8", padding: "8px 14px",
              cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#f1f5f9" }}>
              Application History
            </h1>
            <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
              Applications older than 30 days
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              padding: "6px 16px", background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px",
              fontSize: "13px", color: "#a5b4fc",
            }}
          >
            {history.length} total
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px" }}>

        {/* ── Search + Filter bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", gap: "12px", flexWrap: "wrap",
            marginBottom: "36px", alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search by role or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: "200px", padding: "10px 16px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", color: "#f1f5f9", fontSize: "14px", outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {STATUS_FILTERS.map((s) => {
              const active = filter === s;
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "8px 14px", borderRadius: "20px", cursor: "pointer",
                    fontSize: "12px", fontWeight: 600, transition: "all 0.2s",
                    background: active ? (cfg ? cfg.bg : "rgba(99,102,241,0.2)") : "rgba(255,255,255,0.04)",
                    color:      active ? (cfg ? cfg.color : "#a5b4fc") : "rgba(255,255,255,0.45)",
                    border:     active ? `1px solid ${cfg ? cfg.color + "55" : "#6366f144"}` : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {s === "ALL" ? "All" : (STATUS_CONFIG[s]?.label || s)}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #6366f1",
                margin: "0 auto",
              }}
            />
            <p style={{ marginTop: "16px", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
              Loading your history…
            </p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: "center", padding: "80px 40px",
              background: "rgba(255,255,255,0.03)", borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🗃️</div>
            <h3 style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: "18px" }}>
              {history.length === 0 ? "No history yet" : "No results match your filter"}
            </h3>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.25)", fontSize: "14px", lineHeight: 1.6 }}>
              {history.length === 0
                ? "Applications appear here after 30 days. Keep applying!"
                : "Try a different filter or clear the search."}
            </p>
          </motion.div>
        )}

        {/* ── Timeline grouped by month ── */}
        {!loading && months.map((month, mi) => (
          <motion.div
            key={month}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: mi * 0.1 }}
            style={{ marginBottom: "36px" }}
          >
            {/* Month header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div
                style={{
                  padding: "5px 14px", background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)", borderRadius: "20px",
                  fontSize: "12px", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {month}
              </div>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                {grouped[month].length} application{grouped[month].length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Cards */}
            {grouped[month].map((app, i) => (
              <HistoryCard key={app.id} app={app} index={i} />
            ))}
          </motion.div>
        ))}

        {/* ── Bottom padding ── */}
        <div style={{ height: "60px" }} />
      </div>
    </div>
  );
}
