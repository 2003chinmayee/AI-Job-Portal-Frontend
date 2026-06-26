import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import CandidateNavbar from "../components/CandidateNavbar";

/* ─── Locomotive Scroll lazy-loader ─────────────────────────────────────── */
function useLocomotiveScroll(containerRef) {
  useEffect(() => {
    let scroll;
    (async () => {
      const [{ default: LocomotiveScroll }] = await Promise.all([
        import("locomotive-scroll"),
      ]);
      scroll = new LocomotiveScroll({
        el: containerRef.current,
        smooth: true,
        smoothMobile: false,
        multiplier: 0.9,
        lerp: 0.07,
      });
    })();
    return () => scroll && scroll.destroy();
  }, [containerRef]);
}

/* ─── Counting-up number hook ────────────────────────────────────────────── */
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.ceil(duration / target);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ─── Status config ──────────────────────────────────────────────────────── */
const statusConfig = (status) => {
  switch (status) {
    case "APPLIED":
      return {
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
        border: "border-l-blue-400",
        dot: "bg-blue-400",
        label: "Applied",
        expanded: "bg-blue-50 border-blue-200",
        text: "text-blue-800",
      };
    case "SHORTLISTED":
      return {
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        border: "border-l-amber-400",
        dot: "bg-amber-400",
        label: "Shortlisted",
        expanded: "bg-amber-50 border-amber-200",
        text: "text-amber-800",
      };
    case "REJECTED":
      return {
        badge: "bg-red-50 text-red-600 ring-1 ring-red-200",
        border: "border-l-red-400",
        dot: "bg-red-400",
        label: "Not Selected",
        expanded: "bg-red-50 border-red-200",
        text: "text-red-700",
      };
    case "HIRED":
      return {
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        border: "border-l-emerald-400",
        dot: "bg-emerald-400",
        label: "Hired",
        expanded: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-800",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-600",
        border: "border-l-gray-300",
        dot: "bg-gray-300",
        label: status,
        expanded: "bg-gray-50 border-gray-200",
        text: "text-gray-700",
      };
  }
};

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ label, count, colorClass, ringClass }) {
  const animated = useCountUp(count);
  return (
    <div
      className={`relative bg-white rounded-2xl p-5 flex flex-col items-center justify-center gap-1 shadow-sm ring-1 ${ringClass} overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-violet-50 to-transparent rounded-2xl" />
      <span className={`text-4xl font-black tabular-nums ${colorClass}`}>
        {animated}
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </div>
  );
}

/* ─── Application Card ───────────────────────────────────────────────────── */
function AppCard({ app, expanded, onToggle }) {
  const s = statusConfig(app.status);

  return (
    <div
      data-scroll
      data-scroll-speed="0.5"
      className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 border-l-4 ${s.border} overflow-hidden hover:shadow-md transition-shadow duration-300`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="text-base font-bold text-gray-900 truncate">
              {app.jobTitle}
            </h4>
            <p className="text-sm font-semibold text-violet-600 mt-0.5">
              {app.company}
            </p>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Applied{" "}
              {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={onToggle}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 ${s.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
            <svg
              className={`w-3 h-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          {app.status === "SHORTLISTED" && app.interviewDate && (
            <div className={`mx-6 mb-6 p-4 rounded-xl border ${s.expanded}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${s.text} mb-3`}>
                Interview Details
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: "📅", label: "Date", value: app.interviewDate },
                  { icon: "🕐", label: "Time", value: app.interviewTime },
                  { icon: "📍", label: "Mode", value: app.interviewMode },
                  { icon: "🔄", label: "Rounds", value: app.interviewRounds },
                ].map((d) => (
                  <div key={d.label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{d.label}</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                      <span>{d.icon}</span> {d.value}
                    </span>
                  </div>
                ))}
              </div>
              {app.meetingLink && (
                <a
                  href={app.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Interview
                </a>
              )}
            </div>
          )}

          {app.status === "HIRED" && (
            <div className={`mx-6 mb-6 p-4 rounded-xl border ${s.expanded}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${s.text} mb-3`}>
                Offer Details
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {[
                  { icon: "💰", label: "Salary", value: app.salary },
                  { icon: "🏢", label: "Location", value: app.officeLocation },
                  { icon: "🗓", label: "Joining", value: app.joiningDate },
                ].map((d) => (
                  <div key={d.label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{d.label}</span>
                    <span className="font-semibold text-gray-800">{d.icon} {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {app.status === "REJECTED" && (
            <div className={`mx-6 mb-6 p-4 rounded-xl border ${s.expanded}`}>
              <p className="text-sm text-red-600 leading-relaxed">
                Thank you for taking the time to apply. We encourage you to keep going — the right role is out there.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function CandidateDashboard() {
  const navigate = useNavigate();
  const email         = localStorage.getItem("email");
  const candidateId   = localStorage.getItem("userId");
  const candidateName = localStorage.getItem("userName");

  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  const scrollRef = useRef(null);
  useLocomotiveScroll(scrollRef);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (!token) { navigate("/login"); return; }
    if (role === "RECRUITER") { navigate("/recruiter-dashboard"); return; }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get(`/applications/candidate/${candidateId}`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Applied",     status: "APPLIED",     colorClass: "text-blue-500",    ringClass: "ring-blue-100"    },
    { label: "Shortlisted", status: "SHORTLISTED", colorClass: "text-amber-500",   ringClass: "ring-amber-100"   },
    { label: "Hired",       status: "HIRED",       colorClass: "text-emerald-500", ringClass: "ring-emerald-100" },
    { label: "Rejected",    status: "REJECTED",    colorClass: "text-red-400",     ringClass: "ring-red-100"     },
  ];

  const initials = candidateName
    ? candidateName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div
      ref={scrollRef}
      data-scroll-container
      className="min-h-screen bg-[#F7F6FB] font-['Inter',sans-serif]"
    >
      <CandidateNavbar />

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div
        data-scroll
        data-scroll-speed="-2"
        className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#1a1040] to-[#0D1B2A] px-6 pt-16 pb-24"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-violet-900/40 select-none">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0D1B2A]" />
            </div>
            <div>
              <p className="text-violet-300 text-xs font-semibold uppercase tracking-widest mb-0.5">
                Welcome back
              </p>
              <h1 className="text-2xl font-extrabold text-white leading-tight">
                {candidateName || "Candidate"}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">{email}</p>
            </div>
          </div>

          <Link
            to="/jobs"
            className="group hidden sm:inline-flex items-center gap-2 bg-white/10 hover:bg-violet-600 backdrop-blur-sm text-white font-semibold text-sm px-5 py-3 rounded-2xl border border-white/10 hover:border-violet-500 transition-all duration-300 shadow-lg"
          >
            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Jobs
          </Link>
        </div>
      </div>

      {/* ── Content pulled up over header ──────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 pb-16 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <StatCard
              key={s.status}
              label={s.label}
              count={applications.filter((a) => a.status === s.status).length}
              colorClass={s.colorClass}
              ringClass={s.ringClass}
            />
          ))}
        </div>

        {/* ── Section heading + History button ─────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">My Applications</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {applications.length} total · click a status badge to expand
            </p>
          </div>

          {/* ── History button ── */}
          <button
            onClick={() => navigate("/application-history")}
            className="group inline-flex items-center gap-2 bg-[#1a1040] hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-violet-800 hover:border-violet-500 transition-all duration-300 shadow-sm hover:shadow-violet-900/40 hover:shadow-md"
          >
            {/* clock / archive icon */}
            <svg
              className="w-3.5 h-3.5 text-violet-400 group-hover:text-white transition-colors duration-200"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">View History</span>
            <span className="sm:hidden">History</span>
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border-l-4 border-l-gray-200 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && applications.length === 0 && (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm ring-1 ring-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No applications yet</h3>
            <p className="text-sm text-gray-400 mb-6">Start applying to track your progress here.</p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Explore open roles →
            </Link>
          </div>
        )}

        {/* Application cards */}
        <div className="space-y-3">
          {!loading &&
            applications.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                expanded={expandedCard === app.id}
                onToggle={() =>
                  setExpandedCard(expandedCard === app.id ? null : app.id)
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}
