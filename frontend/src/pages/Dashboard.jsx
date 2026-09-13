import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/studentService";
import { markService } from "../services/markService";
import { attendanceService } from "../services/attendanceService";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { StatCard } from "../components/StatCard";
import { Alert } from "../components/Alert";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle,
  PlusCircle,
} from "lucide-react";

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        // Admin fetches system totals
        const [stdRes, mrkRes, attRes] = await Promise.all([
          studentService.getAll(),
          markService.getAll(),
          attendanceService.getAll(),
        ]);
        setStudents(stdRes.students || []);
        setMarks(mrkRes.marks || []);
        setAttendance(attRes.attendance || []);
      } else {
        // Student fetches their records
        const stdRes = await studentService.getAll();
        const allStudents = stdRes.students || [];
        const myStudent = allStudents.find((s) => s.user_id === user?.id);

        if (myStudent) {
          setStudents([myStudent]);
          const [mrkRes, attRes] = await Promise.all([
            markService.getAll(myStudent.id),
            attendanceService.getAll(myStudent.id),
          ]);
          setMarks(mrkRes.marks || []);
          setAttendance(attRes.attendance || []);
        } else {
          setStudents([]);
          setMarks([]);
          setAttendance([]);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard statistics from backend API.");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalStudents = students.length;
  const totalMarksCount = marks.length;
  const avgMarks =
    marks.length > 0
      ? (marks.reduce((acc, curr) => acc + (parseFloat(curr.marks) || 0), 0) / marks.length).toFixed(1)
      : "0";
  const avgAttendance =
    attendance.length > 0
      ? (attendance.reduce((acc, curr) => acc + (parseFloat(curr.percentage) || 0), 0) / attendance.length).toFixed(1)
      : "0";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Academic Dashboard" />

        <main className="content-area">
          {error && <Alert type="error" message={error} onClose={() => setError("")} />}

          {/* Welcome Banner */}
          <div
            className="card"
            style={{
              marginBottom: "28px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(17, 23, 38, 0.9) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    color: "#818cf8",
                    textTransform: "uppercase",
                  }}
                >
                  Welcome back
                </span>
                <span className={`badge ${isAdmin ? "badge-admin" : "badge-student"}`}>
                  {user?.role} ACCESS
                </span>
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", margin: "0 0 6px 0" }}>
                Hello, {user?.username}!
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                {isAdmin
                  ? "You have full administrative privileges to manage student profiles, grade sheets, and attendance records."
                  : "Welcome to your student portal. You can view your enrolled academic details, course marks, and attendance summary below."}
              </p>
            </div>

            {isAdmin && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link to="/students" className="btn btn-primary btn-sm">
                  <PlusCircle size={15} />
                  <span>Manage Students</span>
                </Link>
                <Link to="/marks" className="btn btn-secondary btn-sm">
                  <GraduationCap size={15} />
                  <span>Enter Marks</span>
                </Link>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid-cols-4" style={{ marginBottom: "28px" }}>
            <StatCard
              title={isAdmin ? "Total Students" : "My Profile Status"}
              value={isAdmin ? totalStudents : students.length > 0 ? "Linked" : "Pending Profile"}
              subtitle={isAdmin ? "Enrolled in institution" : students[0]?.roll_number || "Contact Admin to link"}
              icon={Users}
              color="indigo"
            />
            <StatCard
              title={isAdmin ? "Recorded Marks" : "Enrolled Subjects"}
              value={totalMarksCount}
              subtitle={isAdmin ? "Total subject grades" : "Subjects evaluated"}
              icon={BookOpen}
              color="emerald"
            />
            <StatCard
              title={isAdmin ? "Average Grade Score" : "My Average Marks"}
              value={`${avgMarks}%`}
              subtitle="Calculated performance"
              icon={GraduationCap}
              color="cyan"
            />
            <StatCard
              title={isAdmin ? "Institution Attendance" : "My Attendance Avg"}
              value={`${avgAttendance}%`}
              subtitle={parseFloat(avgAttendance) >= 75 ? "Meets 75% requirement" : "Low attendance warning"}
              icon={CalendarCheck}
              color={parseFloat(avgAttendance) >= 75 ? "emerald" : "amber"}
            />
          </div>

          {/* Recent Records & Quick Links */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
            {/* Quick Navigation Panel */}
            <div className="card">
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                System Modules
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link
                  to="/students"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "#818cf8",
                      }}
                    >
                      <Users size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>
                        Students Directory
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {isAdmin ? "Create, edit, view and manage students" : "Browse student records"}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </Link>

                <Link
                  to="/marks"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-emerald)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#34d399",
                      }}
                    >
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>
                        Marks & Academic Grades
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {isAdmin ? "Add, update and audit semester grades" : "View your academic performance"}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </Link>

                <Link
                  to="/attendance"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-cyan)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        background: "rgba(6, 182, 212, 0.15)",
                        color: "#22d3ee",
                      }}
                    >
                      <CalendarCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>
                        Attendance Records
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {isAdmin ? "Track & record subject attendance" : "Check your attendance percentages"}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </Link>
              </div>
            </div>

            {/* Security & System Info */}
            <div className="card">
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                Security & RBAC Controls
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <CheckCircle size={16} color="#34d399" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#f8fafc" }}>JWT Bearer Protection:</strong>
                    <p style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                      All API communications require a cryptographically signed HMAC SHA-256 JWT token with 1-hour expiry.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <CheckCircle size={16} color="#34d399" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#f8fafc" }}>Role-Based Access Enforcement:</strong>
                    <p style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                      Enforced server-side with Flask middleware. Students attempting management operations receive HTTP 403 Access Denied.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <CheckCircle size={16} color="#34d399" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#f8fafc" }}>Input Validation:</strong>
                    <p style={{ color: "var(--text-secondary)", marginTop: "2px" }}>
                      Marks and attendance are strictly restricted between 0–100, semesters 1–8, with duplicate roll number detection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
