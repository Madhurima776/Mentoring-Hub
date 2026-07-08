# 🎓 Mentoring Hub — SVECW

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=flat&logo=jsonwebtokens&logoColor=white)

---

## 📌 Overview

Managing student mentoring manually — collecting weekly reports from faculty, tracking attendance, monitoring academic progress, and coordinating between mentors and coordinators — is time-consuming and highly error-prone.

**Mentoring Hub** solves this by digitizing the entire mentoring workflow for **Sreenidhi Institute of Engineering and Technology for Women (SVECW)**. Mentors submit structured weekly reports online, coordinators get real-time visibility into faculty response rates and student performance, and the admin can bulk-upload all users via CSV/Excel. Every role gets a dedicated dashboard with only the data and actions relevant to them, secured via JWT-based role authentication.

---

## 🚀 Features

### 👨‍💼 Admin
- Bulk upload students, mentors, and coordinators via CSV/Excel
- Manage and activate/deactivate user accounts
- System-wide user management

### 🧑‍🏫 Coordinator / HOD
- View all mentors and students in the department
- Assign students to mentors
- Monitor weekly report submissions — see who has and hasn't submitted
- Send individual or bulk reminders to pending mentors
- Download weekly reports as PDF
- View and resolve issues raised by mentors
- Manage mentor leave and assign substitutes
- Track student certifications by month with PDF export
- View all mentor assignments

### 👨‍🏫 Mentor
- View allocated students with academic and personal details
- Submit structured weekly reports (attendance, progress, issues)
- Issue purpose → outcome records for students
- Ask questions to students and track responses
- Record and view mentoring sessions
- Receive reminders from coordinator

### 👩‍🎓 Student
- View personal profile and update personal information
- Track academic marks (mid + semester) with progress bars
- View attendance synced from ECAP
- Answer questions from mentor
- Add extra-curricular activities, awards, and certifications
- View and mark reminders as read

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Lucide React      |
| Backend    | Node.js, Express 5                              |
| Database   | MongoDB, Mongoose                               |
| Auth       | JWT (JSON Web Tokens), bcryptjs                 |
| File Upload| Multer, ExcelJS, csv-parser                     |
| PDF Export | PDFKit                                          |

---

## 📁 Folder Structure

```
counselling-hub/
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, StatCard, ProtectedRoute
│   │   ├── context/           # AuthContext, useAuth
│   │   ├── pages/
│   │   │   ├── dashboards/    # StudentDashboard, MentorDashboard, etc.
│   │   │   ├── student/       # Profile, Academic, Awards, Certifications, Questions, Reminders
│   │   │   ├── mentor/        # Students, Sessions, Questions, WeeklyReport, Issues, Reminders
│   │   │   ├── coordinator/   # Mentors, Students, Assignments, Leave, Reports, Issues, Certificates, Reminders
│   │   │   └── admin/         # BulkUpload, ManageUsers
│   │   ├── api.js             # Axios instance
│   │   └── App.jsx            # Routes
│   └── package.json
│
├── backend/
│   ├── controllers/           # authController, adminController, mentorController, etc.
│   ├── models/                # User, WeeklyReport, Session, Issue, Assignment, etc.
│   ├── routes/                # authRoutes, adminRoutes, mentorRoutes, etc.
│   ├── middleware/            # authMiddleware (protect, role guard)
│   ├── uploads/               # Multer upload destination
│   ├── seed.js                # Initial seed data
│   └── server.js              # Express entry point
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account or local MongoDB instance

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mentoring-hub.git
cd mentoring-hub
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

Seed the initial users:
```bash
node seed.js
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 🔐 Default Login Credentials (after seeding)

| Role        | Email                          | Password      |
|-------------|--------------------------------|---------------|
| Admin       | admin@svecw.edu.in             | Welcome@123   |
| Coordinator | sunitha.rao@svecw.edu.in       | Welcome@123   |
| Mentor      | ravi.kumar@svecw.edu.in        | Welcome@123   |
| Student     | priya.sharma@svecw.edu.in      | Welcome@123   |

> ⚠️ Change passwords after first login. First-login users are redirected to the change password screen automatically.

---

## 📄 License

This project was built  for **SVECW — Shri Vishnu Engineering College for Women**.  
For educational and institutional use only.

---

## 👩‍💻 Developed By

**Madhurima** — III B.Tech, SVECW  
