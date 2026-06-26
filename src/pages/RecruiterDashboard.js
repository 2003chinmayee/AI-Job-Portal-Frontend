import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import RecruiterNavbar from "../components/RecruiterNavbar";

/* ── Locomotive Scroll ─────────────────────────────────────────── */
function useLocomotiveScroll(ref) {
  useEffect(() => {
    let scroll;
    (async () => {
      const { default: LS } = await import("locomotive-scroll");
      scroll = new LS({ el: ref.current, smooth: true, lerp: 0.07, multiplier: 0.9 });
    })();
    return () => scroll?.destroy();
  }, [ref]);
}

/* ── Days left helper ──────────────────────────────────────────── */
function daysLeft(date) {
  if (!date) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  return Math.ceil((new Date(date) - t) / 86400000);
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
}

/* ── Single job row ────────────────────────────────────────────── */
function JobRow({ job, index }) {
  const days   = daysLeft(job.closingDate);
  const urgent = days !== null && days <= 3;
  const soon   = days !== null && days <= 7 && days > 3;

  const accentColor = urgent ? "#ef4444" : soon ? "#f59e0b" : "#8b5cf6";

  return (
    <Link
      to={`/applicants/${job.id}`}
      data-scroll
      data-scroll-speed={0.1 * (index % 3)}
      className="group block"
    >
      <div
        className="relative flex items-center gap-6 px-6 py-5
          bg-white rounded-2xl ring-1 ring-gray-100
          hover:ring-violet-200 hover:shadow-xl hover:shadow-violet-100/50
          transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
      >
        {/* Left accent line that grows on hover */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full
            transition-all duration-300 group-hover:top-0 group-hover:bottom-0"
          style={{ background: accentColor }}
        />

        {/* Index number */}
        <span
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
            text-[11px] font-black tracking-tight transition-colors duration-200"
          style={{
            background: `${accentColor}15`,
            color: accentColor,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Job title + type */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-[15px] truncate
            group-hover:text-violet-700 transition-colors duration-200">
            {job.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-violet-500 font-semibold">{job.company}</span>
            {job.location && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{job.location}</span>
              </>
            )}
            {job.jobType && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {job.jobType.replace("_", " ")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Salary */}
        {job.salary && (
          <div className="hidden md:block flex-shrink-0">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50
              border border-emerald-200 px-3 py-1 rounded-full">
              {job.salary}
            </span>
          </div>
        )}

        {/* Vacancies */}
        <div className="flex-shrink-0 text-center hidden sm:block">
          <p className="text-xl font-black text-gray-900 leading-none">{job.vacancies ?? "—"}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
            Vacancies
          </p>
        </div>

        {/* Closing */}
        <div className="flex-shrink-0 text-right">
          {days === null ? (
            <p className="text-xs text-gray-400">No deadline</p>
          ) : urgent ? (
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-black
                text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full
                animate-pulse">
                ⚠ {days}d left
              </span>
            </div>
          ) : soon ? (
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold
                text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                🔔 {days}d left
              </span>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-700">{fmtDate(job.closingDate)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{days}d remaining</p>
            </div>
          )}
        </div>

        {/* Arrow */}
        <svg
          className="flex-shrink-0 w-4 h-4 text-gray-300 group-hover:text-violet-500
            group-hover:translate-x-1 transition-all duration-200"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}

/* ── Main Dashboard ────────────────────────────────────────────── */
export default function RecruiterDashboard() {
  const email = localStorage.getItem("email") || "";
  const name  = email.split("@")[0];

  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  useLocomotiveScroll(scrollRef);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get(`/jobs/recruiter/active?email=${email}`);
      setJobs(res.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const urgent = jobs.filter(j => { const d = daysLeft(j.closingDate); return d !== null && d <= 3; }).length;

  return (
    <div ref={scrollRef} data-scroll-container
      className="min-h-screen bg-[#F7F6FB] font-['Inter',sans-serif]">
      <RecruiterNavbar />

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* ── Hero greeting ── */}
        <div data-scroll data-scroll-speed="1" className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3">
            Recruitment Dashboard
          </p>
          <h1 className="text-[42px] font-black text-gray-900 tracking-tight leading-none mb-2">
            Hey, <span className="text-transparent bg-clip-text
              bg-gradient-to-r from-violet-600 to-indigo-500">{name}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString("en-IN", {
              weekday:"long", day:"numeric", month:"long", year:"numeric"
            })}
            
          </p>
        </div>

        {/* ── Section label ── */}
        <div data-scroll data-scroll-speed="0.5"
          className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              Active Listings
            </h2>
            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600
              text-[10px] font-black flex items-center justify-center">
              {jobs.length}
            </span>
          </div>
         
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i}
                className="h-[72px] rounded-2xl bg-white animate-pulse shadow-sm ring-1 ring-gray-100"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && jobs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-50
              flex items-center justify-center text-2xl">📭</div>
            <h3 className="font-extrabold text-gray-800 mb-1">No active jobs</h3>
            <p className="text-gray-400 text-sm mb-6">Post a job to start receiving applications.</p>
            <Link to="/post-job"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700
                text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
              + Post New Job
            </Link>
          </div>
        )}

        {/* ── Job rows ── */}
        {!loading && jobs.length > 0 && (
          <div className="space-y-2.5">
            {jobs.map((job, i) => (
              <JobRow key={job.id} job={job} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
