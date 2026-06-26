import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobDetail from "./pages/JobDetail";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import Applicants from "./pages/Applicants";
import JobHistory from "./pages/JobHistory";
import CandidateDashboard from "./pages/CandidateDashboard";
import ApplyJob from "./pages/ApplyJob";
import Notifications from "./pages/Notifications";
import MyProfile from "./pages/MyProfile";
import ApplicationHistory from "./pages/ApplicationHistory";

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"        element={<Login />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Candidate ── */}
        <Route path="/jobs"                  element={<Jobs />} />
        <Route path="/jobs/:id"              element={<JobDetail />} />
        <Route path="/apply/:jobId"          element={<ApplyJob />} />
        <Route path="/dashboard"             element={<CandidateDashboard />} />
        <Route path="/resume-analyzer"       element={<ResumeAnalyzer />} />
        <Route path="/notifications"         element={<Notifications />} />
        <Route path="/profile"               element={<MyProfile />} />
        <Route path="/application-history"   element={<ApplicationHistory />} />

        {/* ── Recruiter (no layout wrapper — each page has its own navbar) ── */}
        <Route path="/recruiter-dashboard"   element={<RecruiterDashboard />} />
        <Route path="/post-job"              element={<PostJob />} />
        <Route path="/my-jobs"              element={<MyJobs />} />
        <Route path="/applicants/:jobId"     element={<Applicants />} />
        <Route path="/job-history"           element={<JobHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
