import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Lock, User, Mail, UserPlus, CheckCircle2 } from "lucide-react";
import { Alert } from "../components/Alert";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !email.trim() || !password) {
      setError("All fields are required");
      return;
    }

    if (username.length < 3 || username.length > 50) {
      setError("Username must be between 3 and 50 characters");
      return;
    }

    if (!email.includes("@") || !email.split("@")[1]?.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      setSuccess("Account successfully created with STUDENT role! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (!err.response) {
          msg = "Cannot connect to Flask server at http://127.0.0.1:5000. Please start the backend.";
        } else {
          msg = "Registration failed. Please check your inputs.";
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
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
      <div style={{ width: "100%", maxWidth: "460px" }}>
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
            <UserPlus size={30} />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#f8fafc", margin: "0 0 8px 0" }}>
            Student Registration
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
            Create your student portal account (Role: STUDENT)
          </p>
        </div>

        {/* Card */}
        <div className="card">
          {error && <Alert type="error" message={error} onClose={() => setError("")} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "42px" }}
                  placeholder="e.g. rahul_verma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: "42px" }}
                  placeholder="e.g. rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail
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

            <div className="form-group">
              <label className="form-label">Password (min 8 characters)</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: "42px" }}
                  placeholder="Create strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: "42px" }}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <span>Creating Account...</span> : <span>Register Account</span>}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#818cf8", fontWeight: "600", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
