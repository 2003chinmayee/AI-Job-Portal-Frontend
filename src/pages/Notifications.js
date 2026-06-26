import React, { useState, useEffect, useCallback } from 'react';
import API from "../api/axios";
import CandidateNavbar from "../components/CandidateNavbar";

const TYPE_CFG = {
  APPLICATION_SUBMITTED: { icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  STATUS_UPDATE:         { icon: '📢', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  SHORTLISTED:           { icon: '⭐', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  HIRED:                 { icon: '🎉', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  REJECTED:              { icon: '❌', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  const init = async () => {
    await fetchNotifications();
    try {
      await API.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch(e) { console.error(e); }
  };
  init();
}, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch(e) { console.error(e); }
  };

  const markOneRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch(e) { console.error(e); }
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F7F6FB] font-['Inter',sans-serif]">
      <CandidateNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {unread > 0 ? `${unread} unread` : "All caught up!"}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="text-xs font-bold text-violet-600 hover:text-violet-800
                bg-violet-50 hover:bg-violet-100 border border-violet-200
                px-4 py-2 rounded-xl transition-all">
              Mark all read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-white animate-pulse shadow-sm ring-1 ring-gray-100"/>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-14 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="font-bold text-gray-800 mb-1">No notifications yet</h3>
            <p className="text-gray-400 text-sm">
              Apply for jobs to receive updates here.
            </p>
          </div>
        )}

        {/* Notification list */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map(n => {
              const cfg = TYPE_CFG[n.type] || TYPE_CFG.STATUS_UPDATE;
              return (
                <div key={n.id}
                  onClick={() => !n.read && markOneRead(n.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border
                    shadow-sm transition-all duration-200
                    ${n.read
                      ? "bg-white border-gray-100 cursor-default"
                      : "bg-white border-violet-200 ring-1 ring-violet-100 cursor-pointer hover:shadow-md"
                    }`}>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    text-lg flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-gray-900 text-sm">{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0"/>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{n.message}</p>
                    <p className="text-gray-400 text-[11px] mt-1.5">
                      {new Date(n.createdAt).toLocaleString('en-IN', {
                        day:'numeric', month:'short', year:'numeric',
                        hour:'2-digit', minute:'2-digit'
                      })}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {!n.read && (
                    <span className="flex-shrink-0 text-[10px] font-bold text-violet-600
                      bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
