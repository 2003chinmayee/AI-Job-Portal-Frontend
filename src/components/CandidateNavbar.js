import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

/* ─── Icons (inline SVG to avoid extra deps) ─────────────────────────────── */
const BellIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);
const GridIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const BriefcaseIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
const SparkleIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);
const UserIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const LogoutIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

/* ─── Nav links config ───────────────────────────────────────────────────── */
const NAV_LINKS = [
  { path: "/dashboard", label: "Dashboard", icon: <GridIcon /> },
  { path: "/jobs", label: "Jobs", icon: <BriefcaseIcon /> },
  { path: "/resume-analyzer", label: "AI Resume", icon: <SparkleIcon /> },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function CandidateNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef(null);

  const email = localStorage.getItem("email");
  const candidateName = localStorage.getItem("userName");
  const token = localStorage.getItem("token");

  const [unreadCount, setUnreadCount] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* scroll-aware glass effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* unread notifications */
  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.REACT_APP_API_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count || 0))
      .catch(() => {});
  }, [token, location.pathname]); // 👈 only this line changes

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const initial = candidateName?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300 ease-in-out
          ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-sm shadow-violet-100/50 border-b border-white/60"
              : "bg-white border-b border-gray-100"
          }
        `}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* ── Brand ── */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-md shadow-violet-200 group-hover:shadow-violet-300 transition-shadow">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-[0.95rem] font-extrabold tracking-tight text-gray-900">
              AI<span className="text-violet-600">Jobs</span>
            </span>
          </Link>

          {/* ── Center nav links (desktop) ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ path, label, icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200 group
                    ${
                      isActive
                        ? "text-violet-700 bg-violet-50"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  <span
                    className={`transition-colors duration-200 ${isActive ? "text-violet-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  >
                    {icon}
                  </span>
                  {label}
                  {/* Active underline pill */}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-violet-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right section ── */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <Link
              to="/notifications"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200"
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Avatar dropdown */}
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className={`
                  flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl border transition-all duration-200
                  ${
                    dropOpen
                      ? "bg-violet-50 border-violet-200"
                      : "bg-gray-50 border-gray-200 hover:border-violet-200 hover:bg-violet-50"
                  }
                `}
                aria-expanded={dropOpen}
                aria-haspopup="true"
              >
                {/* Avatar circle */}
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-black select-none shadow-sm">
                  {initial}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-800 max-w-[90px] truncate">
                  {candidateName?.split(" ")[0] || "Me"}
                </span>
                <svg
                  className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown panel */}
              <div
                className={`
                  absolute top-[calc(100%+8px)] right-0 w-60
                  bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100
                  overflow-hidden origin-top-right
                  transition-all duration-200 ease-out
                  ${dropOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
                `}
              >
                {/* User header */}
                <div className="p-4 bg-gradient-to-br from-violet-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-violet-200 shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {candidateName || "Candidate"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{email}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Menu items */}
                <div className="p-1.5">
                  <Link
                    to="/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 font-medium hover:bg-violet-50 hover:text-violet-700 transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center text-gray-500 group-hover:text-violet-600 transition-colors">
                      <UserIcon />
                    </span>
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 font-medium hover:bg-violet-50 hover:text-violet-700 transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center text-gray-500 group-hover:text-violet-600 transition-colors">
                      <GridIcon />
                    </span>
                    Dashboard
                  </Link>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="p-1.5">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                      <LogoutIcon />
                    </span>
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-violet-600 hover:bg-violet-50 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${mobileOpen ? "max-h-72 border-t border-gray-100" : "max-h-0"}
          `}
        >
          <div className="px-4 py-3 space-y-1 bg-white">
            {NAV_LINKS.map(({ path, label, icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span
                    className={isActive ? "text-violet-500" : "text-gray-400"}
                  >
                    {icon}
                  </span>
                  {label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div className="h-16" />
    </>
  );
}
