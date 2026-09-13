import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { markService } from "../services/markService";
import { studentService } from "../services/studentService";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Modal } from "../components/Modal";
import { Alert } from "../components/Alert";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Award,
} from "lucide-react";

export const Marks = () => {
  const { user, isAdmin } = useAuth();
  const [marks, setMarks] = useState([]);
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
  const [selectedMark, setSelectedMark] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    student_id: "",
    subject: "",
    marks: "",
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
        const mrkRes = await markService.getAll();
        setMarks(mrkRes.marks || []);
      } else {
        const myStudent = allStudents.find((s) => s.user_id === user?.id);
        if (myStudent) {
          const mrkRes = await markService.getAll(myStudent.id);
          setMarks(mrkRes.marks || []);
        } else {
          setMarks([]);
        }
      }
    } catch (err) {
      setError("Failed to load marks from backend API.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalError("");
    setFormData({
      student_id: students[0]?.id || "",
      subject: "",
      marks: "",
      semester: 1,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (mark) => {
    setModalError("");
    setSelectedMark(mark);
    setFormData({
      student_id: mark.student_id,
      subject: mark.subject,
      marks: mark.marks,
      semester: mark.semester,
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (mark) => {
    setSelectedMark(mark);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    const score = parseFloat(formData.marks);
    const sem = parseInt(formData.semester);

    if (isNaN(score) || score < 0 || score > 100) {
      setModalError("Marks must be between 0 and 100");
      return;
    }

    if (isNaN(sem) || sem < 1 || sem > 8) {
      setModalError("Semester must be between 1 and 8");
      return;
    }

    setFormSubmitting(true);
    try {
      await markService.create({
        student_id: parseInt(formData.student_id),
        subject: formData.subject.trim(),
        marks: score,
        semester: sem,
      });
      setSuccess("Mark entry recorded successfully!");
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to record mark");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    const score = parseFloat(formData.marks);
    const sem = parseInt(formData.semester);

    if (isNaN(score) || score < 0 || score > 100) {
      setModalError("Marks must be between 0 and 100");
      return;
    }

    if (isNaN(sem) || sem < 1 || sem > 8) {
      setModalError("Semester must be between 1 and 8");
      return;
    }

    setFormSubmitting(true);
    try {
      await markService.update(selectedMark.id, {
        subject: formData.subject.trim(),
        marks: score,
        semester: sem,
      });
      setSuccess("Mark entry updated successfully!");
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to update mark");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setFormSubmitting(true);
    try {
      await markService.delete(selectedMark.id);
      setSuccess("Mark entry removed successfully!");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete mark");
    } finally {
      setFormSubmitting(false);
    }
  };

  const getGradeInfo = (score) => {
    const s = parseFloat(score);
    if (s >= 90) return { grade: "A+", badge: "badge-success" };
    if (s >= 80) return { grade: "A", badge: "badge-success" };
    if (s >= 70) return { grade: "B", badge: "badge-student" };
    if (s >= 50) return { grade: "C", badge: "badge-warning" };
    return { grade: "F", badge: "badge-admin" };
  };

  const filteredMarks = marks.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      m.subject.toLowerCase().includes(q) ||
      (m.student_name && m.student_name.toLowerCase().includes(q)) ||
      (m.student_roll && m.student_roll.toLowerCase().includes(q));

    const matchesSemester =
      selectedSemester === "all" || m.semester === parseInt(selectedSemester);

    return matchesQuery && matchesSemester;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Marks & Grades" />

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
                <span>Add Mark</span>
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
                  <th>Score (out of 100)</th>
                  <th>Grade</th>
                  {isAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ color: "var(--text-muted)" }}>Loading academic marks...</div>
                    </td>
                  </tr>
                ) : filteredMarks.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        {searchQuery ? "No marks match the current search filters." : "No marks recorded in database."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMarks.map((m) => {
                    const gradeInfo = getGradeInfo(m.marks);
                    return (
                      <tr key={m.id}>
                        <td style={{ fontWeight: "700", color: "#818cf8" }}>#{m.id}</td>
                        <td>
                          <div>
                            <span style={{ fontWeight: "600", color: "#f8fafc" }}>
                              {m.student_name || `Student ID ${m.student_id}`}
                            </span>
                            {m.student_roll && (
                              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                {m.student_roll}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: "600" }}>{m.subject}</td>
                        <td>
                          <span className="badge" style={{ background: "#1e293b", color: "#94a3b8" }}>
                            Sem {m.semester}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontWeight: "700", fontSize: "15px", color: "#f8fafc" }}>
                              {m.marks}
                            </span>
                            <div
                              style={{
                                width: "60px",
                                height: "6px",
                                borderRadius: "3px",
                                background: "#1e293b",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(100, Math.max(0, m.marks))}%`,
                                  height: "100%",
                                  background: m.marks >= 70 ? "#10b981" : m.marks >= 50 ? "#f59e0b" : "#f43f5e",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${gradeInfo.badge}`}>
                            {gradeInfo.grade}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              <button
                                onClick={() => handleOpenEdit(m)}
                                className="btn btn-secondary btn-sm"
                                title="Edit Mark"
                              >
                                <Edit2 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleOpenDelete(m)}
                                className="btn btn-danger btn-sm"
                                title="Delete Mark"
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

          {/* Add Mark Modal */}
          <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record Academic Mark">
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
                  placeholder="e.g. Operating Systems"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Marks (0 - 100)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="form-input"
                    placeholder="e.g. 85.5"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
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
                  {formSubmitting ? "Saving..." : "Save Mark"}
                </button>
              </div>
            </form>
          </Modal>

          {/* Edit Mark Modal */}
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Mark Entry">
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
                  <label className="form-label">Marks (0 - 100)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="form-input"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
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
                  {formSubmitting ? "Saving..." : "Update Mark"}
                </button>
              </div>
            </form>
          </Modal>

          {/* Delete Modal */}
          <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Mark Record">
            <p style={{ color: "var(--text-primary)", fontSize: "14px", marginBottom: "20px" }}>
              Are you sure you want to delete the mark record for{" "}
              <strong>{selectedMark?.subject}</strong> (Score: {selectedMark?.marks})?
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
