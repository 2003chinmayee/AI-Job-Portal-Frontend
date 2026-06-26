import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import RecruiterNavbar from "../components/RecruiterNavbar";

const STATUS_CFG = {
  Completed: { color:"text-emerald-700", bg:"bg-emerald-50", border:"border-emerald-200", dot:"bg-emerald-500" },
  Expired:   { color:"text-red-600",     bg:"bg-red-50",     border:"border-red-200",     dot:"bg-red-500"     },
  Closed:    { color:"text-gray-500",    bg:"bg-gray-100",   border:"border-gray-200",    dot:"bg-gray-400"    },
};

export default function JobHistory() {
  const email = localStorage.getItem("email") || "";
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("ALL");

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      // ✅ Using new dedicated history endpoint
      const res = await API.get(`/jobs/recruiter/history?email=${email}`);
      setJobs(res.data || []);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

  const filtered = filter === "ALL" ? jobs : jobs.filter(j => j.status === filter);

  const counts = {
    Completed: jobs.filter(j => j.status === "Completed").length,
    Expired:   jobs.filter(j => j.status === "Expired").length,
    Closed:    jobs.filter(j => j.status === "Closed").length,
  };

  return (
    <div className="min-h-screen bg-[#F7F6FB] font-['Inter',sans-serif]">
      <RecruiterNavbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Job History</h1>
          <p className="text-gray-400 text-sm mt-1">Completed, expired and closed job postings</p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            ["ALL",       "All",       jobs.length,        "bg-violet-600 text-white border-violet-600", "bg-white border-gray-200 text-gray-500"],
            ["Completed", "Completed", counts.Completed,   "bg-emerald-50 border-emerald-200 text-emerald-700", "bg-white border-gray-200 text-gray-500"],
            ["Expired",   "Expired",   counts.Expired,     "bg-red-50 border-red-200 text-red-600",      "bg-white border-gray-200 text-gray-500"],
            ["Closed",    "Closed",    counts.Closed,      "bg-gray-100 border-gray-200 text-gray-600",  "bg-white border-gray-200 text-gray-500"],
          ].map(([val, label, count, activeClass, inactiveClass]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold transition-all
                ${filter === val ? activeClass : inactiveClass + " hover:border-gray-300"}`}>
              {label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10">{count}</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-white animate-pulse shadow-sm"/>)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-14 text-center">
            <div className="text-3xl mb-3">🗂️</div>
            <h3 className="font-bold text-gray-800 mb-1">
              {jobs.length === 0 ? "No history yet" : "No results for this filter"}
            </h3>
            <p className="text-gray-400 text-sm">
              {jobs.length === 0
                ? "Jobs that are completed, expired or closed will appear here."
                : "Try a different filter."}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Job Title","Company","Posted","Closed","Vacancies","Hired","Applicants","Status",""].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((job, i) => {
                  const cfg = STATUS_CFG[job.status] || STATUS_CFG.Closed;
                  return (
                    <tr key={job.jobId}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors
                        ${i === filtered.length - 1 ? "border-0" : ""}`}>
                      <td className="px-5 py-4 font-bold text-gray-900">{job.jobTitle}</td>
                      <td className="px-5 py-4 text-violet-600 text-xs font-semibold">{job.company}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{fmt(job.postedDate)}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{fmt(job.closingDate)}</td>
                      <td className="px-5 py-4 text-gray-700">{job.vacancies || "—"}</td>
                      <td className="px-5 py-4 text-emerald-600 font-bold">{job.hired}</td>
                      <td className="px-5 py-4 text-violet-600 font-semibold">{job.applicants}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          text-[11px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/applicants/${job.jobId}`}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline">
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
