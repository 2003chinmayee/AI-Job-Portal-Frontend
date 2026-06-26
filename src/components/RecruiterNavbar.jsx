import { Link, useLocation, useNavigate } from "react-router-dom";

const LINKS = [
  { to: "/recruiter-dashboard", label: "Dashboard" },
  { to: "/my-jobs",             label: "My Jobs"   },
  { to: "/post-job",            label: "Post Job"  },
  { to: "/job-history",         label: "History"   },
];

export default function RecruiterNavbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const email     = localStorage.getItem("email") || "";

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* Brand */}
        <Link to="/recruiter-dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600
            flex items-center justify-center text-[11px] font-black text-white">
            AI
          </div>
          <span className="font-extrabold text-gray-900 text-sm tracking-tight">Job Portal</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500
            bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full ml-1">
            Recruiter
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {LINKS.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150
                  ${active
                    ? "bg-violet-600 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: email + logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-400 hidden md:block truncate max-w-[160px]">{email}</span>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400
              hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
