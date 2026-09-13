import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  UserCircle,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Students", path: "/students", icon: Users },
    { name: "Marks", path: "/marks", icon: GraduationCap },
    { name: "Attendance", path: "/attendance", icon: CalendarCheck },
    { name: "Profile", path: "/profile", icon: UserCircle },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
          }}
        >
          <ShieldCheck size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "-0.5px" }}>
            SecureSMS
          </h2>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Student System
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: "20px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: isActive ? "700" : "500",
                textDecoration: "none",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                backgroundColor: isActive ? "rgba(99, 102, 241, 0.16)" : "transparent",
                border: isActive ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                transition: "all 0.15s ease",
              })}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Role badge */}
      <div
        style={{
          padding: "20px 16px",
          borderTop: "1px solid var(--border-color)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Active Role
            </div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: isAdmin ? "#f43f5e" : "#818cf8" }}>
              {user?.role}
            </div>
          </div>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "6px",
              background: "#1e293b",
              color: "#94a3b8",
            }}
          >
            v1.0
          </span>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: "100%", justifyContent: "center", fontSize: "13px", padding: "8px 12px" }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
