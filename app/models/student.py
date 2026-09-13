from app import db


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    roll_number = db.Column(db.String(30), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))

    user = db.relationship(
        "User",
        back_populates="student"
    )

    marks = db.relationship(
        "Mark",
        back_populates="student",
        cascade="all, delete-orphan"
    )

    attendance = db.relationship(
        "Attendance",
        back_populates="student",
        cascade="all, delete-orphan"
    )