from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.models.mark import Mark
from app.middleware.roles import role_required


mark_bp = Blueprint("marks", __name__)


# CREATE MARK
@mark_bp.route("/api/marks", methods=["POST"])
@role_required("ADMIN")
def create_mark():
    data = request.get_json()

    # Check request body
    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    # Check required fields
    required_fields = [
        "student_id",
        "subject",
        "marks",
        "semester"
    ]

    for field in required_fields:
        if data.get(field) is None or data.get(field) == "":
            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    # Validate marks
    if (
        not isinstance(data["marks"], (int, float))
        or data["marks"] < 0
        or data["marks"] > 100
    ):
        return jsonify({
            "status": "error",
            "message": "Marks must be between 0 and 100"
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

    # Create mark
    mark = Mark(
        student_id=data["student_id"],
        subject=data["subject"],
        marks=data["marks"],
        semester=data["semester"]
    )

    db.session.add(mark)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Mark created successfully",
        "mark": {
            "id": mark.id,
            "student_id": mark.student_id,
            "subject": mark.subject,
            "marks": mark.marks,
            "semester": mark.semester
        }
    }), 201


# GET ALL MARKS
@mark_bp.route("/api/marks", methods=["GET"])
@jwt_required()
def get_marks():
    student_id = request.args.get("student_id", type=int)
    if student_id:
        marks = Mark.query.filter_by(student_id=student_id).all()
    else:
        marks = Mark.query.all()

    result = []

    for mark in marks:
        result.append({
            "id": mark.id,
            "student_id": mark.student_id,
            "student_name": mark.student.name if mark.student else "Unknown",
            "student_roll": mark.student.roll_number if mark.student else "Unknown",
            "subject": mark.subject,
            "marks": mark.marks,
            "semester": mark.semester
        })

    return jsonify({
        "status": "success",
        "marks": result
    }), 200


# GET MARK BY ID
@mark_bp.route("/api/marks/<int:mark_id>", methods=["GET"])
@jwt_required()
def get_mark(mark_id):
    mark = Mark.query.get(mark_id)

    if not mark:
        return jsonify({
            "status": "error",
            "message": "Mark not found"
        }), 404

    return jsonify({
        "status": "success",
        "mark": {
            "id": mark.id,
            "student_id": mark.student_id,
            "student_name": mark.student.name if mark.student else "Unknown",
            "student_roll": mark.student.roll_number if mark.student else "Unknown",
            "subject": mark.subject,
            "marks": mark.marks,
            "semester": mark.semester
        }
    }), 200


# UPDATE MARK
@mark_bp.route("/api/marks/<int:mark_id>", methods=["PUT"])
@role_required("ADMIN")
def update_mark(mark_id):
    mark = Mark.query.get(mark_id)

    if not mark:
        return jsonify({
            "status": "error",
            "message": "Mark not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    # Validate marks if provided
    if "marks" in data:
        if (
            not isinstance(data["marks"], (int, float))
            or data["marks"] < 0
            or data["marks"] > 100
        ):
            return jsonify({
                "status": "error",
                "message": "Marks must be between 0 and 100"
            }), 400

    # Validate semester if provided
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

    # Update fields
    mark.subject = data.get("subject", mark.subject)
    mark.marks = data.get("marks", mark.marks)
    mark.semester = data.get("semester", mark.semester)

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Mark updated successfully"
    }), 200


# DELETE MARK
@mark_bp.route("/api/marks/<int:mark_id>", methods=["DELETE"])
@role_required("ADMIN")
def delete_mark(mark_id):
    mark = Mark.query.get(mark_id)

    if not mark:
        return jsonify({
            "status": "error",
            "message": "Mark not found"
        }), 404

    db.session.delete(mark)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Mark deleted successfully"
    }), 200