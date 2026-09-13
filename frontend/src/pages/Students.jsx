import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/studentService";
import { authService } from "../services/authService";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Modal } from "../components/Modal";
import { Alert } from "../components/Alert";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";

export const Students = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    user_id: "",
    roll_number: "",
    name: "",
    department: "",
    year: 1,
    email: "",
    phone: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    loadStudents();
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentService.getAll();
      setStudents(data.students || []);
    } catch (err) {
      setError("Failed to fetch students from backend.");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await authService.getUsers();
      setAvailableUsers(data.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAdd = () => {
    setModalError("");
    setFormData({
      user_id: availableUsers.find((u) => !u.has_student_profile)?.id || "",
      roll_number: "",
      name: "",
      department: "",
      year: 1,
      email: "",
      phone: "",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (student) => {
    setModalError("");
    setSelectedStudent(student);
    setFormData({
      user_id: student.user_id,
      roll_number: student.roll_number,
      name: student.name,
      department: student.department,
      year: student.year,
      email: student.email,
      phone: student.phone || "",
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setFormSubmitting(true);

    try {
      await studentService.create({
        user_id: parseInt(formData.user_id),
        roll_number: formData.roll_number.trim(),
        name: formData.name.trim(),
        department: formData.department.trim(),
        year: parseInt(formData.year),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
      setSuccess("Student created successfully!");
      setIsAddOpen(false);
      loadStudents();
      loadUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to create student");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setFormSubmitting(true);

    try {
      await studentService.update(selectedStudent.id, {
        roll_number: formData.roll_number.trim(),
        name: formData.name.trim(),
        department: formData.department.trim(),
        year: parseInt(formData.year),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
      setSuccess("Student record updated successfully!");
      setIsEditOpen(false);
      loadStudents();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to update student");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setFormSubmitting(true);
    try {
      await studentService.delete(selectedStudent.id);
      setSuccess("Student record deleted successfully!");
      setIsDeleteOpen(false);
      loadStudents();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.roll_number.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Students Management" />

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
            {/* Search Input */}
            <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "38px" }}
                placeholder="Search by name, roll no, department..."
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

            {/* Action buttons */}
            {isAdmin && (
              <button onClick={handleOpenAdd} className="btn btn-primary">
                <Plus size={18} />
                <span>Add Student</span>
              </button>
            )}
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Contact Info</th>
                  {isAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ color: "var(--text-muted)" }}>Loading students...</div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center", padding: "40px" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        {searchQuery ? "No students match your search filter." : "No student records found in database."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: "700", color: "#818cf8" }}>#{s.id}</td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            background: "rgba(255, 255, 255, 0.05)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "13px",
                          }}
                        >
                          {s.roll_number}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600", color: "#f8fafc" }}>{s.name}</td>
                      <td>{s.department}</td>
                      <td>
                        <span className="badge badge-student">Year {s.year}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "12px" }}>
                          <span style={{ color: "var(--text-secondary)" }}>{s.email}</span>
                          {s.phone && <span style={{ color: "var(--text-muted)" }}>{s.phone}</span>}
                        </div>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Student"
                            >
                              <Edit2 size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleOpenDelete(s)}
                              className="btn btn-danger btn-sm"
                              title="Delete Student"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Student Modal */}
          <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Student">
            {modalError && <Alert type="error" message={modalError} onClose={() => setModalError("")} />}
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Linked User Account (user_id)</label>
                <select
                  className="form-select"
                  value={formData.user_id}
                  onChange={(e) => {
                    const uid = e.target.value;
                    const u = availableUsers.find((x) => x.id === parseInt(uid));
                    setFormData({
                      ...formData,
                      user_id: uid,
                      email: u ? u.email : formData.email,
                    });
                  }}
                  required
                >
                  <option value="">Select User Account...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id} disabled={u.has_student_profile}>
                      ID #{u.id} - {u.username} ({u.role}) {u.has_student_profile ? "[Profile Exists]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS101"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year (1-5)</label>
                  <select
                    className="form-select"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  >
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ margin: "24px -24px -24px -24px" }}>
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? "Creating..." : "Save Student"}
                </button>
              </div>
            </form>
          </Modal>

          {/* Edit Student Modal */}
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Student Record">
            {modalError && <Alert type="error" message={modalError} onClose={() => setModalError("")} />}
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year (1-5)</label>
                  <select
                    className="form-select"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  >
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ margin: "24px -24px -24px -24px" }}>
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : "Update Record"}
                </button>
              </div>
            </form>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Student Record">
            <div style={{ marginBottom: "20px" }}>
              <p style={{ color: "var(--text-primary)", marginBottom: "8px", fontSize: "14px" }}>
                Are you sure you want to permanently delete student{" "}
                <strong>{selectedStudent?.name}</strong> ({selectedStudent?.roll_number})?
              </p>
              <p style={{ color: "var(--accent-rose)", fontSize: "12px", margin: 0 }}>
                Warning: This will cascade and delete all associated marks and attendance records for this student.
              </p>
            </div>
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
