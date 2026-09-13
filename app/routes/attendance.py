from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.models.attendance import Attendance
from app.middleware.roles import role_required


attendance_bp = Blueprint("attendance", __name__)


# CREATE ATTENDANCE
@attendance_bp.route("/api/attendance", methods=["POST"])
@role_required("ADMIN")
def create_attendance():
    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "student_id",
        "subject",
        "percentage",
        "semester"
    ]

    for field in required_fields:
        if data.get(field) is None or data.get(field) == "":
            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    # Validate percentage
    if (
        not isinstance(data["percentage"], (int, float))
        or data["percentage"] < 0
        or data["percentage"] > 100
    ):
        return jsonify({
            "status": "error",
            "message": "Attendance percentage must be between 0 and 100"
        }), 400

    # Validate semester
    if (
        not isinstance(data["semester"], int)
        or data["semester"] < 1
        or data["semester"] > 8
    ):
        return jsonify({
            "status": "error",
            "message": "Semester must be between 1 and 8"
        }), 400

    # Check student exists
    from app.models.student import Student

    student = Student.query.get(data["student_id"])

    if not student:
        return jsonify({
            "status": "error",
            "message": "Student not found"
        }), 404

    attendance = Attendance(
        student_id=data["student_id"],
        subject=data["subject"],
        percentage=data["percentage"],
        semester=data["semester"]
    )

    db.session.add(attendance)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Attendance created successfully",
        "attendance": {
            "id": attendance.id,
            "student_id": attendance.student_id,
            "subject": attendance.subject,
            "percentage": attendance.percentage,
            "semester": attendance.semester
        }
    }), 201


# GET ALL ATTENDANCE
@attendance_bp.route("/api/attendance", methods=["GET"])
@jwt_required()
def get_attendance():
    student_id = request.args.get("student_id", type=int)
    if student_id:
        attendance_records = Attendance.query.filter_by(student_id=student_id).all()
    else:
        attendance_records = Attendance.query.all()

    result = []

    for attendance in attendance_records:
        result.append({
            "id": attendance.id,
            "student_id": attendance.student_id,
            "student_name": attendance.student.name if attendance.student else "Unknown",
            "student_roll": attendance.student.roll_number if attendance.student else "Unknown",
            "subject": attendance.subject,
            "percentage": attendance.percentage,
            "semester": attendance.semester
        })

    return jsonify({
        "status": "success",
        "attendance": result
    }), 200


# GET ATTENDANCE BY ID
@attendance_bp.route("/api/attendance/<int:attendance_id>", methods=["GET"])
@jwt_required()
def get_attendance_by_id(attendance_id):
    attendance = Attendance.query.get(attendance_id)

    if not attendance:
        return jsonify({
            "status": "error",
            "message": "Attendance record not found"
        }), 404

    return jsonify({
        "status": "success",
        "attendance": {
            "id": attendance.id,
            "student_id": attendance.student_id,
            "student_name": attendance.student.name if attendance.student else "Unknown",
            "student_roll": attendance.student.roll_number if attendance.student else "Unknown",
            "subject": attendance.subject,
            "percentage": attendance.percentage,
            "semester": attendance.semester
        }
    }), 200


# UPDATE ATTENDANCE
@attendance_bp.route("/api/attendance/<int:attendance_id>", methods=["PUT"])
@role_required("ADMIN")
def update_attendance(attendance_id):
    attendance = Attendance.query.get(attendance_id)

    if not attendance:
        return jsonify({
            "status": "error",
            "message": "Attendance record not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    # Validate percentage
    if "percentage" in data:
        if (
            not isinstance(data["percentage"], (int, float))
            or data["percentage"] < 0
            or data["percentage"] > 100
        ):
            return jsonify({
                "status": "error",
                "message": "Attendance percentage must be between 0 and 100"
            }), 400

    # Validate semester
    if "semester" in data:
        if (
            not isinstance(data["semester"], int)
            or data["semester"] < 1
            or data["semester"] > 8
        ):
            return jsonify({
                "status": "error",
                "message": "Semester must be between 1 and 8"
            }), 400

    attendance.subject = data.get("subject", attendance.subject)
    attendance.percentage = data.get(
        "percentage",
        attendance.percentage
    )
    attendance.semester = data.get(
        "semester",
        attendance.semester
    )

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Attendance updated successfully"
    }), 200


# DELETE ATTENDANCE
@attendance_bp.route("/api/attendance/<int:attendance_id>", methods=["DELETE"])
@role_required("ADMIN")
def delete_attendance(attendance_id):
    attendance = Attendance.query.get(attendance_id)

    if not attendance:
        return jsonify({
            "status": "error",
            "message": "Attendance record not found"
        }), 404

    db.session.delete(attendance)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Attendance deleted successfully"
    }), 200