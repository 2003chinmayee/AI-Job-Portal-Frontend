import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../api/axios";
import RecruiterNavbar from "../components/RecruiterNavbar";

const emptyDetails = {
  interviewDate: "",
  interviewTime: "",
  interviewMode: "Google Meet",
  meetingLink: "",
  joiningDate: "",
  contactPerson: "",
  contactEmail: "",
  salary: "",
  officeLocation: "",
};

const STATUS_CFG = {
  APPLIED: {
    label: "Applied",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  HIRED: {
    label: "Hired",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

function scoreColor(s) {
  return s >= 70
    ? "text-emerald-600"
    : s >= 45
      ? "text-amber-500"
      : "text-red-500";
}
function scoreBg(s) {
  return s >= 70 ? "bg-emerald-500" : s >= 45 ? "bg-amber-400" : "bg-red-400";
}
function splitCsv(v) {
  return !v || v === "None"
    ? []
    : v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
function fmtDate(v) {
  return v
    ? new Date(v).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

export default function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "";

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [expandedId, setExpandedId] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionDetails, setActionDetails] = useState(emptyDetails);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const [jobRes, appRes] = await Promise.all([
        API.get(`/jobs/${jobId}`),
        API.get(`/recruiter/jobs/${jobId}/ranked-applications`),
      ]);
      setJob(jobRes.data);
      setApplicants(appRes.data || []);
    } catch (e) {
      console.error(e);
      setMessage({ text: "Could not load data.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    loadData();
  }, [loadData, navigate]);

  const aiStats = useMemo(() => {
    const scored = applicants.filter((a) => a.aiScore != null && a.aiScore > 0);
    return {
      best: scored.length
        ? Math.max(...scored.map((a) => Number(a.aiScore)))
        : null,
      avg: scored.length
        ? Math.round(
            scored.reduce((s, a) => s + Number(a.aiScore), 0) / scored.length,
          )
        : null,
    };
  }, [applicants]);

  const analyze = async () => {
    setAnalyzing(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await API.post(`/recruiter/jobs/${jobId}/analyze-resumes`);
      setApplicants(res.data.applications || []);
      setMessage({
        text: `✅ AI analysis complete for ${res.data.totalApplicants || 0} applicants.`,
        type: "success",
      });
    } catch (e) {
      setMessage({
        text: e.response?.data?.error || "AI analysis failed.",
        type: "error",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const openAction = (app, status) => {
    if (status === "REJECTED") {
      doReject(app);
      return;
    }
    setActionModal({ app, status });
    setActionDetails({
      ...emptyDetails,
      contactEmail: email,
      salary: job?.salary || "",
      officeLocation: job?.location || "",
    });
  };

  const doReject = async (app) => {
    if (!window.confirm(`Send rejection email to ${app.candidateName}?`))
      return;
    setSubmitting(true);
    try {
      await API.put(`/recruiter/reject/${app.id}`);
      setMessage({
        text: `Rejection email sent to ${app.candidateName}.`,
        type: "success",
      });
      loadData();
    } catch (e) {
      setMessage({
        text: e.response?.data?.error || "Failed to reject.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitAction = async (e) => {
    e.preventDefault();
    if (!actionModal) return;
    setSubmitting(true);
    try {
      const url =
        actionModal.status === "SHORTLISTED"
          ? `/recruiter/shortlist/${actionModal.app.id}`
          : `/recruiter/hire/${actionModal.app.id}`;
      await API.put(url, actionDetails);
      setMessage({
        text: `${actionModal.status === "SHORTLISTED" ? "Shortlist" : "Hire"} email sent to ${actionModal.app.candidateName}.`,
        type: "success",
      });
      setActionModal(null);
      loadData();
    } catch (e) {
      setMessage({ text: e.response?.data?.error || "Failed.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6FB] font-['Inter',sans-serif]">
      <RecruiterNavbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          to="/my-jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400
          hover:text-violet-600 transition-colors mb-6"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to My Jobs
        </Link>

        {/* Job header */}
        {job && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">
                  {job.title}
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
                  <span className="text-violet-600 font-semibold">
                    {job.company}
                  </span>
                  <span>·</span>
                  <span>📍 {job.location}</span>
                  {job.experience && (
                    <>
                      <span>·</span>
                      <span>{job.experience}</span>
                    </>
                  )}
                  {job.salary && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-600 font-semibold">
                        {job.salary}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={analyze}
                disabled={analyzing || loading}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white
                  text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {analyzing ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Analyzing…
                  </>
                ) : (
                  <>
                    <span>🤖</span> Run AI Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && applicants.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              ["Total Applicants", applicants.length, "text-violet-600"],
              [
                "Best AI Match",
                aiStats.best != null ? `${Math.round(aiStats.best)}%` : "—",
                "text-emerald-600",
              ],
              [
                "Avg AI Score",
                aiStats.avg != null ? `${aiStats.avg}%` : "—",
                "text-amber-500",
              ],
            ].map(([label, val, color]) => (
              <div
                key={label}
                className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  {label}
                </p>
                <p className={`text-2xl font-black ${color}`}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Message */}
        {message.text && (
          <div
            className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium border
            ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : message.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-indigo-50 border-indigo-200 text-indigo-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-white animate-pulse shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && applicants.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-14 text-center">
            <div className="text-3xl mb-3">📬</div>
            <h3 className="font-bold text-gray-800 mb-1">No applicants yet</h3>
            <p className="text-gray-400 text-sm">
              Candidates will appear here once they apply.
            </p>
          </div>
        )}

        {/* Ranked list */}
        {!loading && applicants.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">
              Ranked by AI Score · {applicants.length} candidate
              {applicants.length !== 1 ? "s" : ""}
            </p>
            {applicants.map((app, index) => {
              const score =
                app.aiScore != null ? Math.round(Number(app.aiScore)) : null;
              const open = expandedId === app.id;
              const scfg = STATUS_CFG[app.status] || STATUS_CFG.APPLIED;

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-2xl shadow-sm transition-all duration-200
                    ${open ? "ring-2 ring-violet-300 shadow-md" : "ring-1 ring-gray-100 hover:ring-gray-200"}`}
                >
                  {/* ── Collapsed row ── */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    {/* Rank */}
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                      text-xs font-black select-none
                      ${
                        index === 0
                          ? "bg-amber-100 text-amber-700"
                          : index === 1
                            ? "bg-gray-100 text-gray-500"
                            : index === 2
                              ? "bg-orange-50 text-orange-600"
                              : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      #{index + 1}
                    </span>

                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
                      flex items-center justify-center text-white text-sm font-black select-none"
                    >
                      {(app.candidateName || "?").charAt(0).toUpperCase()}
                    </div>

                    {/* Name + email */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setExpandedId(open ? null : app.id)}
                    >
                      <p className="font-bold text-gray-900 truncate">
                        {app.candidateName || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {app.candidateEmail}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold
                      px-2.5 py-1 rounded-full border ${scfg.bg} ${scfg.border} ${scfg.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`}
                      />
                      {scfg.label}
                    </span>

                    {/* AI Score */}
                    <div className="flex-shrink-0 text-right w-16">
                      <p
                        className={`text-xl font-black ${score != null && score > 0 ? scoreColor(score) : "text-gray-300"}`}
                      >
                        {score != null && score > 0 ? `${score}%` : "—"}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide">
                        AI score
                      </p>
                    </div>

                    {/* Action buttons — icon circles, colored by current status */}
                    <div className="flex-shrink-0 flex items-center gap-2 ml-3">
                      {/* Shortlist — yellow star */}
                      <button
                        onClick={() => openAction(app, "SHORTLISTED")}
                        disabled={submitting}
                        title="Shortlist candidate"
                        className={`w-8 h-8 rounded-full border flex items-center justify-center
      transition-all duration-200 hover:scale-110 disabled:opacity-40
      disabled:cursor-not-allowed disabled:hover:scale-100
      ${
        app.status === "SHORTLISTED"
          ? "bg-amber-100 border-amber-300 text-amber-500 shadow-sm shadow-amber-100"
          : "bg-white border-gray-200 text-gray-300 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-500"
      }`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill={
                            app.status === "SHORTLISTED"
                              ? "currentColor"
                              : "none"
                          }
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                          />
                        </svg>
                      </button>

                      {/* Hire — green checkmark */}
                      <button
                        onClick={() => openAction(app, "HIRED")}
                        disabled={submitting}
                        title="Send offer"
                        className={`w-8 h-8 rounded-full border flex items-center justify-center
      transition-all duration-200 hover:scale-110 disabled:opacity-40
      disabled:cursor-not-allowed disabled:hover:scale-100
      ${
        app.status === "HIRED"
          ? "bg-emerald-100 border-emerald-300 text-emerald-500 shadow-sm shadow-emerald-100"
          : "bg-white border-gray-200 text-gray-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-500"
      }`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </button>

                      {/* Reject — red cross */}
                      <button
                        onClick={() => openAction(app, "REJECTED")}
                        disabled={submitting}
                        title="Reject candidate"
                        className={`w-8 h-8 rounded-full border flex items-center justify-center
      transition-all duration-200 hover:scale-110 disabled:opacity-40
      disabled:cursor-not-allowed disabled:hover:scale-100
      ${
        app.status === "REJECTED"
          ? "bg-red-100 border-red-300 text-red-500 shadow-sm shadow-red-100"
          : "bg-white border-gray-200 text-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-500"
      }`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Expand chevron */}
                    <button
                      onClick={() => setExpandedId(open ? null : app.id)}
                      className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors ml-1"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* ── Expanded details ── */}
                  <div
                    className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                        {/* Applied date + score bar */}
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-400">
                            Applied {fmtDate(app.appliedAt)}
                          </p>
                          {score != null && score > 0 && (
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${scoreBg(score)}`}
                                style={{ width: `${Math.min(score, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Cover letter */}
                        {app.coverLetter && (
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm italic text-gray-600 leading-relaxed">
                            "{app.coverLetter}"
                          </div>
                        )}

                        {/* Personal info grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            ["Education", app.education],
                            ["College", app.collegeName],
                            ["Year", app.yearOfPassing],
                            ["Phone", app.phone],
                            ["Gender", app.gender],
                            ["DOB", app.dateOfBirth],
                          ]
                            .filter(([, v]) => v)
                            .map(([l, v]) => (
                              <div
                                key={l}
                                className="bg-gray-50 rounded-xl p-3"
                              >
                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                                  {l}
                                </p>
                                <p className="font-semibold text-gray-800 text-xs">
                                  {v}
                                </p>
                              </div>
                            ))}
                        </div>

                        {/* Skills */}
                        {(app.skillsMatch || app.missingSkills) && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                                ✅ Matched Skills
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {splitCsv(app.skillsMatch).length === 0 ? (
                                  <span className="text-xs text-gray-400">
                                    None detected
                                  </span>
                                ) : (
                                  splitCsv(app.skillsMatch).map((s) => (
                                    <span
                                      key={s}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-full
                                      bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    >
                                      {s}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                                ⚠ Missing Skills
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {splitCsv(app.missingSkills).length === 0 ? (
                                  <span className="text-xs text-gray-400">
                                    None
                                  </span>
                                ) : (
                                  splitCsv(app.missingSkills).map((s) => (
                                    <span
                                      key={s}
                                      className="text-xs font-semibold px-2.5 py-1 rounded-full
                                      bg-red-50 text-red-600 border border-red-200"
                                    >
                                      {s}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AI insights */}
                        {(app.strengths ||
                          app.aiRecommendation ||
                          app.aiFeedback) && (
                          <div className="grid md:grid-cols-3 gap-3">
                            {[
                              ["💪 Strengths", app.strengths],
                              ["🎯 Recommendation", app.aiRecommendation],
                              ["📊 Breakdown", app.aiFeedback],
                            ]
                              .filter(([, v]) => v)
                              .map(([l, v]) => (
                                <div
                                  key={l}
                                  className="bg-gray-50 rounded-xl p-3"
                                >
                                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                                    {l}
                                  </p>
                                  <p className="text-gray-700 text-xs leading-relaxed">
                                    {v}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Action Modal ── */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
                  flex items-center justify-center text-white text-sm font-black"
                >
                  {(actionModal.app.candidateName || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-gray-900">
                    {actionModal.app.candidateName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {actionModal.app.candidateEmail}
                  </p>
                </div>
                <span
                  className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border
                  ${
                    actionModal.status === "SHORTLISTED"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {actionModal.status === "SHORTLISTED"
                    ? "⭐ Shortlisting"
                    : "🎉 Hiring"}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mt-3">
                {actionModal.status === "SHORTLISTED"
                  ? "Schedule Interview"
                  : "Send Offer Letter"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {actionModal.status === "SHORTLISTED"
                  ? "Fill in the interview details — candidate will receive a professional email."
                  : "Fill in the offer details — candidate will receive an offer letter email."}
              </p>
            </div>

            <form onSubmit={submitAction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {actionModal.status === "SHORTLISTED" ? (
                  <>
                    <Inp
                      label="Interview Date"
                      name="interviewDate"
                      type="date"
                      val={actionDetails.interviewDate}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required
                    />
                    <Inp
                      label="Interview Time"
                      name="interviewTime"
                      type="time"
                      val={actionDetails.interviewTime}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required
                    />
                    <Inp
                      label="Interview Mode"
                      name="interviewMode"
                      val={actionDetails.interviewMode}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g. Google Meet"
                    />
                    <Inp
                      label="Meeting Link"
                      name="meetingLink"
                      val={actionDetails.meetingLink}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      placeholder="https://meet.google.com/..."
                    />
                    <Inp
                      label="Interview Rounds"
                      name="interviewRounds"
                      type="number"
                      val={actionDetails.interviewRounds || ""}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      placeholder="e.g. 3"
                    />
                    <Inp
                      label="Contact Person"
                      name="contactPerson"
                      val={actionDetails.contactPerson}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required
                      placeholder="HR Manager name"
                    />
                  </>
                ) : (
                  <>
                    <Inp
                      label="Joining Date"
                      name="joiningDate"
                      type="date"
                      val={actionDetails.joiningDate}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required
                    />
                    <Inp
                      label="Office Location"
                      name="officeLocation"
                      val={actionDetails.officeLocation}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      placeholder="e.g. Pune, Maharashtra"
                    />
                    <Inp
                      label="Contact Person"
                      name="contactPerson"
                      val={actionDetails.contactPerson}
                      onChange={(e) =>
                        setActionDetails({
                          ...actionDetails,
                          [e.target.name]: e.target.value,
                        })
                      }
                      required
                      placeholder="HR Manager name"
                    />
                  </>
                )}
                <Inp
                  label="Offered Salary"
                  name="salary"
                  val={actionDetails.salary}
                  onChange={(e) =>
                    setActionDetails({
                      ...actionDetails,
                      [e.target.name]: e.target.value,
                    })
                  }
                  placeholder="e.g. 8 LPA"
                />
                <Inp
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  val={actionDetails.contactEmail}
                  onChange={(e) =>
                    setActionDetails({
                      ...actionDetails,
                      [e.target.name]: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600
                    text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold
                    transition-colors disabled:opacity-50 flex items-center justify-center gap-2
                    ${
                      actionModal.status === "SHORTLISTED"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Sending…
                    </>
                  ) : actionModal.status === "SHORTLISTED" ? (
                    "⭐ Send Interview Email"
                  ) : (
                    "🎉 Send Offer Email"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Inp({
  label,
  name,
  val,
  onChange,
  type = "text",
  required,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
        {label}
      </span>
      <input
        type={type}
        name={name}
        value={val}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900
          placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100
          transition-all"
      />
    </label>
  );
}
