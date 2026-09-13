from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt

from app import db
from app.models.user import User
from app.middleware.roles import role_required


auth_bp = Blueprint("auth", __name__)


# REGISTER
@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    # Check request body
    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Check required fields
    if not username or not email or not password:
        return jsonify({
            "status": "error",
            "message": "Username, email and password are required"
        }), 400

    # Validate username length
    if len(username) < 3 or len(username) > 50:
        return jsonify({
            "status": "error",
            "message": "Username must be between 3 and 50 characters"
        }), 400

    # Validate email
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "status": "error",
            "message": "Invalid email format"
        }), 400

    # Validate password length
    if len(password) < 8:
        return jsonify({
            "status": "error",
            "message": "Password must be at least 8 characters long"
        }), 400

    # Check duplicate username or email
    existing_user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()

    if existing_user:
        return jsonify({
            "status": "error",
            "message": "Username or email already exists"
        }), 409

    # Hash password
    password_hash = generate_password_hash(password)

    # Always create normal users as STUDENT
    user = User(
        username=username,
        email=email,
        password_hash=password_hash,
        role="STUDENT"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 201


# LOGIN
@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    # Check request body
    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    username = data.get("username")
    password = data.get("password")

    # Check required fields
    if not username or not password:
        return jsonify({
            "status": "error",
            "message": "Username and password are required"
        }), 400

    # Find user
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({
            "status": "error",
            "message": "Invalid username or password"
        }), 401

    # Verify password
    if not check_password_hash(user.password_hash, password):
        return jsonify({
            "status": "error",
            "message": "Invalid username or password"
        }), 401

    # Create JWT token
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "username": user.username
        }
    )

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 200


# GET CURRENT USER
@auth_bp.route("/api/auth/me", methods=["GET"])
@jwt_required()
def me():
    claims = get_jwt()
    user_id = int(claims["sub"])
    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404

    return jsonify({
        "status": "success",
        "message": "Token is valid",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "student_id": user.student.id if user.student else None
        }
    }), 200


# UPDATE CURRENT USER PROFILE
@auth_bp.route("/api/auth/me", methods=["PUT"])
@jwt_required()
def update_me():
    claims = get_jwt()
    user_id = int(claims["sub"])
    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404

    data = request.get_json()
    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    # Only allowed profile updates (email)
    if "email" in data:
        email = data["email"]
        if "@" not in email or "." not in email.split("@")[-1]:
            return jsonify({
                "status": "error",
                "message": "Invalid email format"
            }), 400

        existing = User.query.filter(
            User.email == email,
            User.id != user.id
        ).first()

        if existing:
            return jsonify({
                "status": "error",
                "message": "Email already exists"
            }), 409

        user.email = email

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "student_id": user.student.id if user.student else None
        }
    }), 200


# GET ALL USERS (ADMIN ONLY - for student profile assignment)
@auth_bp.route("/api/users", methods=["GET"])
@role_required("ADMIN")
def get_users():
    users = User.query.all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "has_student_profile": u.student is not None
        })

    return jsonify({
        "status": "success",
        "users": result
    }), 200


# ADMIN TEST
@auth_bp.route("/api/auth/admin-test", methods=["GET"])
@role_required("ADMIN")
def admin_test():
    return jsonify({
        "status": "success",
        "message": "You have ADMIN access"
    }), 200