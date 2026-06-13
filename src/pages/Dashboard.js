 
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem('email');
  
  const candidateId = localStorage.getItem("userId");

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await API.get(`/applications/candidate/${candidateId}`);
      setApplications(response.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const statusColor = (status) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-700';
      case 'SHORTLISTED': return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'HIRED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">AI Job Portal</h1>
        <div className="flex gap-4 items-center">
          <Link to="/jobs" className="text-gray-600 hover:text-indigo-600 font-medium">Jobs</Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
          <Link to="/resume-analyzer" className="text-gray-600 hover:text-indigo-600 font-medium">AI Resume</Link>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-1">My Applications</h2>
        <p className="text-gray-500 mb-6">Track the status of jobs you've applied to</p>

        {loading && <p className="text-gray-500">Loading applications...</p>}

        {!loading && applications.length === 0 && (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
            <Link
              to="/jobs"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 inline-block"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{app.jobTitle}</h4>
                  <p className="text-indigo-600 font-medium">{app.company}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
              {app.coverLetter && (
                <p className="text-gray-600 mt-3 text-sm italic">"{app.coverLetter}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
