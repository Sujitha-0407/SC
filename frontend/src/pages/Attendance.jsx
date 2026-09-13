import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { attendanceService } from "../services/attendanceService";
import { studentService } from "../services/studentService";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Modal } from "../components/Modal";
import { Alert } from "../components/Alert";
import {
  CalendarCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const Attendance = () => {
  const { user, isAdmin } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAtt, setSelectedAtt] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    student_id: "",
    subject: "",
    percentage: "",
    semester: 1,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const stdRes = await studentService.getAll();
      const allStudents = stdRes.students || [];
      setStudents(allStudents);

      if (isAdmin) {
        const attRes = await attendanceService.getAll();
        setAttendance(attRes.attendance || []);
      } else {
        const myStudent = allStudents.find((s) => s.user_id === user?.id);
        if (myStudent) {
          const attRes = await attendanceService.getAll(myStudent.id);
          setAttendance(attRes.attendance || []);
        } else {
          setAttendance([]);
        }
      }
    } catch (err) {
      setError("Failed to load attendance records from backend API.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalError("");
    setFormData({
      student_id: students[0]?.id || "",
      subject: "",
      percentage: "",
      semester: 1,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (att) => {
    setModalError("");
    setSelectedAtt(att);
    setFormData({
      student_id: att.student_id,
      subject: att.subject,
      percentage: att.percentage,
      semester: att.semester,
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (att) => {
    setSelectedAtt(att);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    const pct = parseFloat(formData.percentage);
    const sem = parseInt(formData.semester);

    if (isNaN(pct) || pct < 0 || pct > 100) {
      setModalError("Attendance percentage must be between 0 and 100");
      return;
    }

    if (isNaN(sem) || sem < 1 || sem > 8) {
      setModalError("Semester must be between 1 and 8");
      return;
    }

    setFormSubmitting(true);
    try {
      await attendanceService.create({
        student_id: parseInt(formData.student_id),
        subject: formData.subject.trim(),
        percentage: pct,
        semester: sem,
      });
      setSuccess("Attendance record created successfully!");
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to record attendance");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    const pct = parseFloat(formData.percentage);
    const sem = parseInt(formData.semester);

    if (isNaN(pct) || pct < 0 || pct > 100) {
      setModalError("Attendance percentage must be between 0 and 100");
      return;
    }

    if (isNaN(sem) || sem < 1 || sem > 8) {
      setModalError("Semester must be between 1 and 8");
      return;
    }

    setFormSubmitting(true);
    try {
      await attendanceService.update(selectedAtt.id, {
        subject: formData.subject.trim(),
        percentage: pct,
        semester: sem,
      });
      setSuccess("Attendance record updated successfully!");
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to update attendance");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setFormSubmitting(true);
    try {
      await attendanceService.delete(selectedAtt.id);
      setSuccess("Attendance record deleted successfully!");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete attendance");
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredAttendance = attendance.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      a.subject.toLowerCase().includes(q) ||
      (a.student_name && a.student_name.toLowerCase().includes(q)) ||
      (a.student_roll && a.student_roll.toLowerCase().includes(q));

    const matchesSemester =
      selectedSemester === "all" || a.semester === parseInt(selectedSemester);

    return matchesQuery && matchesSemester;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Attendance Records" />

        <main className="content-area">
          {error && <Alert type="error" message={error} onClose={() => setError("")} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

          {/* Controls header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1, maxWidth: "500px" }}>
              {/* Search */}
              <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "38px" }}
                  placeholder="Search subject or student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
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

              {/* Semester Filter */}
              <select
                className="form-select"
                style={{ width: "160px" }}
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <button onClick={handleOpenAdd} className="btn btn-primary">
                <Plus size={18} />
                <span>Add Attendance</span>
              </button>
            )}
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Semester</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                  {isAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ color: "var(--text-muted)" }}>Loading attendance records...</div>
                    </td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        {searchQuery ? "No records match search." : "No attendance recorded in database."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((a) => {
                    const pct = parseFloat(a.percentage);
                    const isGood = pct >= 75;

                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight: "700", color: "#818cf8" }}>#{a.id}</td>
                        <td>
                          <div>
                            <span style={{ fontWeight: "600", color: "#f8fafc" }}>
                              {a.student_name || `Student ID ${a.student_id}`}
                            </span>
                            {a.student_roll && (
                              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                {a.student_roll}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: "600" }}>{a.subject}</td>
                        <td>
                          <span className="badge" style={{ background: "#1e293b", color: "#94a3b8" }}>
                            Sem {a.semester}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              style={{
                                fontWeight: "700",
                                fontSize: "15px",
                                color: isGood ? "#34d399" : "#fb7185",
                              }}
                            >
                              {a.percentage}%
                            </span>
                            <div
                              style={{
                                width: "80px",
                                height: "6px",
                                borderRadius: "3px",
                                background: "#1e293b",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(100, Math.max(0, pct))}%`,
                                  height: "100%",
                                  background: isGood ? "#10b981" : "#f43f5e",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          {isGood ? (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} />
                              Eligible (≥75%)
                            </span>
                          ) : (
                            <span className="badge badge-admin">
                              <AlertTriangle size={12} />
                              Shortage (&lt;75%)
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              <button
                                onClick={() => handleOpenEdit(a)}
                                className="btn btn-secondary btn-sm"
                                title="Edit Attendance"
                              >
                                <Edit2 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleOpenDelete(a)}
                                className="btn btn-danger btn-sm"
                                title="Delete Attendance"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Add Attendance Modal */}
          <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record Subject Attendance">
            {modalError && <Alert type="error" message={modalError} onClose={() => setModalError("")} />}
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Student</label>
                <select
                  className="form-select"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                >
                  <option value="">Select Student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roll_number}) - Year {s.year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Networks"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Attendance Percentage (0 - 100)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="form-input"
                    placeholder="e.g. 88.5"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester (1 - 8)</label>
                  <select
                    className="form-select"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ margin: "24px -24px -24px -24px" }}>
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </form>
          </Modal>

          {/* Edit Attendance Modal */}
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Attendance Record">
            {modalError && <Alert type="error" message={modalError} onClose={() => setModalError("")} />}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Attendance Percentage (0 - 100)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="form-input"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester (1 - 8)</label>
                  <select
                    className="form-select"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ margin: "24px -24px -24px -24px" }}>
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : "Update Attendance"}
                </button>
              </div>
            </form>
          </Modal>

          {/* Delete Attendance Modal */}
          <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Attendance Record">
            <p style={{ color: "var(--text-primary)", fontSize: "14px", marginBottom: "20px" }}>
              Are you sure you want to delete attendance record for{" "}
              <strong>{selectedAtt?.subject}</strong> ({selectedAtt?.percentage}%)?
            </p>
            <div className="modal-footer" style={{ margin: "24px -24px -24px -24px" }}>
              <button type="button" onClick={() => setIsDeleteOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="btn btn-danger"
                disabled={formSubmitting}
              >
                {formSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
};
