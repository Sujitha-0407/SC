import pytest
import uuid
from app import create_app, db
from app.models.user import User
from app.models.student import Student
from app.models.mark import Mark
from app.models.attendance import Attendance

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"

def test_login_admin(client):
    res = client.post("/api/auth/login", json={
        "username": "admin01",
        "password": "Admin@123"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"

def test_login_student(client):
    res = client.post("/api/auth/login", json={
        "username": "student01",
        "password": "Student@123"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    assert "access_token" in data
    assert data["user"]["role"] == "STUDENT"

def test_rbac_protection(client):
    res = client.post("/api/auth/login", json={
        "username": "student01",
        "password": "Student@123"
    })
    token = res.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Student cannot call admin test
    res_admin = client.get("/api/auth/admin-test", headers=headers)
    assert res_admin.status_code == 403
    assert res_admin.get_json()["message"] == "Access denied"

    # Student cannot create marks
    res_mark = client.post("/api/marks", headers=headers, json={
        "student_id": 1,
        "subject": "Math",
        "marks": 90,
        "semester": 2
    })
    assert res_mark.status_code == 403

def test_jwt_unauthorized(client):
    res = client.get("/api/students")
    assert res.status_code == 401
    assert "token is required" in res.get_json()["message"].lower()

def test_profile_me(client):
    res = client.post("/api/auth/login", json={
        "username": "student01",
        "password": "Student@123"
    })
    token = res.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    user = res_me.get_json()["user"]
    assert user["username"] == "student01"
    assert user["role"] == "STUDENT"
    assert "password" not in user
    assert "password_hash" not in user

def test_register_and_validation(client):
    # Invalid email
    res_bad_email = client.post("/api/auth/register", json={
        "username": "testuser_valid",
        "email": "invalid_email_at_nowhere",
        "password": "Password@123"
    })
    assert res_bad_email.status_code == 400

    # Short password
    res_short = client.post("/api/auth/register", json={
        "username": "testuser_valid",
        "email": "valid@example.com",
        "password": "short"
    })
    assert res_short.status_code == 400

    # Register new student user
    uid = str(uuid.uuid4())[:6]
    username = f"std_{uid}"
    email = f"std_{uid}@example.com"
    res_reg = client.post("/api/auth/register", json={
        "username": username,
        "email": email,
        "password": "Student@123"
    })
    assert res_reg.status_code == 201
    assert res_reg.get_json()["user"]["role"] == "STUDENT"

    # Duplicate rejection
    res_dup = client.post("/api/auth/register", json={
        "username": username,
        "email": email,
        "password": "Student@123"
    })
    assert res_dup.status_code == 409

def test_student_and_academic_crud(client):
    # Admin login
    res = client.post("/api/auth/login", json={
        "username": "admin01",
        "password": "Admin@123"
    })
    admin_token = res.get_json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Register a new user for student assignment
    uid = str(uuid.uuid4())[:6]
    username = f"user_{uid}"
    email = f"user_{uid}@example.com"
    res_reg = client.post("/api/auth/register", json={
        "username": username,
        "email": email,
        "password": "Student@123"
    })
    user_id = res_reg.get_json()["user"]["id"]

    # 1. Create Student
    roll = f"ROLL_{uid}"
    res_create = client.post("/api/students", headers=admin_headers, json={
        "user_id": user_id,
        "roll_number": roll,
        "name": "Integration Test Student",
        "department": "Computer Engineering",
        "year": 3,
        "email": email,
        "phone": "9998887776"
    })
    assert res_create.status_code == 201
    student_id = res_create.get_json()["student"]["id"]

    # 2. List Students
    res_list = client.get("/api/students", headers=admin_headers)
    assert res_list.status_code == 200
    assert any(s["id"] == student_id for s in res_list.get_json()["students"])

    # 3. Update Student
    res_up = client.put(f"/api/students/{student_id}", headers=admin_headers, json={
        "name": "Updated Test Student",
        "year": 4
    })
    assert res_up.status_code == 200

    # 4. Create Mark
    res_mark = client.post("/api/marks", headers=admin_headers, json={
        "student_id": student_id,
        "subject": "Cyber Security",
        "marks": 94.5,
        "semester": 6
    })
    assert res_mark.status_code == 201
    mark_id = res_mark.get_json()["mark"]["id"]

    # 5. List Marks with student_id filter
    res_marks_list = client.get(f"/api/marks?student_id={student_id}", headers=admin_headers)
    assert res_marks_list.status_code == 200
    assert len(res_marks_list.get_json()["marks"]) >= 1

    # 6. Update Mark
    res_mark_up = client.put(f"/api/marks/{mark_id}", headers=admin_headers, json={
        "marks": 98.0
    })
    assert res_mark_up.status_code == 200

    # 7. Create Attendance
    res_att = client.post("/api/attendance", headers=admin_headers, json={
        "student_id": student_id,
        "subject": "Cyber Security",
        "percentage": 92.0,
        "semester": 6
    })
    assert res_att.status_code == 201
    att_id = res_att.get_json()["attendance"]["id"]

    # 8. List Attendance with student_id filter
    res_att_list = client.get(f"/api/attendance?student_id={student_id}", headers=admin_headers)
    assert res_att_list.status_code == 200
    assert len(res_att_list.get_json()["attendance"]) >= 1

    # 9. Update Attendance
    res_att_up = client.put(f"/api/attendance/{att_id}", headers=admin_headers, json={
        "percentage": 96.0
    })
    assert res_att_up.status_code == 200

    # 10. Delete Attendance & Mark
    assert client.delete(f"/api/attendance/{att_id}", headers=admin_headers).status_code == 200
    assert client.delete(f"/api/marks/{mark_id}", headers=admin_headers).status_code == 200

    # 11. Delete Student
    assert client.delete(f"/api/students/{student_id}", headers=admin_headers).status_code == 200
