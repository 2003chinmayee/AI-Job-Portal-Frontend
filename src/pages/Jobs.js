 
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';


function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem('email');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await API.get('/jobs');
      setJobs(response.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchJobs();
      return;
    }
    try {
      const response = await API.get(`/jobs/search?keyword=${search}`);
      setJobs(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
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

      {/* Hero / Search */}
      <div className="bg-indigo-600 py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Find Your Dream Job</h2>
          <p className="text-indigo-100 mb-6">Powered by AI to match you with the best opportunities</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title (e.g. Java, React)..."
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Job List */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {jobs.length} Jobs Found
        </h3>

        {loading && <p className="text-gray-500">Loading jobs...</p>}

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{job.title}</h4>
                  <p className="text-indigo-600 font-medium">{job.company}</p>
                  <p className="text-gray-500 text-sm mt-1">📍 {job.location}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {job.salary}
                </span>
              </div>
              <p className="text-gray-600 mt-3 text-sm line-clamp-2">{job.description}</p>
              <div className="flex gap-2 mt-3">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                  {job.jobType}
                </span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                  {job.experience} experience
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Jobs;