import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

function AiRank() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
  try {
    const jobRes = await API.get(`/jobs/${jobId}`);
    setJob(jobRes.data);
  } catch (err) {
    console.error("Job fetch failed:", err);
  }

  try {
    const appRes = await API.get(`/recruiter/jobs/${jobId}/ranked-applications`);
    setApplicants(appRes.data);
  } catch (err) {
    console.error("Applicants fetch failed:", err);
    setMessage("Could not load applicants for this job.");
  } finally {
    setLoading(false);
  }
};

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    setMessage("");
    try {
      const response = await API.post(`/recruiter/jobs/${jobId}/analyze-resumes`);
      setApplicants(response.data.applications || []);
      setMessage(`AI analysis done for ${response.data.totalApplicants || 0} applicants.`);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "AI analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const scoreBg = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-white">

      {/* Header */}
      <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">
            AI Resume Ranking
          </p>
          <h1 className="text-2xl font-bold">
            {job ? job.title : "Loading..."}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/applicants/${jobId}`}
            className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/10 transition"
          >
            View Applicants
          </Link>
          <Link
            to="/my-jobs"
            className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/10 transition"
          >
            My Jobs
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Job Info Bar */}
        {job && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Company</p>
              <p className="font-semibold">{job.company}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Location</p>
              <p className="font-semibold">{job.location}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Experience</p>
              <p className="font-semibold">{job.experience}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase mb-1">Salary</p>
              <p className="font-semibold">{job.salary}</p>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-400">
            {applicants.length} candidate{applicants.length !== 1 ? "s" : ""} found
          </p>
          <button
            onClick={runAiAnalysis}
            disabled={analyzing}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold transition"
          >
            {analyzing ? "Analyzing resumes..." : "🤖 Run AI Analysis"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
            {message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-gray-400 text-sm">Loading applicants...</p>
        )}

        {/* Empty State */}
        {!loading && applicants.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-400">No applicants yet for this job.</p>
          </div>
        )}

        {/* Ranked List */}
        <div className="space-y-4">
          {applicants.map((app, index) => {
            const score = app.aiScore != null ? Math.round(app.aiScore) : null;
            return (
              <div
                key={app.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-gray-500 font-bold">
                        #{index + 1}
                      </span>
                      <h3 className="text-lg font-bold">
                        {app.candidateName}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm">{app.candidateEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-black ${score !== null ? scoreColor(score) : "text-gray-500"}`}>
                      {score !== null ? `${score}%` : "--"}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">AI Score</p>
                  </div>
                </div>

                {/* Score Bar */}
                {score !== null && (
                  <div className="h-1.5 bg-white/10 rounded-full mb-5">
                    <div
                      className={`h-full rounded-full ${scoreBg(score)}`}
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                )}

                {/* Skills */}
                {(app.skillsMatch || app.missingSkills) && (
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2">
                        Matched Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {splitCsv(app.skillsMatch).map((s) => (
                          <span key={s} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2">
                        Missing Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {splitCsv(app.missingSkills).map((s) => (
                          <span key={s} className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold">
                            ✗ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Recommendation */}
                {app.aiRecommendation && (
                  <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-300">
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      AI Recommendation
                    </p>
                    {app.aiRecommendation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

function splitCsv(value) {
  if (!value || value === "None") return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export default AiRank;