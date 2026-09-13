import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { studentService } from "../services/studentService";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Alert } from "../components/Alert";
import {
  UserCircle,
  Mail,
  Shield,
  Calendar,
  Save,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";

export const Profile = () => {
  const { user, isAdmin, updateProfile, refreshUser } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // RBAC test
  const [adminTestResult, setAdminTestResult] = useState(null);
  const [testingAdmin, setTestingAdmin] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    fetchProfileDetails();
  }, [user]);

  const fetchProfileDetails = async () => {
    try {
      const meData = await authService.getMe();
      if (meData.user?.email) {
        setEmail(meData.user.email);
      }
      if (meData.user?.student_id) {
        const std = await studentService.getById(meData.user.student_id);
        setStudentInfo(std.student);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ email: email.trim() });
      setSuccess("Profile email updated successfully!");
      refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const runAdminTest = async () => {
    setTestingAdmin(true);
    setAdminTestResult(null);
    try {
      const res = await authService.testAdminAccess();
      setAdminTestResult({
        success: true,
        message: res.message || "HTTP 200: You have verified ADMIN access!",
      });
    } catch (err) {
      setAdminTestResult({
        success: false,
        message:
          err.response?.data?.message === "Access denied"
            ? "HTTP 403: Access Denied (STUDENT cannot perform ADMIN operations)"
            : "Verification failed.",
      });
    } finally {
      setTestingAdmin(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Account & Security Profile" />

        <main className="content-area">
          {error && <Alert type="error" message={error} onClose={() => setError("")} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "28px" }}>
            {/* User Profile Card */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "18px",
                    background: isAdmin
                      ? "linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.05) 100%)"
                      : "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)",
                    border: `1px solid ${isAdmin ? "rgba(244, 63, 94, 0.3)" : "rgba(99, 102, 241, 0.3)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isAdmin ? "#f43f5e" : "#818cf8",
                  }}
                >
                  <UserCircle size={36} />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", margin: "0 0 4px 0" }}>
                    {user?.username}
                  </h2>
                  <span className={`badge ${isAdmin ? "badge-admin" : "badge-student"}`}>
                    ROLE: {user?.role}
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label className="form-label">Username (System Identifier)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.username || ""}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Usernames are immutable for security and audit trail.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Security Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.role || ""}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Enforced via backend JWT claims and SQLAlchemy roles middleware.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: "38px" }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Mail
                      size={18}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "10px" }}
                  disabled={loading}
                >
                  <Save size={16} />
                  <span>{loading ? "Saving Changes..." : "Update Profile"}</span>
                </button>
              </form>
            </div>

            {/* Linked Student Card & Security Testing */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Linked Student Info */}
              {studentInfo && (
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <GraduationCap size={20} color="#818cf8" />
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                      Linked Student Profile
                    </h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Full Name:</span>
                      <div style={{ fontWeight: "600", color: "#f8fafc", marginTop: "2px" }}>
                        {studentInfo.name}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Roll Number:</span>
                      <div style={{ fontWeight: "600", color: "#818cf8", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                        {studentInfo.roll_number}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Department:</span>
                      <div style={{ fontWeight: "600", color: "#f8fafc", marginTop: "2px" }}>
                        {studentInfo.department}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Current Year:</span>
                      <div style={{ fontWeight: "600", color: "#f8fafc", marginTop: "2px" }}>
                        Year {studentInfo.year}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RBAC Verification Live Test */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <Shield size={20} color="#f59e0b" />
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                    Live RBAC Verification Test
                  </h3>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  This tests the backend endpoint <code style={{ color: "#818cf8" }}>GET /api/auth/admin-test</code> using your current JWT.
                  Demonstrates that security is enforced by Flask middleware on the server, not just hidden buttons.
                </p>

                <button
                  type="button"
                  onClick={runAdminTest}
                  className="btn btn-secondary"
                  disabled={testingAdmin}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {testingAdmin ? "Verifying with server..." : "Test ADMIN Privilege Endpoint"}
                </button>

                {adminTestResult && (
                  <div style={{ marginTop: "14px" }}>
                    <Alert
                      type={adminTestResult.success ? "success" : "error"}
                      message={adminTestResult.message}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
