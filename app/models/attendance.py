from app import db


class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=False
    )

    subject = db.Column(db.String(100), nullable=False)
    percentage = db.Column(db.Float, nullable=False)
    semester = db.Column(db.Integer, nullable=False)

    student = db.relationship(
        "Student",
        back_populates="attendance"
    )