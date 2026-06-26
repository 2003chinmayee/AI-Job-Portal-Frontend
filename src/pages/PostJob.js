import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import RecruiterNavbar from "../components/RecruiterNavbar";

const INPUT = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all";

export default function PostJob() {
  const navigate = useNavigate();
  const email    = localStorage.getItem("email") || "";

  const [job, setJob] = useState({
    title:"", company:"", location:"", description:"",
    requirements:"", salary:"", jobType:"FULL_TIME",
    experience:"", vacancies:"", closingDate:"",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = e => setJob({...job, [e.target.name]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await API.post("/jobs", {...job, postedBy: email, active: true});
      setSuccess("Job posted successfully!");
      setTimeout(() => navigate("/my-jobs"), 1400);
    } catch { setError("Failed to post job. Please try again."); }
    finally { setLoading(false); }
  };

  const F = ({label, hint, children}) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F6FB] font-['Inter',sans-serif]">
      <RecruiterNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Post a Job</h1>
          <p className="text-gray-400 text-sm mt-1">Fill in the details to publish your opening.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <F label="Job Title">
              <input name="title" value={job.title} onChange={set} required placeholder="e.g. Java Developer" className={INPUT}/>
            </F>
            <F label="Company">
              <input name="company" value={job.company} onChange={set} required placeholder="e.g. TCS" className={INPUT}/>
            </F>
          </div>

          <F label="Location">
            <input name="location" value={job.location} onChange={set} required placeholder="e.g. Pune, Maharashtra" className={INPUT}/>
          </F>

          <F label="Description">
            <textarea name="description" value={job.description} onChange={set} rows={4} required
              placeholder="Describe the role and responsibilities…" className={INPUT+" resize-none"}/>
          </F>

          <F label="Requirements" hint="List skills separated by commas — AI uses this to rank candidates">
            <input name="requirements" value={job.requirements} onChange={set}
              placeholder="e.g. Java, Spring Boot, MySQL" className={INPUT}/>
          </F>

          <div className="grid grid-cols-2 gap-4">
            <F label="Salary">
              <input name="salary" value={job.salary} onChange={set} placeholder="e.g. 5–8 LPA" className={INPUT}/>
            </F>
            <F label="Experience">
              <input name="experience" value={job.experience} onChange={set} placeholder="e.g. 0–2 years" className={INPUT}/>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <F label="Vacancies">
              <input type="number" name="vacancies" value={job.vacancies} onChange={set} required min="1" placeholder="e.g. 3" className={INPUT}/>
            </F>
            <F label="Closing Date">
              <input type="date" name="closingDate" value={job.closingDate} onChange={set} required className={INPUT}/>
            </F>
          </div>

          <F label="Job Type">
            <select name="jobType" value={job.jobType} onChange={set} className={INPUT}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </F>

          <div className="border-t border-gray-100 pt-4 flex gap-3">
            <button type="button" onClick={() => navigate("/recruiter-dashboard")}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800
                hover:border-gray-300 text-sm font-semibold transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold
                transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Posting…</>
              ) : "Publish Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
