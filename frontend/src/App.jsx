import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth }                  from "./context/useAuth";

// Auth pages
import Login          from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";

// Dashboards
import StudentDashboard     from "./pages/dashboards/StudentDashboard";
import MentorDashboard      from "./pages/dashboards/MentorDashboard";
import CoordinatorDashboard from "./pages/dashboards/CoordinatorDashboard";
import AdminDashboard       from "./pages/dashboards/AdminDashboard";

// Student pages
import StudentProfile       from "./pages/student/Profile";
import StudentAcademic      from "./pages/student/Academic";
import StudentAwards        from "./pages/student/Awards";
import StudentCertifications from "./pages/student/Certifications";
import StudentQuestions     from "./pages/student/Questions";
import StudentReminders     from "./pages/student/Reminders";

// Mentor pages
import MentorStudents  from "./pages/mentor/Students";
import MentorSessions  from "./pages/mentor/Sessions";
import MentorQuestions from "./pages/mentor/Questions";
import MentorReport    from "./pages/mentor/WeeklyReport";
import MentorIssues    from "./pages/mentor/Issues";
import MentorReminders from "./pages/mentor/Reminders";

// Coordinator pages
import CoordMentors      from "./pages/coordinator/Mentors";
import CoordStudents     from "./pages/coordinator/Students";
import CoordAssignments  from "./pages/coordinator/Assignments";
import CoordLeave        from "./pages/coordinator/Leave";
import CoordReports      from "./pages/coordinator/Reports";
import CoordIssues       from "./pages/coordinator/Issues";
import CoordCertificates from "./pages/coordinator/Certificates";
import CoordReminders    from "./pages/coordinator/Reminders";

// Admin pages
import AdminUpload from "./pages/admin/BulkUpload";
import AdminUsers  from "./pages/admin/ManageUsers";

import ProtectedRoute from "./components/ProtectedRoute";

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const map = {
    student:     <StudentDashboard     />,
    mentor:      <MentorDashboard      />,
    coordinator: <CoordinatorDashboard />,
    admin:       <AdminDashboard       />,
  };
  return map[user.role] || <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                 element={<Login />} />
      <Route path="/change-password"  element={
        <ProtectedRoute><ChangePassword /></ProtectedRoute>
      } />

      {/* Dashboard — role based */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
      } />

      {/* Student routes */}
      <Route path="/student/profile"        element={<ProtectedRoute roles={["student"]}><StudentProfile       /></ProtectedRoute>} />
      <Route path="/student/academic"       element={<ProtectedRoute roles={["student"]}><StudentAcademic      /></ProtectedRoute>} />
      <Route path="/student/awards"         element={<ProtectedRoute roles={["student"]}><StudentAwards        /></ProtectedRoute>} />
      <Route path="/student/certifications" element={<ProtectedRoute roles={["student"]}><StudentCertifications /></ProtectedRoute>} />
      <Route path="/student/questions"      element={<ProtectedRoute roles={["student"]}><StudentQuestions     /></ProtectedRoute>} />
      <Route path="/student/reminders"      element={<ProtectedRoute roles={["student"]}><StudentReminders     /></ProtectedRoute>} />

      {/* Mentor routes */}
      <Route path="/mentor/students"  element={<ProtectedRoute roles={["mentor"]}><MentorStudents  /></ProtectedRoute>} />
      <Route path="/mentor/sessions"  element={<ProtectedRoute roles={["mentor"]}><MentorSessions  /></ProtectedRoute>} />
      <Route path="/mentor/questions" element={<ProtectedRoute roles={["mentor"]}><MentorQuestions /></ProtectedRoute>} />
      <Route path="/mentor/report"    element={<ProtectedRoute roles={["mentor"]}><MentorReport    /></ProtectedRoute>} />
      <Route path="/mentor/issues"    element={<ProtectedRoute roles={["mentor"]}><MentorIssues    /></ProtectedRoute>} />
      <Route path="/mentor/reminders" element={<ProtectedRoute roles={["mentor"]}><MentorReminders /></ProtectedRoute>} />

      {/* Coordinator routes */}
      <Route path="/coordinator/mentors"       element={<ProtectedRoute roles={["coordinator"]}><CoordMentors      /></ProtectedRoute>} />
      <Route path="/coordinator/students"      element={<ProtectedRoute roles={["coordinator"]}><CoordStudents     /></ProtectedRoute>} />
      <Route path="/coordinator/assignments"   element={<ProtectedRoute roles={["coordinator"]}><CoordAssignments  /></ProtectedRoute>} />
      <Route path="/coordinator/leave"         element={<ProtectedRoute roles={["coordinator"]}><CoordLeave        /></ProtectedRoute>} />
      <Route path="/coordinator/reports"       element={<ProtectedRoute roles={["coordinator"]}><CoordReports      /></ProtectedRoute>} />
      <Route path="/coordinator/issues"        element={<ProtectedRoute roles={["coordinator"]}><CoordIssues       /></ProtectedRoute>} />
      <Route path="/coordinator/certificates"  element={<ProtectedRoute roles={["coordinator"]}><CoordCertificates /></ProtectedRoute>} />
      <Route path="/coordinator/reminders"     element={<ProtectedRoute roles={["coordinator"]}><CoordReminders    /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/upload" element={<ProtectedRoute roles={["admin"]}><AdminUpload /></ProtectedRoute>} />
      <Route path="/admin/users"  element={<ProtectedRoute roles={["admin"]}><AdminUsers  /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}