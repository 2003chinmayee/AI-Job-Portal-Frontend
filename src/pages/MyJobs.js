import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import RecruiterNavbar from "../components/RecruiterNavbar";

export default function MyJobs() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "";

  const [jobs,    setJobs]    = useState([]);
  const [counts,  setCounts]  = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling,setToggling]= useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/jobs/recruiter/active?email=${email}`);
      setJobs(res.data);
      const c = {};
      await Promise.all(res.data.map(async job => {
        try { c[job.id] = (await API.get(`/applications/job/${job.id}/count`)).data; }
        catch { c[job.id] = 0; }
      }));
      setCounts(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggle = async (id) => {
    setToggling(id);
    try { await API.put(`/jobs/${id}/toggle`); await fetchJobs(); }
    catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  const active = jobs.filter(j => j.active);
  const closed = jobs.filter(j => !j.active);

  const JobCard = ({ job }) => (
    <div className={`bg-white rounded-2xl shadow-sm ring-1 p-5 transition-all hover:shadow-md
      ${job.active ? "ring-gray-100 border-l-4 border-l-violet-400" : "ring-gray-100 opacity-60"}`}>

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{job.title}</h3>
            {!job.active && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5
                rounded-full bg-gray-100 text-gray-500">Closed</span>
            )}
          </div>
          <p className="text-violet-600 text-sm font-semibold">{job.company}</p>
          <p className="text-gray-400 text-xs mt-0.5">📍 {job.location}</p>
        </div>
        {job.salary && (
          <span className="flex-shrink-0 text-xs font-bold text-emerald-700
            bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {job.salary}
          </span>
        )}
      </div>

      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{job.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.jobType && <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full">{job.jobType.replace("_"," ")}</span>}
        {job.experience && <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">{job.experience}</span>}
        {job.vacancies && <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">{job.vacancies} vacancies</span>}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span className="text-sm font-bold text-violet-600">{counts[job.id] || 0}</span>
          <span className="text-xs text-gray-400">applicants</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/applicants/${job.id}`}
            className="text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white
              border border-violet-200 hover:border-violet-600 px-3 py-1.5 rounded-lg transition-all">
            View Applicants
          </Link>
          <button onClick={() => toggle(job.id)} disabled={toggling === job.id}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50
              ${job.active
                ? "text-red-600 bg-red-50 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600"
                : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-600 hover:text-white"}`}>
            {toggling === job.id ? "…" : job.active ? "Close" : "Reopen"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F6FB] font-['Inter',sans-serif]">
      <RecruiterNavbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Jobs</h1>
            <p className="text-gray-400 text-sm mt-1">{jobs.length} total · {active.length} active</p>
          </div>
          {/* No Post Job button here — use navbar */}
        </div>

        {loading && <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-white animate-pulse shadow-sm"/>)}</div>}

        {!loading && jobs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-14 text-center">
            <div className="text-3xl mb-3">📭</div>
            <h3 className="font-bold text-gray-800 mb-1">No jobs posted yet</h3>
            <p className="text-gray-400 text-sm mb-5">Create your first listing to start hiring.</p>
            <Link to="/post-job"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              + Post Your First Job
            </Link>
          </div>
        )}

        {!loading && active.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400"/>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active · {active.length}</h2>
            </div>
            <div className="space-y-4">{active.map(j => <JobCard key={j.id} job={j}/>)}</div>
          </section>
        )}

        {!loading && closed.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-gray-300"/>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Closed · {closed.length}</h2>
            </div>
            <div className="space-y-4">{closed.map(j => <JobCard key={j.id} job={j}/>)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
