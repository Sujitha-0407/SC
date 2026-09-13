from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from app.config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    # Enable CORS for frontend development
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]}})

    db.init_app(app)
    jwt.init_app(app)
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({
            "status": "error",
            "message": "Authorization token is required"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "status": "error",
            "message": "Invalid authorization token"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "status": "error",
            "message": "Authorization token has expired"
        }), 401

    from app.models import User, Student, Mark, Attendance

    from app.routes.health import health_bp
    app.register_blueprint(health_bp)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app.routes.students import student_bp
    app.register_blueprint(student_bp)

    from app.routes.marks import mark_bp
    app.register_blueprint(mark_bp)

    from app.routes.attendance import attendance_bp
    app.register_blueprint(attendance_bp)

    
    with app.app_context():
        db.create_all()
        # Auto-seed default admin if freshly cloned on another machine
        from werkzeug.security import generate_password_hash
        if not User.query.filter_by(username="admin01").first():
            default_admin = User(
                username="admin01",
                email="admin01@example.com",
                password_hash=generate_password_hash("Admin@123"),
                role="ADMIN"
            )
            db.session.add(default_admin)
            db.session.commit()

    return app