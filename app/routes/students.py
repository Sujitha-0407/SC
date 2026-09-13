from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.middleware.roles import role_required

from app import db
from app.models.student import Student

student_bp = Blueprint("students", __name__)
@student_bp.route("/api/students", methods=["POST"])
@role_required("ADMIN")
def create_student():
    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "user_id",
        "roll_number",
        "name",
        "department",
        "year",
        "email"
    ]

    for field in required_fields:
        if data.get(field) is None or data.get(field) == "":
            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    # Validate year
    if not isinstance(data["year"], int) or data["year"] < 1 or data["year"] > 5:
        return jsonify({
            "status": "error",
            "message": "Year must be between 1 and 5"
        }), 400

    # Validate email
    email = data["email"]

    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "status": "error",
            "message": "Invalid email format"
        }), 400

    # Check duplicate roll number
    existing_student = Student.query.filter_by(
        roll_number=data["roll_number"]
    ).first()

    if existing_student:
        return jsonify({
            "status": "error",
            "message": "Roll number already exists"
        }), 409

    # Check user exists
    from app.models.user import User

    user = User.query.get(data["user_id"])

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404

    # Check user already has a student profile
    if user.student:
        return jsonify({
            "status": "error",
            "message": "Student profile already exists for this user"
        }), 409

    student = Student(
        user_id=data["user_id"],
        roll_number=data["roll_number"],
        name=data["name"],
        department=data["department"],
        year=data["year"],
        email=data["email"],
        phone=data.get("phone")
    )

    db.session.add(student)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Student created successfully",
        "student": {
            "id": student.id,
            "user_id": student.user_id,
            "roll_number": student.roll_number,
            "name": student.name,
            "department": student.department,
            "year": student.year,
            "email": student.email,
            "phone": student.phone
        }
    }), 201


# GET ALL STUDENTS
@student_bp.route("/api/students", methods=["GET"])
@jwt_required()
def get_students():
    user_id = request.args.get("user_id", type=int)
    if user_id:
        students = Student.query.filter_by(user_id=user_id).all()
    else:
        students = Student.query.all()

    result = []
    for student in students:
        result.append({
            "id": student.id,
            "user_id": student.user_id,
            "roll_number": student.roll_number,
            "name": student.name,
            "department": student.department,
            "year": student.year,
            "email": student.email,
            "phone": student.phone
        })

    return jsonify({
        "status": "success",
        "students": result
    }), 200


@student_bp.route("/api/students/<int:student_id>", methods=["GET"])
@jwt_required()
def get_student(student_id):
    student = Student.query.get(student_id)

    if not student:
        return jsonify({
            "status": "error",
            "message": "Student not found"
        }), 404

    return jsonify({
        "status": "success",
        "student": {
            "id": student.id,
            "user_id": student.user_id,
            "roll_number": student.roll_number,
            "name": student.name,
            "department": student.department,
            "year": student.year,
            "email": student.email,
            "phone": student.phone
        }
    }), 200


@student_bp.route("/api/students/<int:student_id>", methods=["PUT"])
@role_required("ADMIN")
def update_student(student_id):
    student = Student.query.get(student_id)

    if not student:
        return jsonify({
            "status": "error",
            "message": "Student not found"
        }), 404

    data = request.get_json()
    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    if "year" in data:
        if not isinstance(data["year"], int) or data["year"] < 1 or data["year"] > 5:
            return jsonify({
                "status": "error",
                "message": "Year must be between 1 and 5"
            }), 400

    if "email" in data:
        email = data["email"]
        if "@" not in email or "." not in email.split("@")[-1]:
            return jsonify({
                "status": "error",
                "message": "Invalid email format"
            }), 400

    if "roll_number" in data and data["roll_number"] != student.roll_number:
        existing_student = Student.query.filter_by(
            roll_number=data["roll_number"]
        ).first()
        if existing_student:
            return jsonify({
                "status": "error",
                "message": "Roll number already exists"
            }), 409

    student.roll_number = data.get("roll_number", student.roll_number)
    student.name = data.get("name", student.name)
    student.department = data.get("department", student.department)
    student.year = data.get("year", student.year)
    student.email = data.get("email", student.email)
    student.phone = data.get("phone", student.phone)

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Student updated successfully",
        "student": {
            "id": student.id,
            "user_id": student.user_id,
            "roll_number": student.roll_number,
            "name": student.name,
            "department": student.department,
            "year": student.year,
            "email": student.email,
            "phone": student.phone
        }
    }), 200
@student_bp.route("/api/students/<int:student_id>", methods=["DELETE"])
@role_required("ADMIN")
def delete_student(student_id):
    student = Student.query.get(student_id)

    if not student:
        return jsonify({
            "status": "error",
            "message": "Student not found"
        }), 404

    db.session.delete(student)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Student deleted successfully"
    }), 200