import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

// ─── Locomotive Scroll CDN is loaded via index.html:
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css">
// <script src="https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js"></script>

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const scrollRef = useRef(null);
  const locoScrollRef = useRef(null);

  const email = localStorage.getItem("email");
  const candidateId = localStorage.getItem("userId");
  const candidateName = localStorage.getItem("userName");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchJob();
    checkIfApplied();
  }, []);

  // Init Locomotive Scroll after job loads
  useEffect(() => {
    if (!job || !scrollRef.current) return;

    if (typeof window !== "undefined" && window.LocomotiveScroll) {
      locoScrollRef.current = new window.LocomotiveScroll({
        el: scrollRef.current,
        smooth: true,
        multiplier: 0.9,
        lerp: 0.08,
      });

      locoScrollRef.current.on("scroll", ({ scroll }) => {
        setScrolled(scroll.y > 60);
      });
    }

    return () => {
      if (locoScrollRef.current) {
        locoScrollRef.current.destroy();
      }
    };
  }, [job]);

  const checkIfApplied = async () => {
    try {
      const response = await API.get(`/applications/candidate/${candidateId}`);
      const alreadyApplied = response.data.some(
        (app) => app.jobId === parseInt(id)
      );
      if (alreadyApplied) setApplied(true);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJob = async () => {
    try {
      const response = await API.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCoverLetterChange = (e) => {
    setCoverLetter(e.target.value);
    setCharCount(e.target.value.length);
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-violet-300 text-sm tracking-widest uppercase">
            Loading role...
          </p>
        </div>
      </div>
    );
  }

  // Requirements as array
  const reqList = job.requirements
    ? job.requirements.split(",").map((r) => r.trim()).filter(Boolean)
    : [];

  return (
    <div
      ref={scrollRef}
      data-scroll-container
      className="bg-[#0A0F1E] min-h-screen font-['Inter',sans-serif]"
    >
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0A0F1E]/90 backdrop-blur-md border-b border-white/5 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link to="/jobs" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M20 7H4C2.9 7 2 7.9 2 9v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 14H4V9h16v12zM16 1H8C6.9 1 6 1.9 6 3v4h2V3h8v4h2V3c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              AI<span className="text-violet-400">Jobs</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {[
              { label: "Jobs", path: "/jobs" },
              { label: "Dashboard", path: "/dashboard" },
              { label: "AI Resume", path: "/resume-analyzer" },
            ].map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200 tracking-wide"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero Header ── */}
      <div data-scroll-section className="relative pt-28 pb-16 px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Ghost company name */}
        <div
          data-scroll
          data-scroll-speed="-2"
          className="absolute top-16 left-1/2 -translate-x-1/2 text-[120px] font-black text-white/[0.03] whitespace-nowrap select-none pointer-events-none leading-none"
        >
          {job.company}
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Back link */}
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors mb-8 group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Openings
          </Link>

          {/* Title block */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              {/* Company badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30">
                  {job.company?.[0]?.toUpperCase()}
                </div>
                <span className="text-violet-400 font-semibold text-sm tracking-wide uppercase">
                  {job.company}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-white/50 text-sm">
                  <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {job.location}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-white/50 text-sm">{job.jobType?.replace("_", " ")}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-white/50 text-sm">{job.experience} exp</span>
              </div>
            </div>

            {/* Salary pill */}
            <div className="flex-shrink-0">
              <div className="inline-flex flex-col items-end gap-1">
                <span className="text-white/40 text-xs uppercase tracking-widest">Annual CTC</span>
                <span className="text-3xl font-black text-amber-400 tracking-tight">
                  {job.salary}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div data-scroll-section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* Left: Details */}
          <div className="space-y-6">

            {/* Tags Row */}
            <div className="flex flex-wrap gap-2">
              {reqList.map((req, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide"
                >
                  {req}
                </span>
              ))}
            </div>

            {/* Job Description */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-white font-bold text-lg">About this role</h2>
              </div>
              <p className="text-white/60 leading-relaxed text-[15px]">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-white font-bold text-lg">What we're looking for</h2>
              </div>
              <ul className="space-y-3">
                {reqList.length > 0 ? reqList.map((req, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/60 text-[15px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    {req}
                  </li>
                )) : (
                  <li className="text-white/60 text-[15px]">{job.requirements}</li>
                )}
              </ul>
            </div>

            {/* Perks strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "💼", label: job.jobType?.replace("_", " ") || "Full Time" },
                { icon: "📍", label: job.location },
                { icon: "⏱", label: job.experience + " exp" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-4 flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-white/50 text-xs text-center font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sticky Apply Card */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-7 space-y-6">

              {/* Applicant preview */}
              {candidateName && (
                <div className="flex items-center gap-3 pb-5 border-b border-white/[0.07]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {candidateName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{candidateName}</p>
                    <p className="text-white/40 text-xs">{email}</p>
                  </div>
                </div>
              )}

              {/* Status message */}
              {message && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                    applied
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  <span>{applied ? "✅" : "⚠️"}</span>
                  <span>{message}</span>
                </div>
              )}

              {/* Already applied state */}
              {applied ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
                    ✅
                  </div>
                  <p className="text-emerald-400 font-semibold">Application Submitted</p>
                  <p className="text-white/40 text-sm">You've already applied to this role. We'll be in touch!</p>
                </div>
              ) : (
                <>
                  {/* Cover letter */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-white/70 text-sm font-medium">
                        Cover Letter
                        <span className="text-white/30 ml-1">(optional)</span>
                      </label>
                      <span className="text-white/25 text-xs">{charCount}/500</span>
                    </div>
                    <textarea
                      value={coverLetter}
                      onChange={handleCoverLetterChange}
                      maxLength={500}
                      rows={5}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white/80 placeholder:text-white/20 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all duration-200 resize-none"
                      placeholder="What makes you a great fit for this role?"
                    />
                  </div>

                  {/* Apply button */}
                  <button
                    onClick={() => navigate(`/apply/${job.id}`)}
                    className="w-full group relative overflow-hidden rounded-xl py-4 font-bold text-white text-sm tracking-wide transition-all duration-300 bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      Apply for this role
                      <svg
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>

                  <p className="text-white/25 text-xs text-center leading-relaxed">
                    By applying you agree to our{" "}
                    <span className="text-violet-400/60 cursor-pointer hover:text-violet-400 transition-colors">
                      terms of service
                    </span>
                  </p>
                </>
              )}
            </div>

            {/* Share card */}
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex items-center justify-between">
              <span className="text-white/40 text-xs">Share this role</span>
              <div className="flex gap-3">
                {["linkedin", "twitter", "link"].map((platform) => (
                  <button
                    key={platform}
                    className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/[0.07] flex items-center justify-center transition-colors"
                    title={platform}
                  >
                    {platform === "link" ? (
                      <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    ) : (
                      <span className="text-white/40 text-[9px] font-bold uppercase">{platform[0]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div data-scroll-section className="border-t border-white/[0.05] py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-white/20 text-xs">© 2026 AIJobs Portal</span>
          <span className="text-white/20 text-xs">Posted via AI-matched hiring</span>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
