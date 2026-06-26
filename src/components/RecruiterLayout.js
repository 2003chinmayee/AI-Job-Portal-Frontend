import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const NAV = [
  { to: "/recruiter-dashboard", icon: "⬡", label: "Dashboard" },
  { to: "/my-jobs",             icon: "briefcase", label: "My Jobs" },
  { to: "/post-job",            icon: "plus", label: "Post Job" },
  { to: "/job-history",         icon: "clock", label: "History" },
];

function NavIcon({ type }) {
  if (type === "briefcase") return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    </svg>
  );
  if (type === "plus") return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
    </svg>
  );
  if (type === "clock") return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/>
    </svg>
  );
  // dashboard hex
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/>
    </svg>
  );
}

export default function RecruiterLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "";
  const initials = email.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#050B1F] text-white flex font-['Inter',sans-serif]">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#080F24] border-r border-white/[0.06]
        flex flex-col transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black">
              AI
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Job Portal</p>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest mt-0.5">Recruiter</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden absolute top-5 right-4 text-gray-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map(({ to, icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${active
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/25"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"}`}>
                <span className={active ? "text-indigo-400" : "text-gray-500"}>
                  <NavIcon type={icon} />
                </span>
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"/>}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-5 border-t border-white/[0.06] pt-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-200 truncate">{email}</p>
              <p className="text-[10px] text-gray-500">Recruiter</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Overlay (mobile) ── */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)}/>}

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar (mobile only) */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-4 px-5 py-4
          bg-[#080F24]/90 backdrop-blur border-b border-white/[0.06]">
          <button onClick={() => setOpen(true)}
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <span className="text-sm font-semibold">AI Job Portal</span>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
