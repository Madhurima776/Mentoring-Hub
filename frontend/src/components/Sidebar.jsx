import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ICONS = {
  overview:     "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  profile:      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  students:     "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  sessions:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  questions:    "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  reminders:    "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  academic:     "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  awards:       "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  certs:        "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  issues:       "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  reports:      "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  assign:       "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  users:        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  upload:       "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  leave:        "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const NAV_BY_ROLE = {
  student: [
    { label: "Overview",       to: "/dashboard",              icon: "overview"  },
    { label: "My Profile",     to: "/student/profile",        icon: "profile"   },
    { label: "Academic Marks", to: "/student/academic",       icon: "academic"  },
    { label: "Awards",         to: "/student/awards",         icon: "awards"    },
    { label: "Certifications", to: "/student/certifications", icon: "certs"     },
    { label: "Questions",      to: "/student/questions",      icon: "questions" },
    { label: "Reminders",      to: "/student/reminders",      icon: "reminders" },
  ],
  mentor: [
    { label: "Overview",       to: "/dashboard",              icon: "overview"  },
    { label: "My Students",    to: "/mentor/students",        icon: "students"  },
    { label: "Sessions",       to: "/mentor/sessions",        icon: "sessions"  },
    { label: "Questions",      to: "/mentor/questions",       icon: "questions" },
    { label: "Weekly Report",  to: "/mentor/report",          icon: "reports"   },
    { label: "Issues",         to: "/mentor/issues",          icon: "issues"    },
    { label: "Reminders",      to: "/mentor/reminders",       icon: "reminders" },
  ],
  coordinator: [
    { label: "Overview",       to: "/dashboard",                   icon: "overview" },
    { label: "Mentors",        to: "/coordinator/mentors",         icon: "students" },
    { label: "Students",       to: "/coordinator/students",        icon: "users"    },
    { label: "Assignments",    to: "/coordinator/assignments",     icon: "assign"   },
    { label: "Leave & Sub",    to: "/coordinator/leave",           icon: "leave"    },
    { label: "Weekly Reports", to: "/coordinator/reports",         icon: "reports"  },
    { label: "Issues",         to: "/coordinator/issues",          icon: "issues"   },
    { label: "Certificates",   to: "/coordinator/certificates",    icon: "certs"    },
    { label: "Reminders",      to: "/coordinator/reminders",       icon: "reminders"},
  ],
  admin: [
    { label: "Overview",       to: "/dashboard",         icon: "overview" },
    { label: "Bulk Upload",    to: "/admin/upload",      icon: "upload"   },
    { label: "Manage Users",   to: "/admin/users",       icon: "users"    },
  ],
};

function NavIcon({ path }) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role   = user?.role || "student";
  const navItems = NAV_BY_ROLE[role] || [];

  return (
    <aside className="w-56 bg-green-900 flex flex-col p-4 shrink-0 h-screen sticky top-0">

      {/* Logo */}
      <div className="mb-6">
        <h1 className="text-white text-base font-bold leading-tight">
          Mentoring<span className="text-green-300"> Hub</span>
        </h1>
        <p className="text-green-400 text-xs mt-0.5 tracking-widest uppercase">
          SVECW
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
               transition-all
               ${isActive
                 ? "bg-white text-green-900 font-medium shadow-sm"
                 : "text-green-100 hover:bg-green-700/50"
               }`
            }
          >
            <NavIcon path={ICONS[item.icon]} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-green-700 pt-3 mt-3">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-7 h-7 rounded-full bg-green-600 flex items-center
                          justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-green-400 text-xs capitalize">{role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg
                     text-xs text-red-300 hover:bg-red-500/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor"
               strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}