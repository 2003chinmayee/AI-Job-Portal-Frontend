import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import CandidateNavbar from "../components/CandidateNavbar";

/* ─── Locomotive Scroll ──────────────────────────────────────────────────── */
function useLocomotiveScroll(ref) {
  useEffect(() => {
    if (!ref.current) return;
    let scroll;
    (async () => {
      const { default: LocomotiveScroll } = await import("locomotive-scroll");
      scroll = new LocomotiveScroll({
        el: ref.current,
        smooth: true,
        multiplier: 0.85,
        lerp: 0.08,
      });
    })();
    return () => scroll?.destroy();
  }, [ref]);
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const LocationIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const ArrowIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/* ─── Company Avatar ─────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "from-violet-500 to-violet-700",
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-rose-500 to-rose-700",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-700",
];
function CompanyAvatar({ name, index }) {
  const grad = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const letters = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div
      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm`}
    >
      {letters}
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
      <div className="flex gap-4 items-start">
        <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-4 bg-gray-100 rounded w-2/5" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="w-16 h-6 bg-gray-100 rounded-full shrink-0" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex gap-2">
          <div className="h-7 w-24 bg-gray-100 rounded-xl" />
          <div className="h-7 w-20 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-8 w-24 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

/* ─── Job Card ───────────────────────────────────────────────────────────── */
function JobCard({ job, index, hasApplied, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-violet-200 shadow-sm hover:shadow-md hover:shadow-violet-100/50 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
    >
      {/* ── Row 1: Avatar + Info + Salary ── */}
      <div className="flex gap-3 items-start">
        <CompanyAvatar name={job.company} index={index} />

        {/* Title / company / location — grows to fill */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors leading-snug truncate">
            {job.title}
          </h4>
          <p className="text-xs font-semibold text-violet-600 mt-0.5">{job.company}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <LocationIcon />
            <span className="truncate">{job.location}</span>
          </div>
        </div>

        {/* Salary badge — always top right, never conflicts */}
        <span className="shrink-0 self-start inline-flex items-center bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg ring-1 ring-emerald-200 whitespace-nowrap">
          {job.salary}
        </span>
      </div>

      {/* ── Row 2: Description ── */}
      <p className="text-xs text-gray-500 mt-3.5 line-clamp-2 leading-relaxed pl-0">
        {job.description}
      </p>

      {/* ── Row 3: Tags + CTA (always on same line, never overlaps) ── */}
      <div className="flex items-center justify-between gap-3 mt-3.5 pt-3.5 border-t border-gray-50">

        {/* Tags */}
        <div className="flex flex-wrap gap-2 min-w-0">
          {job.jobType && (
            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg ring-1 ring-gray-200 whitespace-nowrap">
              <BriefcaseIcon />
              {job.jobType}
            </span>
          )}
          {job.experience && (
            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg ring-1 ring-gray-200 whitespace-nowrap">
              <ClockIcon />
              {job.experience}
            </span>
          )}
        </div>

        {/* CTA — one consistent design for both states */}
        {hasApplied ? (
          <span className="shrink-0 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3.5 py-2 rounded-xl ring-1 ring-emerald-200 whitespace-nowrap">
            <CheckIcon />
            Applied
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1.5 bg-violet-600 group-hover:bg-violet-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap shadow-sm shadow-violet-300">
            Apply Now
            <ArrowIcon />
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Jobs() {
  const navigate  = useNavigate();
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  const [jobs,          setJobs]          = useState([]);
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [focused,       setFocused]       = useState(false);

  const candidateId = localStorage.getItem("userId");

  useLocomotiveScroll(scrollRef);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      if (!candidateId) return;
      const res = await API.get(`/applications/candidate/${candidateId}`);
      setAppliedJobIds(res.data.map((a) => a.jobId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) { fetchJobs(); return; }
    setLoading(true);
    try {
      const res = await API.get(`/jobs/search?keyword=${search}`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const appliedCount = jobs.filter((j) => appliedJobIds.includes(j.id)).length;

  return (
    <div
      ref={scrollRef}
      data-scroll-container
      className="min-h-screen bg-[#F7F6FB]"
    >
      <CandidateNavbar />

      {/* ── Hero — NO data-scroll-speed on inner content (was causing hide) ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#1a1040] to-[#0D1B2A] px-6 pt-16 pb-32">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        {/* Content — z-10, NO locomotive speed offset so it never disappears */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-violet-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            {jobs.length > 0 ? `${jobs.length} roles live right now` : "Fetching live roles…"}
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            Find your next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
              opportunity
            </span>
          </h1>
          <p className="text-gray-400 text-sm mb-10 max-w-sm mx-auto">
            AI-matched roles from top companies. One click to apply.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className={`flex items-center max-w-xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/40 transition-all duration-200 ${focused ? "ring-2 ring-violet-400" : ""}`}
          >
            <div className="pl-4 text-gray-400 shrink-0">
              <SearchIcon />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search by title, skill, company…"
              className="flex-1 px-3 py-4 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="m-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-10 pb-36">

        {/* Stats strip */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-sm ring-1 ring-gray-100 mb-5">
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 leading-none">{jobs.length}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Roles</p>
            </div>
            <div className="w-px h-7 bg-gray-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600 leading-none">{appliedCount}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Applied</p>
            </div>
            <div className="w-px h-7 bg-gray-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-violet-600 leading-none">{jobs.length - appliedCount}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Open</p>
            </div>
          </div>

          {search && (
            <button
              onClick={() => { setSearch(""); fetchJobs(); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && jobs.length === 0 && (
            <div className="bg-white rounded-2xl p-14 text-center ring-1 ring-gray-100">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-50 flex items-center justify-center">
                <SearchIcon />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">No roles found</h3>
              <p className="text-sm text-gray-400 mb-5">Try a different keyword or clear your search.</p>
              <button
                onClick={() => { setSearch(""); fetchJobs(); }}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Show all roles
              </button>
            </div>
          )}

          {!loading &&
            jobs.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                index={i}
                hasApplied={appliedJobIds.includes(job.id)}
                onClick={() => navigate(`/jobs/${job.id}`)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
