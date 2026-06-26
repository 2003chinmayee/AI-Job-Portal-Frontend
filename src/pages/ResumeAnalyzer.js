import jsPDF from "jspdf";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import CandidateNavbar from "../components/CandidateNavbar";

/* ──────────────────────────────────────────────────────────────────
   Design notes:
   - Matches the AIJobs design system already used on Dashboard and
     Jobs: a deep navy→violet gradient hero panel, clean white cards
     with soft shadows and colored left-border accents, solid violet
     primary buttons (rounded-lg, normal size — not pill, not oversized),
     small uppercase pill badges, system sans throughout.
   - Hero gradient: #150F2E -> #2A1F55 -> #4B3196 (matches the
     dashboard/jobs banners). Primary action: #6D4FE0 / hover #5D3FD3.
     Success states use existing green/blue/amber/red from the rest
     of the app instead of a separate lime accent, so this page reads
     as the same product as Dashboard and Jobs.
   - Smooth in-page motion (section reveal, ring fill, drag state) is
     handled with native CSS transitions and simple effects, same
     reasoning as before on swapping in real Locomotive Scroll once
     wired into your build: replace the scroll-reveal classnames with
     a data-scroll attribute and a LocomotiveScroll instance once you
     have the library importable in your bundler.
   ────────────────────────────────────────────────────────────────── */

function useRevealKeyframes() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes popIn {
        0% { opacity: 0; transform: scale(0.96); }
        100% { opacity: 1; transform: scale(1); }
      }
      .reveal-up { animation: fadeUp 0.45s ease both; }
      .reveal-pop { animation: popIn 0.4s ease both; }
      textarea::placeholder { color: #9CA3AF; }
      @media (prefers-reduced-motion: reduce) {
        .reveal-up, .reveal-pop { animation: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
}

function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  useRevealKeyframes();

  // Presentational only: drag state for the upload dropzone
  const [isDragging, setIsDragging] = useState(false);
  // Presentational only: animated count-up display value for the score ring
  const [displayScore, setDisplayScore] = useState(0);

  const email = localStorage.getItem("email");

  React.useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Presentational: animate the score counting up once analysis lands
  useEffect(() => {
    if (score === null || score === undefined) {
      setDisplayScore(0);
      return;
    }
    let frame = 0;
    const totalFrames = 36;
    const target = score;
    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      setDisplayScore(Math.round(target * progress));
      if (progress >= 1) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [score]);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setAnalysis(null);
    setScore(null);

    try {
      let response;

      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);

        response = await API.post("/gemini/analyze-pdf", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await API.post("/gemini/analyze", resumeText, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }

      let raw = response.data;

      // If response is a string, clean and parse it
      if (typeof raw === "string") {
        raw = raw.trim();
        // Remove markdown code fences like ```json ... ```
        raw = raw
          .replace(/^```json/i, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();
        raw = JSON.parse(raw);
      }

      setAnalysis(raw);
      setScore(raw.score);
    } catch (err) {
      console.error(err);
      setError("AI analysis failed. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!analysis) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text("AI Resume Analysis Report", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(34, 139, 34);
    doc.text(`ATS Score: ${analysis.score}/100`, 14, 32);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary:", 14, 44);
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 180);
    doc.text(summaryLines, 14, 52);

    let y = 52 + summaryLines.length * 6 + 8;

    doc.setTextColor(22, 163, 74);
    doc.text("Strong Skills:", 14, y);
    y += 7;
    doc.setTextColor(0, 0, 0);
    const strongLines = doc.splitTextToSize(
      (analysis.strongSkills || []).join(", "),
      180,
    );
    doc.text(strongLines, 14, y);
    y += strongLines.length * 6 + 8;

    doc.setTextColor(217, 119, 6);
    doc.text("Missing Skills:", 14, y);
    y += 7;
    doc.setTextColor(0, 0, 0);
    const missingLines = doc.splitTextToSize(
      (analysis.missingSkills || []).join(", "),
      180,
    );
    doc.text(missingLines, 14, y);
    y += missingLines.length * 6 + 8;

    doc.setTextColor(79, 70, 229);
    doc.text("Recommendations:", 14, y);
    y += 7;
    doc.setTextColor(0, 0, 0);

    (analysis.recommendations || []).forEach((rec, i) => {
      const recLines = doc.splitTextToSize(`${i + 1}. ${rec}`, 180);
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(recLines, 14, y);
      y += recLines.length * 6 + 2;
    });

    doc.save("Resume_Analysis_Report.pdf");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/login");
  };

  // Determine color based on score (same thresholds as original)
  const getScoreColor = () => {
    if (score >= 75) return "#16a34a"; // green
    if (score >= 50) return "#f59e0b"; // yellow/orange
    return "#dc2626"; // red
  };

  const getScoreLabel = () => {
    if (score >= 75) return "Great Resume!";
    if (score >= 50) return "Good, Needs Improvement";
    return "Needs Major Improvements";
  };

  // ── Presentational helpers, same thresholds, app-consistent palette ──
  const getRingColor = () => {
    if (score >= 75) return "#22C55E"; // green — matches Hired/Applied accents elsewhere
    if (score >= 50) return "#F59E0B"; // amber — matches Shortlisted accent
    return "#EF4444"; // red — matches Rejected accent
  };

  const getBadgeStyle = () => {
    if (score >= 75) return { bg: "#DCFCE7", text: "#15803D" };
    if (score >= 50) return { bg: "#FEF3C7", text: "#B45309" };
    return { bg: "#FEE2E2", text: "#B91C1C" };
  };

  // Circular progress ring calculations
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const progress = score ? (displayScore / 100) * circumference : 0;
  const ringColor = getRingColor();
  const badgeStyle = getBadgeStyle();

  // Drag-and-drop handlers (presentational wrapper around the same
  // setResumeFile state setter the original file-input used)
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setResumeFile(file);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      {/* Navbar */}
      <CandidateNavbar />

      {/* Hero banner — matches Dashboard/Jobs navy-violet gradient */}
      <div className="bg-gradient-to-br from-[#150F2E] via-[#241A4A] to-[#4B3196] px-6 sm:px-10 py-12 sm:py-14">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B6FF0]" />
            AI-powered analysis
          </span>
          <h1 className="text-3xl sm:text-[40px] font-bold text-white leading-tight">
            Resume <span className="text-[#A78BFA]">analyzer</span>
          </h1>
          <p className="text-white/60 mt-3 text-base">
            Upload your resume and get an instant AI-powered ATS analysis.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 -mt-7 pb-12">
        {/* Input Form */}
        <form
          onSubmit={handleAnalyze}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-7 mb-6 relative z-10"
        >
          <label className="block text-gray-800 font-semibold text-sm mb-3">
            Upload resume (PDF)
          </label>

          {/* Dropzone-styled file upload — same input, same onChange logic */}
          <label
            htmlFor="resume-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex items-center gap-4 border-2 border-dashed rounded-xl px-5 py-5 mb-5 cursor-pointer transition-colors duration-150 ${
              isDragging
                ? "border-[#6D4FE0] bg-[#6D4FE0]/5"
                : resumeFile
                ? "border-gray-300 bg-gray-50"
                : "border-gray-300 hover:border-[#6D4FE0]/50 hover:bg-gray-50"
            }`}
          >
            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-10 h-10 rounded-lg bg-[#6D4FE0]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#6D4FE0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" />
              </svg>
            </div>
            <div className="min-w-0">
              {resumeFile ? (
                <>
                  <p className="font-semibold text-sm text-gray-800 truncate">{resumeFile.name}</p>
                  <p className="text-xs text-gray-500">Click to choose a different file</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm text-gray-800">Drop your PDF here, or click to browse</p>
                  <p className="text-xs text-gray-500">PDF only</p>
                </>
              )}
            </div>
          </label>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">or paste text</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <label className="block text-gray-800 font-semibold text-sm mb-3">
            Your resume / skills text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows="5"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6D4FE0]/30 focus:border-[#6D4FE0] transition-colors resize-none"
            placeholder="Example: Java, Spring Boot, React, MySQL, REST APIs, 1 year experience as Software Developer Intern..."
          />

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-700 border border-red-200 p-3.5 rounded-xl mt-4 text-sm font-medium reveal-up">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 bg-[#6D4FE0] text-white py-3 rounded-lg font-semibold text-[15px] hover:bg-[#5D3FD3] transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analyzing with AI…
              </span>
            ) : (
              "Analyze my resume"
            )}
          </button>
        </form>

        {/* Result */}
        {analysis && (
          <div className="space-y-5">
            {/* Score Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center reveal-pop">
              <div className="relative w-44 h-44">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth="14"
                    fill="none"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke={ringColor}
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.2,.8,.3,1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tabular-nums" style={{ color: ringColor }}>
                    {displayScore}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">out of 100</span>
                </div>
              </div>

              <span
                className="mt-5 px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
              >
                {getScoreLabel()}
              </span>

              <p className="text-gray-500 text-center mt-4 max-w-md text-sm leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Strong Skills */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 reveal-up">
              <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Your strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {(analysis.strongSkills || []).map((skill, i) => (
                  <span
                    key={i}
                    className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 reveal-up">
              <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.59L1.82 18a1.5 1.5 0 001.3 2.25h17.76a1.5 1.5 0 001.3-2.25L13.66 3.59a1.5 1.5 0 00-2.6 0z" />
                  </svg>
                </span>
                Skill gaps to fill
              </h4>
              <div className="flex flex-wrap gap-2">
                {(analysis.missingSkills || []).map((skill, i) => (
                  <span
                    key={i}
                    className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 reveal-up">
              <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6D4FE0]/10 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#6D4FE0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.3.25.5.6.5 1.1v.5h6v-.5c0-.5.2-.85.5-1.1A6 6 0 0012 3z" />
                  </svg>
                </span>
                AI recommendations
              </h4>
              <div className="space-y-3">
                {(analysis.recommendations || []).map((rec, i) => (
                  <div
                    key={i}
                    className="flex gap-3 bg-[#6D4FE0]/5 border border-[#6D4FE0]/10 rounded-xl p-3.5"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-[#6D4FE0] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-sm leading-6">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button — fixed: explicit pixel sizing on the icon
                instead of an invalid Tailwind class (w-4.5 isn't a real
                utility, which is why it rendered oversized before) */}
            <button
              onClick={handleDownload}
              className="w-full bg-white border border-gray-200 text-gray-800 py-3 rounded-lg font-semibold text-[15px] hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <svg style={{ width: 18, height: 18 }} className="text-[#6D4FE0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12L12 16.5L16.5 12M12 16.5V3" />
              </svg>
              Download analysis report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
