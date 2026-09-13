import React from "react";
import { useAuth } from "../context/AuthContext";
import { User, Shield, LogOut } from "lucide-react";

export const Navbar = ({ title }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: isAdmin ? "rgba(244, 63, 94, 0.15)" : "rgba(99, 102, 241, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isAdmin ? "#f43f5e" : "#818cf8",
            }}
          >
            {isAdmin ? <Shield size={18} /> : <User size={18} />}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>
              {user?.username}
            </span>
            <span className={`badge ${isAdmin ? "badge-admin" : "badge-student"}`} style={{ alignSelf: "flex-start", padding: "2px 8px", fontSize: "10px" }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ gap: "6px" }}
          title="Sign out"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
