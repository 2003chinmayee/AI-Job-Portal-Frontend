import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

/* ──────────────────────────────────────────────────────────────────
   Design notes (kept here so the next dev understands the intent):

   - Palette: warm paper bg (#FAFAF7), ink navy (#0F172A), signal
     coral (#FF6B4A) for progress/CTA, verified green (#1B7A5C) for
     completion, hairline borders (#E8E4DC).
   - Display face: Fraunces (warmth, personality) for headings.
     Body/inputs: Inter (legible, functional).
   - Signature element: a "stamped" section tracker — each completed
     section gets a rotated ink-stamp badge, like a visa form being
     stamped as you progress. This is the one place we spend our
     visual boldness; everything else stays quiet.
   - Smooth scroll between sections is handled with a lightweight
     custom smooth-scroll (Locomotive-style easing) since true
     Locomotive Scroll requires a build-time CSS/JS import that
     isn't available in this single-file preview environment. The
     behavior — eased scroll-to, progress-linked rail — is the same
     thing Locomotive would give us; swap in real `locomotive-scroll`
     in your build by replacing `smoothScrollTo` with
     `locoRef.current.scrollTo(target)`.
   ────────────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "personal", label: "Personal", sub: "Who you are" },
  { id: "academic", label: "Academic", sub: "Your background" },
  { id: "skills", label: "Skills", sub: "What you bring" },
  { id: "details", label: "Details", sub: "Seal the deal" },
];

function useFontsAndKeyframes() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes stampIn {
        0% { opacity: 0; transform: rotate(-18deg) scale(0.4); }
        60% { opacity: 1; transform: rotate(-7deg) scale(1.08); }
        100% { opacity: 1; transform: rotate(-7deg) scale(1); }
      }
      @keyframes railPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,74,0.35); }
        50% { box-shadow: 0 0 0 6px rgba(255,107,74,0); }
      }
      @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .stamp-badge { animation: stampIn 0.5s cubic-bezier(.2,1.4,.4,1) both; }
      .rail-active-dot { animation: railPulse 2s ease-in-out infinite; }
      .fade-up { animation: fadeUp 0.45s ease both; }
      .font-display { font-family: 'Fraunces', serif; }
      .font-body { font-family: 'Inter', sans-serif; }
      input::placeholder, textarea::placeholder { color: #A8A29A; }
      html { scroll-behavior: smooth; }
      @media (prefers-reduced-motion: reduce) {
        .stamp-badge, .rail-active-dot, .fade-up { animation: none !important; }
        html { scroll-behavior: auto; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);
}

function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  useFontsAndKeyframes();

  const [educations, setEducations] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState("");
  const [otherEducation, setOtherEducation] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [otherCollege, setOtherCollege] = useState("");
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [otherUniversity, setOtherUniversity] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [otherSkill, setOtherSkill] = useState("");
  const [universityMessage, setUniversityMessage] = useState("");
  const [universityError, setUniversityError] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);

  // 3 New fields
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [yearOfPassing, setYearOfPassing] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const [errors, setErrors] = useState({
    fullName: "", email: "", phone: "",
    gender: "", dateOfBirth: "", yearOfPassing: "",
    education: "", cgpa: "", college: "", university: "",
    skills: "", coverLetter: "", resume: "",
  });

  // ── Section refs + active rail tracking (purely presentational) ──
  const sectionRefs = {
    personal: useRef(null),
    academic: useRef(null),
    skills: useRef(null),
    details: useRef(null),
  };
  const [activeSection, setActiveSection] = useState("personal");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.dataset.section);
        });
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0 }
    );
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const smoothScrollTo = (id) => {
    const el = sectionRefs[id]?.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Section completion (for stamp badges in the rail) ──
  const isPersonalComplete =
    fullName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phone.length === 10 && gender && dateOfBirth && yearOfPassing.length === 4 &&
    !errors.fullName && !errors.email && !errors.phone && !errors.gender && !errors.dateOfBirth && !errors.yearOfPassing;

  const isAcademicComplete =
    selectedEducation && cgpa.trim() && selectedCollege && selectedUniversity &&
    !errors.education && !errors.cgpa && !errors.college && !errors.university;

  const isSkillsComplete = selectedSkills.filter((s) => s !== "OTHER").length > 0;

  const isDetailsComplete = coverLetter.trim() && resume && !errors.coverLetter && !errors.resume;

  const completionMap = {
    personal: isPersonalComplete,
    academic: isAcademicComplete,
    skills: isSkillsComplete,
    details: isDetailsComplete,
  };
  const completedCount = Object.values(completionMap).filter(Boolean).length;
  const progressPct = Math.round((completedCount / SECTIONS.length) * 100);

  useEffect(() => { fetchMasterData(); }, []);

  // Auto-fill email from the logged-in account instead of leaving it
  // free-typed. This is the same localStorage key ResumeAnalyzer.jsx
  // already reads. Locking this prevents a candidate from accidentally
  // typing a different email than their account, which previously
  // caused notifications to silently fail to match any user.
  useEffect(() => {
    const accountEmail = localStorage.getItem("email");
    if (accountEmail) {
      setEmail(accountEmail);
      clearError("email");
    }
  }, []);

  useEffect(() => {
    if (!submitted) return;
    if (countdown === 0) { navigate("/dashboard"); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, countdown, navigate]);

  const fetchMasterData = async () => {
    try {
      const educationRes = await API.get("/education");
      const collegeRes = await API.get("/colleges");
      const universityRes = await API.get("/universities");
      const skillRes = await API.get("/skills");
      setEducations(educationRes.data);
      setColleges(collegeRes.data);
      setUniversities(universityRes.data);
      setSkills(skillRes.data);
    } catch (error) { console.error("Error loading master data", error); }
  };

  const setError = (field, message) => setErrors((prev) => ({ ...prev, [field]: message }));
  const clearError = (field) => setErrors((prev) => ({ ...prev, [field]: "" }));

  const handleFullNameChange = (e) => {
    const value = e.target.value;
    if (/\d/.test(value)) return;
    setFullName(value);
    if (!value.trim()) setError("fullName", "Full Name is required.");
    else clearError("fullName");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) setError("email", "Email is required.");
    else if (!emailRegex.test(value)) setError("email", "Please enter a valid email address.");
    else clearError("email");
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
    if (!value) setError("phone", "Phone Number is required.");
    else if (value.length < 10) setError("phone", `Phone Number must be 10 digits. You've entered ${value.length}.`);
    else clearError("phone");
  };

  const handleGenderChange = (e) => {
    setGender(e.target.value);
    if (!e.target.value) setError("gender", "Please select your Gender.");
    else clearError("gender");
  };

  const handleDateOfBirthChange = (e) => {
    setDateOfBirth(e.target.value);
    if (!e.target.value) setError("dateOfBirth", "Date of Birth is required.");
    else clearError("dateOfBirth");
  };

  const handleYearOfPassingChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYearOfPassing(value);
    const currentYear = new Date().getFullYear();
    if (!value) setError("yearOfPassing", "Year of Passing is required.");
    else if (value.length !== 4) setError("yearOfPassing", "Please enter a valid 4-digit year.");
    else if (parseInt(value) < 1980 || parseInt(value) > currentYear + 5)
      setError("yearOfPassing", `Year must be between 1980 and ${currentYear + 5}.`);
    else clearError("yearOfPassing");
  };

  const handleEducationChange = (e) => {
    setSelectedEducation(e.target.value);
    if (!e.target.value) setError("education", "Please select your Education.");
    else clearError("education");
  };

  const handleCgpaChange = (e) => {
    setCgpa(e.target.value);
    if (!e.target.value.trim()) setError("cgpa", "Percentage / CGPA is required.");
    else clearError("cgpa");
  };

  const handleCollegeChange = (e) => {
    setSelectedCollege(e.target.value);
    if (!e.target.value) setError("college", "Please select your College.");
    else clearError("college");
  };

  const handleUniversityChange = (e) => {
    setSelectedUniversity(e.target.value);
    if (!e.target.value) setError("university", "Please select your University.");
    else clearError("university");
  };

  const handleSkillChange = (skillName, checked) => {
    const updated = checked ? [...selectedSkills, skillName] : selectedSkills.filter((s) => s !== skillName);
    setSelectedSkills(updated);
    const actual = updated.filter((s) => s !== "OTHER");
    if (actual.length === 0) setError("skills", "Please select at least one Skill.");
    else clearError("skills");
  };

  const handleCoverLetterChange = (e) => {
    setCoverLetter(e.target.value);
    if (!e.target.value.trim()) setError("coverLetter", "Cover Letter is required.");
    else clearError("coverLetter");
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setResume(file);
    if (!file) setError("resume", "Please upload your Resume.");
    else clearError("resume");
  };

  const addEducation = async () => {
    try {
      if (!otherEducation.trim()) { alert("Please enter education"); return; }
      await API.post("/education", { educationName: otherEducation });
      const response = await API.get("/education");
      setEducations(response.data); setSelectedEducation(otherEducation); setOtherEducation(""); clearError("education");
      alert("Education Added Successfully");
    } catch (error) { alert(error.response?.data || "Failed to add education"); }
  };

  const addCollege = async () => {
    try {
      if (!otherCollege.trim()) { alert("Please enter college name"); return; }
      await API.post("/colleges", { collegeName: otherCollege });
      const response = await API.get("/colleges");
      setColleges(response.data); setSelectedCollege(otherCollege); setOtherCollege(""); clearError("college");
      alert("College Added Successfully");
    } catch (error) { alert(error.response?.data || "Failed to add college"); }
  };

  const addUniversity = async () => {
    try {
      if (!otherUniversity.trim()) { alert("Please enter university name"); return; }
      const response = await API.post("/universities", { universityName: otherUniversity });
      setUniversities([...universities, response.data]); setSelectedUniversity(response.data.universityName);
      setOtherUniversity(""); clearError("university");
      setUniversityMessage("University added successfully"); setUniversityError(false);
    } catch (error) { setUniversityMessage(error.response?.data || "Failed to add university"); setUniversityError(true); }
  };

  const addSkill = async () => {
    try {
      if (!otherSkill.trim()) { alert("Please enter skill"); return; }
      const response = await API.post("/skills", { skillName: otherSkill });
      setSkills([...skills, response.data]);
      const updated = [...selectedSkills.filter((s) => s !== "OTHER"), response.data.skillName];
      setSelectedSkills(updated); setOtherSkill(""); clearError("skills");
      alert("Skill Added Successfully");
    } catch (error) { alert(error.response?.data || "Failed to add skill"); }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const currentYear = new Date().getFullYear();
    const newErrors = {};
    let valid = true;

    if (!fullName.trim()) { newErrors.fullName = "Full Name is required."; valid = false; } else newErrors.fullName = "";
    if (!email.trim()) { newErrors.email = "Email is required."; valid = false; }
    else if (!emailRegex.test(email)) { newErrors.email = "Please enter a valid email address."; valid = false; }
    else newErrors.email = "";
    if (!phone.trim()) { newErrors.phone = "Phone Number is required."; valid = false; }
    else if (phone.length !== 10) { newErrors.phone = `Phone Number must be 10 digits. You've entered ${phone.length}.`; valid = false; }
    else newErrors.phone = "";
    if (!gender) { newErrors.gender = "Please select your Gender."; valid = false; } else newErrors.gender = "";
    if (!dateOfBirth) { newErrors.dateOfBirth = "Date of Birth is required."; valid = false; } else newErrors.dateOfBirth = "";
    if (!yearOfPassing.trim()) { newErrors.yearOfPassing = "Year of Passing is required."; valid = false; }
    else if (yearOfPassing.length !== 4) { newErrors.yearOfPassing = "Please enter a valid 4-digit year."; valid = false; }
    else if (parseInt(yearOfPassing) < 1980 || parseInt(yearOfPassing) > currentYear + 5) {
      newErrors.yearOfPassing = `Year must be between 1980 and ${currentYear + 5}.`; valid = false;
    } else newErrors.yearOfPassing = "";
    if (!selectedEducation) { newErrors.education = "Please select your Education."; valid = false; } else newErrors.education = "";
    if (!cgpa.trim()) { newErrors.cgpa = "Percentage / CGPA is required."; valid = false; } else newErrors.cgpa = "";
    if (!selectedCollege) { newErrors.college = "Please select your College."; valid = false; } else newErrors.college = "";
    if (!selectedUniversity) { newErrors.university = "Please select your University."; valid = false; } else newErrors.university = "";
    const actualSkills = selectedSkills.filter((s) => s !== "OTHER");
    if (actualSkills.length === 0) { newErrors.skills = "Please select at least one Skill."; valid = false; } else newErrors.skills = "";
    if (!coverLetter.trim()) { newErrors.coverLetter = "Cover Letter is required."; valid = false; } else newErrors.coverLetter = "";
    if (!resume) { newErrors.resume = "Please upload your Resume."; valid = false; } else newErrors.resume = "";

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const candidateId = localStorage.getItem("userId");
    if (!candidateId) { alert("Please login first"); navigate("/login"); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("resumeFile", resume);
      formData.append("candidateId", candidateId);
      formData.append("jobId", jobId);
      formData.append("candidateName", fullName);
      formData.append("candidateEmail", email);
      formData.append("phone", phone);
      formData.append("gender", gender);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("yearOfPassing", yearOfPassing);
      formData.append("education", selectedEducation);
      formData.append("collegeName", selectedCollege);
      formData.append("universityName", selectedUniversity);
      formData.append("percentage", cgpa);
      formData.append("coverLetter", coverLetter);
      formData.append("skills", selectedSkills.filter((s) => s !== "OTHER").join(", "));
      const response = await API.post("/applications/apply", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setAiResult(response.data);
      setSubmitted(true);
    } catch (error) {
      alert("❌ " + (error.response?.data || "Something went wrong. Please try again."));
    } finally { setIsSubmitting(false); }
  };

  const ErrorMsg = ({ msg }) =>
    msg ? (
      <p className="font-body flex items-center gap-1.5 text-[13px] text-[#C0392B] mt-1.5 fade-up">
        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
        {msg}
      </p>
    ) : null;

  const Label = ({ text }) => (
    <label className="font-body block text-[13px] font-semibold tracking-wide uppercase text-[#0F172A]/70 mb-2">
      {text} <span className="text-[#FF6B4A]">*</span>
    </label>
  );

  const inputCls = (hasError) =>
    `font-body w-full bg-white border-[1.5px] px-4 py-3 rounded-xl text-[15px] text-[#0F172A] outline-none transition-all duration-200
     placeholder:text-[#A8A29A] focus:ring-4 ${
       hasError
         ? "border-[#E07A5F] focus:ring-[#E07A5F]/15 focus:border-[#E07A5F]"
         : "border-[#E8E4DC] focus:ring-[#FF6B4A]/12 focus:border-[#FF6B4A]"
     }`;

  const SectionStamp = ({ complete }) =>
    complete ? (
      <span className="stamp-badge inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1B7A5C] text-white shadow-sm shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-[1.5px] border-[#E8E4DC] shrink-0" />
    );

  const getScoreColor = (score) => {
    if (score >= 75) return { bar: "#1B7A5C", text: "text-[#1B7A5C]", label: "Strong Match", bg: "bg-[#1B7A5C]/8" };
    if (score >= 50) return { bar: "#D98E04", text: "text-[#9A6700]", label: "Moderate Match", bg: "bg-[#D98E04]/8" };
    return { bar: "#C0392B", text: "text-[#C0392B]", label: "Low Match", bg: "bg-[#C0392B]/8" };
  };

  // ── Success screen ──
  if (submitted && aiResult) {
    const score = aiResult.aiScore || 0;
    const scoreStyle = getScoreColor(score);
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6 font-body">
        <div className="bg-white rounded-3xl shadow-xl shadow-[#0F172A]/5 max-w-lg w-full p-8 sm:p-10 border border-[#E8E4DC] fade-up">
          <div className="flex justify-center mb-5">
            <div className="stamp-badge w-20 h-20 bg-[#1B7A5C]/10 rounded-full flex items-center justify-center ring-4 ring-[#1B7A5C]/5">
              <svg className="w-10 h-10 text-[#1B7A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="font-display text-3xl font-semibold text-center text-[#0F172A] mb-1.5">Application Submitted</h2>
          <p className="text-center text-[#6B7280] text-sm mb-7">Your application has been received successfully.</p>

          <div className="border-t border-[#E8E4DC] mb-6" />

          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[13px] font-semibold uppercase tracking-wide text-[#0F172A]/60">AI Match Score</span>
              <span className={`font-display text-2xl font-semibold ${scoreStyle.text}`}>{score}<span className="text-sm text-[#A8A29A] font-body"> / 100</span></span>
            </div>
            <div className="w-full bg-[#F0EDE5] rounded-full h-2.5 overflow-hidden">
              <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: scoreStyle.bar }} />
            </div>
            <p className={`text-sm font-semibold mt-2 ${scoreStyle.text}`}>{scoreStyle.label}</p>
          </div>

          {aiResult.skillsMatch && aiResult.skillsMatch !== "None" && (
            <div className="mb-5">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[#0F172A]/60 mb-2.5">Matched Skills</p>
              <div className="flex flex-wrap gap-2">
                {aiResult.skillsMatch.split(",").map((s, i) => (
                  <span key={i} className="bg-[#1B7A5C]/8 text-[#1B7A5C] text-xs font-medium px-3 py-1.5 rounded-full border border-[#1B7A5C]/20">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {aiResult.missingSkills && aiResult.missingSkills !== "None" && (
            <div className="mb-6">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[#0F172A]/60 mb-2.5">Skills to Improve</p>
              <div className="flex flex-wrap gap-2">
                {aiResult.missingSkills.split(",").map((s, i) => (
                  <span key={i} className="bg-[#C0392B]/6 text-[#C0392B] text-xs font-medium px-3 py-1.5 rounded-full border border-[#C0392B]/20">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-[#E8E4DC] mb-6" />

          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-7 h-7 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center">
              <span className="text-[#FF6B4A] font-display font-bold text-sm">{countdown}</span>
            </div>
            <p className="text-[#6B7280] text-sm">Redirecting to your dashboard…</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/dashboard")} className="flex-1 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Go to Dashboard
            </button>
            <button onClick={() => navigate("/jobs")} className="flex-1 border-[1.5px] border-[#E8E4DC] hover:bg-[#FAFAF7] text-[#0F172A] font-semibold py-3 rounded-xl transition-colors text-sm">
              Browse More Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="min-h-screen bg-[#FAFAF7] font-body text-[#0F172A]">
      {/* Mobile top progress bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#FAFAF7]/95 backdrop-blur-sm border-b border-[#E8E4DC] px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-base font-semibold">Job Application</span>
          <span className="text-xs font-semibold text-[#FF6B4A]">{progressPct}%</span>
        </div>
        <div className="w-full bg-[#F0EDE5] rounded-full h-1.5 overflow-hidden">
          <div className="h-1.5 rounded-full bg-[#FF6B4A] transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 lg:py-14 grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-16">

        {/* ── Sticky rail (desktop) ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-14">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#FF6B4A] mb-3">Application Form</p>
            <h1 className="font-display text-[28px] leading-tight font-semibold text-[#0F172A] mb-8">
              Let's get you<br />in front of them.
            </h1>

            <nav className="space-y-1 mb-8">
              {SECTIONS.map((sec, i) => {
                const isActive = activeSection === sec.id;
                const isComplete = completionMap[sec.id];
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => smoothScrollTo(sec.id)}
                    className={`w-full flex items-center gap-3 text-left px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive ? "bg-white shadow-sm shadow-[#0F172A]/5 border border-[#E8E4DC]" : "hover:bg-white/60"
                    }`}
                  >
                    <SectionStamp complete={isComplete} />
                    <span className="flex-1">
                      <span className={`block text-[14px] font-semibold ${isActive ? "text-[#0F172A]" : "text-[#0F172A]/70"}`}>
                        {sec.label}
                      </span>
                      <span className="block text-[12px] text-[#A8A29A]">{sec.sub}</span>
                    </span>
                    {isActive && <span className="rail-active-dot w-1.5 h-1.5 rounded-full bg-[#FF6B4A] shrink-0" />}
                  </button>
                );
              })}
            </nav>

            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-[#0F172A]/50">Progress</span>
                <span className="text-[13px] font-bold text-[#FF6B4A]">{progressPct}%</span>
              </div>
              <div className="w-full bg-[#F0EDE5] rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#FF8B6E] transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Form panel ── */}
        <div>
          <div className="lg:hidden mb-8">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#FF6B4A] mb-2">Application Form</p>
            <h1 className="font-display text-2xl font-semibold">Let's get you in front of them.</h1>
            <p className="text-sm text-[#6B7280] mt-2">All fields marked with <span className="text-[#FF6B4A]">*</span> are required.</p>
          </div>

          <form className="space-y-16" onSubmit={handleSubmit}>

            {/* PERSONAL */}
            <section ref={sectionRefs.personal} data-section="personal" className="scroll-mt-8">
              <div className="flex items-center gap-3 mb-6">
                <SectionStamp complete={isPersonalComplete} />
                <h2 className="font-display text-xl font-semibold text-[#0F172A]">Personal Information</h2>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 space-y-5">
                <div>
                  <Label text="Full Name" />
                  <input type="text" placeholder="e.g. Asha Patil" value={fullName} onChange={handleFullNameChange} className={inputCls(errors.fullName)} />
                  <ErrorMsg msg={errors.fullName} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label text="Email Address" />
                    <input
                      type="text"
                      placeholder="you@example.com"
                      value={email}
                      readOnly
                      title="This is your account email and can't be changed here."
                      className={inputCls(errors.email) + " bg-[#F8F6F1] text-[#0F172A]/70 cursor-not-allowed"}
                    />
                    <p className="font-body text-[12px] text-[#A8A29A] mt-1.5">Locked to your account email</p>
                    <ErrorMsg msg={errors.email} />
                  </div>
                  <div>
                    <Label text="Phone Number" />
                    <input type="text" placeholder="10-digit number" value={phone} maxLength={10} onChange={handlePhoneChange} className={inputCls(errors.phone)} />
                    <ErrorMsg msg={errors.phone} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label text="Gender" />
                    <select value={gender} onChange={handleGenderChange} className={inputCls(errors.gender)}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ErrorMsg msg={errors.gender} />
                  </div>
                  <div>
                    <Label text="Date of Birth" />
                    <input type="date" value={dateOfBirth} onChange={handleDateOfBirthChange} max={new Date().toISOString().split("T")[0]} className={inputCls(errors.dateOfBirth)} />
                    <ErrorMsg msg={errors.dateOfBirth} />
                  </div>
                </div>
              </div>
            </section>

            {/* ACADEMIC */}
            <section ref={sectionRefs.academic} data-section="academic" className="scroll-mt-8">
              <div className="flex items-center gap-3 mb-6">
                <SectionStamp complete={isAcademicComplete} />
                <h2 className="font-display text-xl font-semibold text-[#0F172A]">Academic Information</h2>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 space-y-5">
                <div>
                  <Label text="Education" />
                  <select value={selectedEducation} onChange={handleEducationChange} className={inputCls(errors.education)}>
                    <option value="">Select Education</option>
                    {educations.map((edu) => (<option key={edu.id} value={edu.educationName}>{edu.educationName}</option>))}
                    <option value="OTHER">Other</option>
                  </select>
                  <ErrorMsg msg={errors.education} />

                  {selectedEducation === "OTHER" && (
                    <div className="flex flex-col sm:flex-row gap-2.5 mt-3 fade-up">
                      <input type="text" placeholder="Enter your education" value={otherEducation} onChange={(e) => setOtherEducation(e.target.value)} className={inputCls(false) + " flex-1"} />
                      <button type="button" onClick={addEducation} className="bg-[#1B7A5C] hover:bg-[#1B7A5C]/90 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">Add Education</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label text="Percentage / CGPA" />
                    <input type="text" placeholder="e.g. 85% or 8.5 CGPA" value={cgpa} onChange={handleCgpaChange} className={inputCls(errors.cgpa)} />
                    <ErrorMsg msg={errors.cgpa} />
                  </div>
                  <div>
                    <Label text="Year of Passing" />
                    <input type="text" placeholder="e.g. 2024" value={yearOfPassing} maxLength={4} onChange={handleYearOfPassingChange} className={inputCls(errors.yearOfPassing)} />
                    <ErrorMsg msg={errors.yearOfPassing} />
                  </div>
                </div>

                <div>
                  <Label text="College" />
                  <select value={selectedCollege} onChange={handleCollegeChange} className={inputCls(errors.college)}>
                    <option value="">Select College</option>
                    {colleges.map((college) => (<option key={college.id} value={college.collegeName}>{college.collegeName}</option>))}
                    <option value="OTHER">Other</option>
                  </select>
                  <ErrorMsg msg={errors.college} />

                  {selectedCollege === "OTHER" && (
                    <div className="flex flex-col sm:flex-row gap-2.5 mt-3 fade-up">
                      <input type="text" placeholder="Enter college name" value={otherCollege} onChange={(e) => setOtherCollege(e.target.value)} className={inputCls(false) + " flex-1"} />
                      <button type="button" onClick={addCollege} className="bg-[#1B7A5C] hover:bg-[#1B7A5C]/90 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">Add College</button>
                    </div>
                  )}
                </div>

                <div>
                  <Label text="University" />
                  <select value={selectedUniversity} onChange={handleUniversityChange} className={inputCls(errors.university)}>
                    <option value="">Select University</option>
                    {universities.map((uni) => (<option key={uni.id} value={uni.universityName}>{uni.universityName}</option>))}
                    <option value="OTHER">Other</option>
                  </select>
                  <ErrorMsg msg={errors.university} />

                  {selectedUniversity === "OTHER" && (
                    <div className="fade-up">
                      <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
                        <input type="text" placeholder="Enter university name" value={otherUniversity} onChange={(e) => setOtherUniversity(e.target.value)} className={inputCls(false) + " flex-1"} />
                        <button type="button" className="bg-[#1B7A5C] hover:bg-[#1B7A5C]/90 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap" onClick={addUniversity}>Add University</button>
                      </div>
                      {universityMessage && (
                        <p className={`text-sm mt-2 ${universityError ? "text-[#C0392B]" : "text-[#1B7A5C]"}`}>{universityMessage}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SKILLS */}
            <section ref={sectionRefs.skills} data-section="skills" className="scroll-mt-8">
              <div className="flex items-center gap-3 mb-6">
                <SectionStamp complete={isSkillsComplete} />
                <h2 className="font-display text-xl font-semibold text-[#0F172A]">Skills</h2>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7">
                <div className={`rounded-xl border-[1.5px] p-5 transition-colors ${errors.skills ? "border-[#E07A5F]" : "border-[#E8E4DC]"}`}>
                  <label className="font-body block font-semibold mb-4 text-sm text-[#0F172A]">
                    Select your skills <span className="text-[#FF6B4A]">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skills.map((skill) => {
                      const checked = selectedSkills.includes(skill.skillName);
                      return (
                        <label key={skill.id} className={`flex items-center gap-2.5 text-sm rounded-lg px-3 py-2.5 border-[1.5px] cursor-pointer transition-all ${checked ? "bg-[#FF6B4A]/6 border-[#FF6B4A]/40 text-[#0F172A]" : "border-[#E8E4DC] text-[#0F172A]/75 hover:border-[#E8E4DC]/100 hover:bg-[#FAFAF7]"}`}>
                          <input type="checkbox" checked={checked} onChange={(e) => handleSkillChange(skill.skillName, e.target.checked)} className="accent-[#FF6B4A] w-4 h-4" />
                          {skill.skillName}
                        </label>
                      );
                    })}
                  </div>

                  <label className="flex items-center gap-2.5 mt-4 text-sm text-[#0F172A]/75 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes("OTHER")}
                      onChange={(e) => {
                        if (e.target.checked) { setSelectedSkills([...selectedSkills, "OTHER"]); }
                        else {
                          const updated = selectedSkills.filter((s) => s !== "OTHER");
                          setSelectedSkills(updated);
                          if (updated.filter((s) => s !== "OTHER").length === 0) setError("skills", "Please select at least one Skill.");
                          else clearError("skills");
                        }
                      }}
                      className="accent-[#FF6B4A] w-4 h-4"
                    />
                    Add a skill not listed above
                  </label>

                  {selectedSkills.includes("OTHER") && (
                    <div className="flex flex-col sm:flex-row gap-2.5 mt-3 fade-up">
                      <input type="text" placeholder="Enter skill" value={otherSkill} onChange={(e) => setOtherSkill(e.target.value)} className={inputCls(false) + " flex-1"} />
                      <button type="button" onClick={addSkill} className="bg-[#1B7A5C] hover:bg-[#1B7A5C]/90 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">Add Skill</button>
                    </div>
                  )}
                </div>
                <ErrorMsg msg={errors.skills} />

                {selectedSkills.filter((s) => s !== "OTHER").length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 fade-up">
                    {selectedSkills.filter((s) => s !== "OTHER").map((s, i) => (
                      <span key={i} className="bg-[#1B7A5C]/8 text-[#1B7A5C] text-xs font-medium px-3 py-1.5 rounded-full border border-[#1B7A5C]/20">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* DETAILS */}
            <section ref={sectionRefs.details} data-section="details" className="scroll-mt-8">
              <div className="flex items-center gap-3 mb-6">
                <SectionStamp complete={isDetailsComplete} />
                <h2 className="font-display text-xl font-semibold text-[#0F172A]">Application Details</h2>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-7 space-y-5">
                <div>
                  <Label text="Cover Letter" />
                  <textarea rows="5" placeholder="Tell us why you're a good fit for this role…" value={coverLetter} onChange={handleCoverLetterChange} className={inputCls(errors.coverLetter) + " resize-none"} />
                  <ErrorMsg msg={errors.coverLetter} />
                </div>

                <div>
                  <Label text="Upload Resume (PDF only)" />
                  <div className={`relative border-[1.5px] rounded-xl px-4 py-3 transition-colors ${errors.resume ? "border-[#E07A5F]" : "border-[#E8E4DC] hover:border-[#FF6B4A]/40"}`}>
                    <input type="file" accept=".pdf" onChange={handleResumeChange} className="font-body w-full text-sm text-[#0F172A]/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B4A]/10 file:text-[#FF6B4A] hover:file:bg-[#FF6B4A]/15 file:cursor-pointer cursor-pointer" />
                  </div>
                  <ErrorMsg msg={errors.resume} />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 shadow-lg shadow-[#FF6B4A]/10 ${
                  isSubmitting ? "bg-[#FF6B4A]/60 cursor-not-allowed" : "bg-[#FF6B4A] hover:bg-[#FF5A36] active:scale-[0.99]"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting your application…
                  </span>
                ) : ("Submit Application")}
              </button>
              <p className="text-center text-xs text-[#A8A29A] mt-3">
                {completedCount} of {SECTIONS.length} sections complete
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplyJob;
