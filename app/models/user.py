from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="STUDENT")
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    student = db.relationship(
        "Student",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )