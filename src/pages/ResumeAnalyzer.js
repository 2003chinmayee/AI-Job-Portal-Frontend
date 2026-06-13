import jsPDF from "jspdf";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const email = localStorage.getItem("email");

  React.useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
  }
}, [navigate]);

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

  // Determine color based on score
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

  // Circular progress ring calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = score ? (score / 100) * circumference : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">AI Job Portal</h1>
        <div className="flex gap-4 items-center">
          <Link
            to="/jobs"
            className="text-gray-600 hover:text-indigo-600 font-medium"
          >
            Jobs
          </Link>
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-indigo-600 font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/resume-analyzer"
            className="text-gray-600 hover:text-indigo-600 font-medium"
          >
            AI Resume
          </Link>
          <span className="text-sm text-gray-500">{email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            🤖 AI Resume Analyzer
          </h2>
          <p className="text-gray-500 mt-2">
            Upload your resume and get an instant AI-powered ATS analysis
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleAnalyze}
          className="bg-white p-6 rounded-2xl shadow-sm mb-6"
        >
          <label className="block text-gray-700 font-medium mb-2">
            Upload Resume (PDF)
          </label>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
          />

          {resumeFile && (
            <p className="text-green-600 text-sm mb-3">
              Selected File: {resumeFile.name}
            </p>
          )}

          <label className="block text-gray-700 font-medium mb-2">
            Your Resume / Skills Text
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows="6"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            placeholder="Example: Java, Spring Boot, React, MySQL, REST APIs, 1 year experience as Software Developer Intern..."
          />

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mt-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "🤖 Analyzing with AI..." : "✨ Analyze My Resume"}
          </button>
        </form>

        {/* Result */}
        {analysis && (
          <div className="space-y-5 animate-fadeIn">
            {/* Score Card with Circular Progress */}
            <div className="bg-white rounded-2xl shadow border p-8 flex flex-col items-center">
              <div className="relative w-44 h-44">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="14"
                    fill="none"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke={getScoreColor()}
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-4xl font-extrabold"
                    style={{ color: getScoreColor() }}
                  >
                    {score}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">
                    out of 100
                  </span>
                </div>
              </div>

              <h3
                className="text-xl font-bold mt-4"
                style={{ color: getScoreColor() }}
              >
                {getScoreLabel()}
              </h3>

              <p className="text-gray-500 text-center mt-3 max-w-md">
                {analysis.summary}
              </p>
            </div>

            {/* Strong Skills */}
            <div className="bg-white rounded-2xl shadow border p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                ✅ Your Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {(analysis.strongSkills || []).map((skill, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-2xl shadow border p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                ⚠️ Skill Gaps to Fill
              </h4>
              <div className="flex flex-wrap gap-2">
                {(analysis.missingSkills || []).map((skill, i) => (
                  <span
                    key={i}
                    className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow border p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                💡 AI Recommendations
              </h4>
              <div className="space-y-3">
                {(analysis.recommendations || []).map((rec, i) => (
                  <div
                    key={i}
                    className="flex gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3"
                  >
                    <span className="flex-shrink-0 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-sm leading-6">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow"
            >
              📥 Download Analysis Report (PDF)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;
