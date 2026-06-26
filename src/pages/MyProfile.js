import React, { useState, useEffect, useCallback } from 'react';
import CandidateNavbar from "../components/CandidateNavbar";

export default function MyProfile() {
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', location: '', bio: '', skills: '',
    resumeUrl: '', education: '', experience: ''
  });
  const [form,    setForm]    = useState({});
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  // Try all common token key names your app might use
  const getToken = () =>
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    '';

  const fetchProfile = useCallback(async () => {
    setError('');
    const token = getToken();

    if (!token) {
      setError('Not logged in — no token found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to load profile (${res.status}): ${text}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProfile(data);
      setForm(data);
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const token = getToken();

    try {
      const res = await fetch('http://localhost:8080/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const text = await res.text();
        setError(`Save failed (${res.status}): ${text}`);
        return;
      }

      const updated = await res.json();
      setProfile(updated);
      setForm(updated);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Network error while saving: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const avatarColors = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#db2777'];
  const colorIndex   = profile.name ? profile.name.charCodeAt(0) % avatarColors.length : 0;
  const avatarColor  = avatarColors[colorIndex];

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const skillList = (profile.skills || '').split(',').filter(s => s.trim());

  if (loading) return (
    <>
      <CandidateNavbar />
      <div style={s.loadingWrap}>
        <div style={s.spinner} />
        <p style={{ color: '#a5b4fc', marginTop: '1rem', fontSize: '0.9rem' }}>Loading your profile…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        .profile-input {
          width: 100%; padding: 0.65rem 0.9rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px; color: #f1f5f9;
          font-size: 0.9rem; font-family: 'Inter', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .profile-input::placeholder { color: #64748b; }
        .profile-input:focus { border-color: #6d28d9; }
        .profile-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .profile-textarea {
          width: 100%; padding: 0.65rem 0.9rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px; color: #f1f5f9;
          font-size: 0.9rem; font-family: 'Inter', sans-serif;
          resize: vertical; outline: none; transition: border-color 0.2s; line-height: 1.6;
        }
        .profile-textarea::placeholder { color: #64748b; }
        .profile-textarea:focus { border-color: #6d28d9; }

        .save-btn {
          width: 100%; padding: 0.9rem;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; border: none; border-radius: 12px;
          font-size: 0.95rem; font-weight: 700;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.01em;
        }
        .save-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .edit-btn {
          padding: 0.55rem 1.25rem;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; border: none; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: opacity 0.2s; white-space: nowrap;
        }
        .edit-btn:hover { opacity: 0.85; }

        .cancel-btn {
          padding: 0.55rem 1.25rem;
          background: rgba(255,255,255,0.08); color: #cbd5e1;
          border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
          font-size: 0.85rem; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: background 0.2s; white-space: nowrap;
        }
        .cancel-btn:hover { background: rgba(255,255,255,0.12); }

        .skill-chip {
          display: inline-block; padding: 0.3rem 0.85rem;
          background: rgba(109,40,217,0.25);
          border: 1px solid rgba(109,40,217,0.4);
          color: #c4b5fd; border-radius: 20px;
          font-size: 0.82rem; font-weight: 500;
        }

        .resume-link {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 1.1rem;
          background: rgba(109,40,217,0.2);
          border: 1px solid rgba(109,40,217,0.4);
          color: #a78bfa; border-radius: 8px; font-weight: 600;
          font-size: 0.88rem; text-decoration: none; transition: background 0.2s;
        }
        .resume-link:hover { background: rgba(109,40,217,0.35); }

        .profile-page { min-height: 100vh; background: #0f0c1a; font-family: 'Inter', sans-serif; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .field-grid { grid-template-columns: 1fr !important; }
          .hero-inner { flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>

      <CandidateNavbar />

      <div className="profile-page">

        {/* ── HERO HEADER ── */}
        <div style={s.hero}>
          <div style={s.heroGlow} />
          <div style={s.heroContent}>
            <div className="hero-inner" style={s.heroInner}>
              <div style={{ ...s.avatar, background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}cc)` }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <p style={s.heroLabel}>MY PROFILE</p>
                <h1 style={s.heroName}>{profile.name || 'Your Name'}</h1>
                <p style={s.heroEmail}>{profile.email || '—'}</p>
                {profile.location && (
                  <p style={s.heroLocation}>📍 {profile.location}</p>
                )}
              </div>
              <div>
                {editing
                  ? <button className="cancel-btn" onClick={() => { setEditing(false); setForm(profile); }}>Cancel</button>
                  : <button className="edit-btn" onClick={() => { setEditing(true); setForm(profile); }}>✏️ Edit Profile</button>
                }
              </div>
            </div>

            {!editing && skillList.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem' }}>
                {skillList.map((sk, i) => <span key={i} className="skill-chip">{sk.trim()}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={s.contentWrap}>

          {/* Error banner */}
          {error && (
            <div style={s.errorBanner}>
              ⚠️ {error}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div style={s.successBanner}>✅ {success}</div>
          )}

          {/* About Me */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>About Me</h3>
            {editing
              ? <textarea className="profile-textarea" rows={4} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell recruiters about yourself…" />
              : <p style={profile.bio ? s.value : s.placeholder}>{profile.bio || 'No bio added yet. Click Edit Profile to add one.'}</p>
            }
          </div>

          {/* Personal Information */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Personal Information</h3>
            <div className="field-grid" style={s.fieldGrid}>

              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                {editing
                  ? <input className="profile-input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                  : <p style={s.value}>{profile.name || '—'}</p>}
              </div>

              {/* Email — always read-only, sourced from registration JWT */}
              <div style={s.field}>
                <label style={s.label}>
                  Email <span style={s.lockedBadge}>🔒 from registration</span>
                </label>
                <p style={s.value}>{profile.email || '—'}</p>
              </div>

              <div style={s.field}>
                <label style={s.label}>Phone</label>
                {editing
                  ? <input className="profile-input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                  : <p style={s.value}>{profile.phone || '—'}</p>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Location</label>
                {editing
                  ? <input className="profile-input" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
                  : <p style={s.value}>{profile.location || '—'}</p>}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Skills</h3>
            {editing
              ? (
                <>
                  <input className="profile-input" value={form.skills || ''} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Java, React, Spring Boot, MySQL…" />
                  <p style={s.hint}>Separate skills with commas</p>
                </>
              )
              : skillList.length > 0
                ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {skillList.map((sk, i) => <span key={i} className="skill-chip">{sk.trim()}</span>)}
                  </div>
                : <p style={s.placeholder}>No skills added yet.</p>
            }
          </div>

          {/* Education */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Education</h3>
            {editing
              ? <textarea className="profile-textarea" rows={3} value={form.education || ''} onChange={e => setForm({ ...form, education: e.target.value })} placeholder="e.g. B.Tech in Computer Science, XYZ University (2020–2024)" />
              : <p style={profile.education ? s.value : s.placeholder}>{profile.education || 'No education details added yet.'}</p>
            }
          </div>

          {/* Experience */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Experience</h3>
            {editing
              ? <textarea className="profile-textarea" rows={4} value={form.experience || ''} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="e.g. Software Engineer Intern at ABC Corp (Jan 2024 – Jun 2024)…" />
              : <p style={profile.experience ? s.value : s.placeholder}>{profile.experience || 'No experience added yet.'}</p>
            }
          </div>

          {/* Resume */}
          <div style={s.card}>
            <h3 style={s.cardTitle}>Resume</h3>
            {editing
              ? <input className="profile-input" value={form.resumeUrl || ''} onChange={e => setForm({ ...form, resumeUrl: e.target.value })} placeholder="Paste your Google Drive / Dropbox resume link…" />
              : profile.resumeUrl
                ? <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-link">📄 View Resume</a>
                : <p style={s.placeholder}>No resume link added yet.</p>
            }
          </div>

          {editing && (
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          )}

          <div style={{ height: '3rem' }} />
        </div>
      </div>
    </>
  );
}

const s = {
  loadingWrap: { minHeight: '100vh', background: '#0f0c1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner:     { width: '40px', height: '40px', border: '3px solid rgba(109,40,217,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  hero:        { background: 'linear-gradient(135deg, #1e1040 0%, #160d2e 50%, #0f0c1a 100%)', padding: '3rem 1.5rem 2.5rem', position: 'relative', overflow: 'hidden' },
  heroGlow:    { position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', background: 'radial-gradient(circle, rgba(109,40,217,0.3) 0%, transparent 70%)', pointerEvents: 'none' },
  heroContent: { maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 1 },
  heroInner:   { display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' },
  avatar:      { width: '80px', height: '80px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: '800', flexShrink: 0, boxShadow: '0 0 0 4px rgba(109,40,217,0.3)' },
  heroLabel:   { fontSize: '0.7rem', fontWeight: '700', color: '#7c3aed', letterSpacing: '0.12em', marginBottom: '0.3rem' },
  heroName:    { fontSize: '1.75rem', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.2 },
  heroEmail:   { color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem' },
  heroLocation:{ color: '#7c3aed', fontSize: '0.85rem', marginTop: '0.25rem' },

  contentWrap: { maxWidth: '760px', margin: '0 auto', padding: '1.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  card:        { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem', backdropFilter: 'blur(8px)' },
  cardTitle:   { fontSize: '0.95rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)' },

  fieldGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.1rem' },
  field:       {},
  label:       { display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' },
  lockedBadge: { background: 'rgba(109,40,217,0.2)', color: '#a78bfa', padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', marginLeft: '0.35rem', textTransform: 'none', letterSpacing: 0 },
  value:       { color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.65' },
  placeholder: { color: '#475569', fontSize: '0.88rem', fontStyle: 'italic' },
  hint:        { color: '#475569', fontSize: '0.77rem', marginTop: '0.4rem' },

  successBanner: { background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  errorBanner:   { background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: '500', fontSize: '0.88rem' },
};
