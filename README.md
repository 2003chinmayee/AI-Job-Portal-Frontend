# 🚀 AI Job Portal — Frontend

> A modern, AI-powered job portal built with React.js. Candidates can apply for jobs with AI resume scoring, and recruiters can manage applicants with intelligent ranking.

🌐 **Live Website:** [https://ai-job-portal-frontend-fmkc.vercel.app](https://ai-job-portal-frontend-fmkc.vercel.app)  
⚙️ **Backend API:** [https://ai-job-portal-backend-ng39.onrender.com](https://ai-job-portal-backend-ng39.onrender.com)  
📦 **Backend Repo:** [https://github.com/2003chinmayee/AI-Job-Portal-Backend](https://github.com/2003chinmayee/AI-Job-Portal-Backend)

---

## 📌 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Components](#pages--components)
- [How It Works — Flow](#how-it-works--flow)
- [API Integration](#api-integration)
- [Authentication Flow](#authentication-flow)
- [Hosting & Deployment](#hosting--deployment)
- [Environment Variables](#environment-variables)
- [How to Run Locally](#how-to-run-locally)
- [Interview Q&A](#interview-qa)

---

## 📖 Project Overview

The AI Job Portal is a full-stack web application that bridges the gap between job seekers and recruiters. The frontend is built with **React.js** and styled with **Tailwind CSS**. It connects to a **Spring Boot REST API** backend and uses **Gemini AI** for intelligent resume analysis and scoring.

This project was built as a **Final Year MBE Project** and also serves as a **Portfolio Project**.

---

## ✨ Features

### 👨‍💼 Candidate Features
- ✅ Register & Login with JWT authentication
- ✅ Browse available job listings
- ✅ Apply for jobs with a multi-step form (Personal → Academic → Skills → Details)
- ✅ Upload PDF resume — AI automatically scores it against job requirements
- ✅ View AI match score, matched skills, and missing skills after applying
- ✅ Track application status (Applied → Shortlisted → Hired / Rejected)
- ✅ Receive email notifications for status updates
- ✅ Bell icon with unread notification count
- ✅ View all notifications with auto-mark-as-read
- ✅ AI Resume Analyzer tool
- ✅ Candidate Dashboard with stats and application history

### 👩‍💼 Recruiter Features
- ✅ Post new job listings
- ✅ View all applicants for each job
- ✅ Run AI Analysis to rank candidates by resume match score
- ✅ Shortlist, Hire, or Reject candidates
- ✅ Automated emails sent to candidates on status change
- ✅ Recruiter Dashboard with analytics
- ✅ View active jobs and history

### 🔐 Security Features
- ✅ JWT-based authentication
- ✅ Role-based routing (CANDIDATE vs RECRUITER)
- ✅ Duplicate email & phone prevention on registration
- ✅ Password strength validation (uppercase, lowercase, number, special char)
- ✅ Phone number format validation (10 digits only)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React.js 18** | Frontend framework |
| **Tailwind CSS** | Styling and responsive design |
| **React Router DOM** | Client-side routing and navigation |
| **Axios** | HTTP requests to backend API |
| **Framer Motion** | Animations and transitions |
| **LocalStorage** | Storing JWT token, user info |
| **Vercel** | Frontend hosting and deployment |

---

## 📁 Project Structure

```
job-portal-frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance with JWT interceptor
│   ├── components/
│   │   ├── CandidateNavbar.jsx   # Navbar with bell icon, unread count
│   │   └── RecruiterNavbar.jsx   # Recruiter navigation
│   ├── pages/
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration with validation
│   │   ├── Jobs.jsx              # Job listings page
│   │   ├── ApplyJob.jsx          # Multi-step application form
│   │   ├── CandidateDashboard.jsx # Candidate stats & applications
│   │   ├── Notifications.jsx     # Notification center
│   │   ├── ResumeAnalyzer.jsx    # AI resume analysis tool
│   │   ├── RecruiterDashboard.jsx # Recruiter analytics
│   │   ├── MyJobs.jsx            # Recruiter job management
│   │   ├── Applicants.jsx        # View & manage applicants
│   │   ├── PostJob.jsx           # Create new job listing
│   │   ├── AiRank.jsx            # AI-ranked candidate list
│   │   └── History.jsx           # Job history page
│   ├── App.js                    # Routes configuration
│   └── index.js                  # Entry point
├── .env                          # Environment variables
├── .env.production               # Production environment
└── package.json
```

---

## 📄 Pages & Components

### 🔑 Login.jsx
- Email and password form
- JWT token stored in localStorage on success
- Role-based redirect: CANDIDATE → `/jobs`, RECRUITER → `/recruiter-dashboard`

### 📝 Register.jsx
- Full validation: name, email, phone (10 digits), password strength
- Real-time error messages per field
- Password strength indicator (Very Weak → Very Strong)
- Show/hide password toggle
- Duplicate email/phone prevention via backend

### 💼 Jobs.jsx
- Fetches all active job listings from backend
- Search and filter functionality
- Cards showing company, location, salary, experience

### 📋 ApplyJob.jsx
- **4-step wizard form:**
  - Step 1: Personal Info (name, email locked to account, phone, gender, DOB)
  - Step 2: Academic Info (education, CGPA, college, university)
  - Step 3: Skills (checkbox selection + add custom skills)
  - Step 4: Details (cover letter + PDF resume upload)
- Progress bar and section completion stamps
- PDF resume uploaded and AI-scored in real-time
- Success screen shows AI match score, matched skills, missing skills

### 🏠 CandidateDashboard.jsx
- Stats: Total Applied, Shortlisted, Hired, Rejected
- Application cards with status badges
- Expandable detail view for each application
- Framer Motion staggered animations

### 🔔 Notifications.jsx
- Fetches all notifications for logged-in user
- Auto-marks all as read when page opens
- Bell badge clears after visiting page
- "New" badge on unread notifications
- Timestamp formatting

### 🤖 ResumeAnalyzer.jsx
- Upload PDF resume
- Gemini AI analyzes it and returns score, strengths, improvements
- Animated SVG circular progress ring
- Download analysis as PDF using jsPDF

### 👥 Applicants.jsx (Recruiter)
- Lists all candidates who applied for a job
- AI Score shown per candidate
- Shortlist / Hire / Reject buttons
- Confirmation before sending emails
- Status badges (Applied, Shortlisted, Hired, Rejected)

---

## 🔄 How It Works — Flow

### Candidate Flow:
```
Register → Login → Browse Jobs → Apply (upload PDF)
    ↓
Backend runs Gemini AI on resume → Returns AI Score
    ↓
Candidate sees score + matched/missing skills
    ↓
Recruiter shortlists/hires/rejects → Email sent to candidate
    ↓
Candidate gets notification + email
```

### Recruiter Flow:
```
Login → Post Job → View Applicants
    ↓
Click "Run AI Analysis" → Gemini ranks all candidates
    ↓
Recruiter shortlists candidate → Email auto-sent
    ↓
Recruiter hires candidate → Offer letter email auto-sent
```

---

## 🔗 API Integration

All API calls go through `src/api/axios.js`:

```javascript
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
});

// Automatically attaches JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Key API Endpoints Used:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login and get JWT |
| `/jobs` | GET | Get all jobs |
| `/applications/apply` | POST | Apply for job with PDF |
| `/notifications` | GET | Get user notifications |
| `/notifications/unread-count` | GET | Get bell badge count |
| `/notifications/mark-all-read` | PUT | Mark all as read |
| `/recruiter/shortlist/{id}` | PUT | Shortlist candidate |
| `/recruiter/hire/{id}` | PUT | Hire candidate |
| `/recruiter/reject/{id}` | PUT | Reject candidate |

---

## 🔐 Authentication Flow

1. User logs in → Backend returns JWT token
2. Token stored in `localStorage`
3. Every API request has `Authorization: Bearer <token>` header
4. On logout → `localStorage.clear()` → redirect to login
5. Role stored in localStorage → used for route protection

```
localStorage stores:
- token       → JWT token
- email       → user email
- userId      → user ID
- userName    → display name
- role        → CANDIDATE or RECRUITER
```

---

## 🌐 Hosting & Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | **Vercel** (free) | https://ai-job-portal-frontend-fmkc.vercel.app |
| Backend | **Render** (free) | https://ai-job-portal-backend-ng39.onrender.com |
| Database | **Railway MySQL** | Managed MySQL instance |

### Auto-Deployment:
- Push to `main` branch → Vercel auto-deploys frontend in ~2 minutes
- Push to `main` branch → Render auto-deploys backend in ~5 minutes

---

## 🔧 Environment Variables

```env
REACT_APP_API_URL=https://ai-job-portal-backend-ng39.onrender.com/api
DISABLE_ESLINT_PLUGIN=true
CI=false
```

---

## 💻 How to Run Locally

```bash
# Clone the repository
git clone https://github.com/2003chinmayee/AI-Job-Portal-Frontend.git
cd AI-Job-Portal-Frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env

# Start development server
npm start

# App runs on http://localhost:3000
```

---

## 🎤 Interview Q&A

**Q: What is this project?**
> An AI-powered full-stack job portal where candidates apply with PDF resumes, and Gemini AI scores their resume against job requirements in real time. Recruiters can rank candidates by AI score and send automated emails.

**Q: What tech stack did you use for frontend?**
> React.js 18 with React Router DOM for navigation, Tailwind CSS for styling, Axios for API calls, and Framer Motion for animations. Deployed on Vercel.

**Q: How does the multi-step form work?**
> ApplyJob.jsx has 4 sections — Personal, Academic, Skills, and Details. Each section has its own validation. A progress bar and section stamps show completion. On submit, all data including the PDF file is sent as FormData to the backend.

**Q: How does JWT authentication work in React?**
> After login, the JWT token returned by the backend is stored in localStorage. An Axios interceptor automatically adds the `Authorization: Bearer <token>` header to every subsequent request. On logout, localStorage is cleared.

**Q: How do notifications work?**
> CandidateNavbar polls the `/notifications/unread-count` endpoint on every route change to update the bell badge. When the user visits the Notifications page, all notifications are automatically marked as read via a PUT request to `/notifications/mark-all-read`.

**Q: How did you handle form validation?**
> Per-field real-time validation using React state. Each field has a validate() function that checks rules like email format, phone must be 10 digits, password must have uppercase/lowercase/number/special character. Errors show in real-time as user types.

**Q: How is the AI score shown after applying?**
> After form submission, the backend returns the Application object with aiScore, skillsMatch, and missingSkills fields. The frontend displays these on a success screen with a color-coded score bar (green for high, orange for medium, red for low).

**Q: Why did you use Vercel for hosting?**
> Vercel is the best platform for React apps — free tier, automatic deployments on git push, global CDN, and zero configuration needed for Create React App projects.

**Q: How do you handle role-based routing?**
> After login, the role (CANDIDATE or RECRUITER) is stored in localStorage. React Router checks this role to redirect to the appropriate dashboard. If a candidate tries to access recruiter routes, they're redirected to login.

**Q: What is the biggest challenge you faced?**
> Managing CORS between frontend (Vercel) and backend (Render), handling JWT token expiry gracefully, and making the multi-step form work smoothly with file uploads and real-time AI scoring.
