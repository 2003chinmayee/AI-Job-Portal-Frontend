import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const email = localStorage.getItem("email");
  const candidateId = localStorage.getItem("userId");
  const candidateName = localStorage.getItem("userName");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchJob();
  }, []);

  const fetchJob = async () => {
    try {
      const response = await API.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleApply = async () => {
    try {
      await API.post("/applications", {
        candidateId: Number(candidateId),
        jobId: job.id,
        candidateName: candidateName,
        candidateEmail: email,
        jobTitle: job.title,
        company: job.company,
        coverLetter: coverLetter || "I am very interested in this position!",
        status: "APPLIED",
      });
      setApplied(true);
      setMessage("Application submitted successfully! ✅");
    } catch (err) {
      setMessage(err.response?.data || "Already applied or error occurred!");
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading job details...</p>
      </div>
    );
  }

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
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Back Link */}
        <Link to="/jobs" className="text-indigo-600 mb-4 inline-block">
          ← Back to Jobs
        </Link>

        {/* Job Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
              <p className="text-indigo-600 font-semibold text-lg mt-1">
                {job.company}
              </p>
              <p className="text-gray-500 mt-1">📍 {job.location}</p>
            </div>
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
              {job.salary}
            </span>
          </div>

          <div className="flex gap-2 mb-6">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              {job.jobType}
            </span>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              {job.experience} experience
            </span>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Job Description</h3>
            <p className="text-gray-600">{job.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Requirements</h3>
            <p className="text-gray-600">{job.requirements}</p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg mb-4 text-sm ${applied ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
            >
              {message}
            </div>
          )}

          {/* Cover Letter */}
          {!applied && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
                placeholder="Why are you a good fit for this role?"
              />
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={handleApply}
            disabled={applied}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              applied
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {applied ? "✅ Applied" : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
