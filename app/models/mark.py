from app import db


class Mark(db.Model):
    __tablename__ = "marks"

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=False
    )

    subject = db.Column(db.String(100), nullable=False)
    marks = db.Column(db.Float, nullable=False)
    semester = db.Column(db.Integer, nullable=False)

    student = db.relationship(
        "Student",
        back_populates="marks"
    )