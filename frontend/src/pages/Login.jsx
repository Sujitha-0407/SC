import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Lock, User, ArrowRight } from "lucide-react";
import { Alert } from "../components/Alert";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get("session_expired");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (!err.response) {
          msg = "Cannot connect to Flask server at http://127.0.0.1:5000. Please start the backend.";
        } else {
          msg = "Failed to sign in. Please verify your credentials.";
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.12) 0%, rgba(9, 13, 22, 1) 70%)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
              marginBottom: "16px",
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#f8fafc", margin: "0 0 8px 0" }}>
            Secure Student Portal
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
            Role-Based Authentication & Academic Management
          </p>
        </div>

        {/* Card */}
        <div className="card">
          {isExpired && (
            <Alert
              type="info"
              message="Your session has expired. Please sign in again."
            />
          )}

          {error && <Alert type="error" message={error} onClose={() => setError("")} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "42px" }}
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
                <User
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: "42px" }}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
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
              style={{ width: "100%", padding: "12px", fontSize: "15px" }}
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for evaluation */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", textAlign: "center" }}>
              Quick Credentials (Demo & Evaluation):
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                onClick={() => fillDemo("admin01", "Admin@123")}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "11px" }}
              >
                Admin (admin01)
              </button>
              <button
                type="button"
                onClick={() => fillDemo("student01", "Student@123")}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "11px" }}
              >
                Student (student01)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#818cf8", fontWeight: "600", textDecoration: "none" }}>
              Register as Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
