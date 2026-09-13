# Secure Student Management System
## REST API Documentation

Base URL:
```
http://127.0.0.1:5000
```

---

## Authentication

The API uses JWT Bearer Token authentication.

After successful login, the server returns an access token.

Protected requests must include:
```
Authorization: Bearer <access_token>
```

JWT token expiry: 1 hour

---

# 1. Authentication APIs

## Register User
Creates a new user account. All public registrations are assigned the `STUDENT` role by default.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Auth Required:** No

### Request Body
```json
{
    "username": "student02",
    "email": "student02@example.com",
    "password": "Student@123"
}
```

### Validation
- `username`: Required, 3 to 50 characters, unique
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters

### Success Response (201 Created)
```json
{
    "status": "success",
    "message": "User registered successfully",
    "user": {
        "id": 4,
        "username": "student02",
        "email": "student02@example.com",
        "role": "STUDENT"
    }
}
```

### Error Responses
- **400 Bad Request:** Missing fields, invalid format, password too short
- **409 Conflict:** Username or email already exists

---

## Login User
Authenticates a user and returns a signed JWT access token.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Auth Required:** No

### Request Body
```json
{
    "username": "student02",
    "password": "Student@123"
}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Login successful",
    "access_token": "<jwt_token>",
    "user": {
        "id": 4,
        "username": "student02",
        "email": "student02@example.com",
        "role": "STUDENT"
    }
}
```

### Error Responses
- **400 Bad Request:** Missing username or password
- **401 Unauthorized:** Invalid username or password

---

## Get Current User Profile
Retrieves details of the currently authenticated user.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** Any (`ADMIN` or `STUDENT`)

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Token is valid",
    "user": {
        "id": 1,
        "username": "student01",
        "email": "student01@example.com",
        "role": "STUDENT",
        "created_at": "2026-08-20T21:40:00",
        "student_id": 1
    }
}
```

---

## Update Current User Profile
Updates the profile information of the currently authenticated user (e.g., email address). Does not allow altering security credentials or roles.

- **URL:** `/api/auth/me`
- **Method:** `PUT`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** Any (`ADMIN` or `STUDENT`)

### Request Body
```json
{
    "email": "updated_student@example.com"
}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Profile updated successfully",
    "user": {
        "id": 1,
        "username": "student01",
        "email": "updated_student@example.com",
        "role": "STUDENT",
        "student_id": 1
    }
}
```

---

## Get All Users (Admin Only)
Lists registered user accounts and their student profile linkage status. Used by administrators when creating student records.

- **URL:** `/api/users`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Success Response (200 OK)
```json
{
    "status": "success",
    "users": [
        {
            "id": 1,
            "username": "student01",
            "email": "student01@example.com",
            "role": "STUDENT",
            "has_student_profile": true
        },
        {
            "id": 2,
            "username": "admin01",
            "email": "admin01@example.com",
            "role": "ADMIN",
            "has_student_profile": false
        }
    ]
}
```

---

## Admin Test
Test endpoint to verify ADMIN authorization privileges.

- **URL:** `/api/auth/admin-test`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "You have ADMIN access"
}
```

### Error Response (403 Forbidden)
```json
{
    "status": "error",
    "message": "Access denied"
}
```

---

# 2. Student APIs

## Create Student
Creates a student profile linked to a registered user.

- **URL:** `/api/students`
- **Method:** `POST`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Request Body
```json
{
    "user_id": 1,
    "roll_number": "CS001",
    "name": "Alex Johnson",
    "department": "Computer Science",
    "year": 2,
    "email": "alex.johnson@example.com",
    "phone": "9876543210"
}
```

### Validation
- `user_id`: Must exist in `users` table and not already have a student profile
- `roll_number`: Unique string
- `year`: Integer between 1 and 5
- `email`: Valid email format

### Success Response (201 Created)
```json
{
    "status": "success",
    "message": "Student created successfully",
    "student": {
        "id": 1,
        "user_id": 1,
        "roll_number": "CS001",
        "name": "Alex Johnson",
        "department": "Computer Science",
        "year": 2,
        "email": "alex.johnson@example.com",
        "phone": "9876543210"
    }
}
```

---

## List All Students
Retrieves a list of all student records. Optionally filter by `user_id`.

- **URL:** `/api/students` or `/api/students?user_id=<user_id>`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** Any (`ADMIN` or `STUDENT`)

### Success Response (200 OK)
```json
{
    "status": "success",
    "students": [
        {
            "id": 1,
            "user_id": 1,
            "roll_number": "CS001",
            "name": "Alex Johnson",
            "department": "Computer Science",
            "year": 2,
            "email": "alex.johnson@example.com",
            "phone": "9876543210"
        }
    ]
}
```

---

## Get Student by ID
Retrieves details of a specific student.

- **URL:** `/api/students/<student_id>`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** Any (`ADMIN` or `STUDENT`)

### Success Response (200 OK)
```json
{
    "status": "success",
    "student": {
        "id": 1,
        "user_id": 1,
        "roll_number": "CS001",
        "name": "Alex Johnson",
        "department": "Computer Science",
        "year": 2,
        "email": "alex.johnson@example.com",
        "phone": "9876543210"
    }
}
```

---

## Update Student
Updates an existing student's record.

- **URL:** `/api/students/<student_id>`
- **Method:** `PUT`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Request Body
```json
{
    "name": "Alex M. Johnson",
    "department": "Computer Science & Engineering",
    "year": 3,
    "email": "alex.johnson@example.com",
    "phone": "9876543210"
}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Student updated successfully",
    "student": {
        "id": 1,
        "user_id": 1,
        "roll_number": "CS001",
        "name": "Alex M. Johnson",
        "department": "Computer Science & Engineering",
        "year": 3,
        "email": "alex.johnson@example.com",
        "phone": "9876543210"
    }
}
```

---

## Delete Student
Deletes a student record and cascades to their marks and attendance records.

- **URL:** `/api/students/<student_id>`
- **Method:** `DELETE`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Student deleted successfully"
}
```

---

# 3. Marks APIs

## Create Mark
Records a mark entry for a student.

- **URL:** `/api/marks`
- **Method:** `POST`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Request Body
```json
{
    "student_id": 1,
    "subject": "Operating Systems",
    "marks": 88.5,
    "semester": 4
}
```

### Validation
- `student_id`: Student must exist
- `marks`: Float or integer between 0 and 100
- `semester`: Integer between 1 and 8

### Success Response (201 Created)
```json
{
    "status": "success",
    "message": "Mark created successfully",
    "mark": {
        "id": 3,
        "student_id": 1,
        "subject": "Operating Systems",
        "marks": 88.5,
        "semester": 4
    }
}
```

---

## List Marks
Retrieves marks records. Can be filtered by `student_id`.

- **URL:** `/api/marks` or `/api/marks?student_id=<student_id>`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** Any (`ADMIN` or `STUDENT`)

### Success Response (200 OK)
```json
{
    "status": "success",
    "marks": [
        {
            "id": 3,
            "student_id": 1,
            "student_name": "Alex Johnson",
            "student_roll": "CS001",
            "subject": "Operating Systems",
            "marks": 88.5,
            "semester": 4
        }
    ]
}
```

---

## Get Mark by ID
Retrieves details of a single mark record.

- **URL:** `/api/marks/<mark_id>`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** Any (`ADMIN` or `STUDENT`)

### Success Response (200 OK)
```json
{
    "status": "success",
    "mark": {
        "id": 3,
        "student_id": 1,
        "student_name": "Alex Johnson",
        "student_roll": "CS001",
        "subject": "Operating Systems",
        "marks": 88.5,
        "semester": 4
    }
}
```

---

## Update Mark
Updates an existing mark record.

- **URL:** `/api/marks/<mark_id>`
- **Method:** `PUT`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Request Body
```json
{
    "marks": 92.0,
    "semester": 4
}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Mark updated successfully"
}
```

---

## Delete Mark
Deletes a mark record.

- **URL:** `/api/marks/<mark_id>`
- **Method:** `DELETE`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Mark deleted successfully"
}
```

---

# 4. Attendance APIs

## Create Attendance
Records attendance for a student in a subject.

- **URL:** `/api/attendance`
- **Method:** `POST`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Request Body
```json
{
    "student_id": 1,
    "subject": "Operating Systems",
    "percentage": 94.0,
    "semester": 4
}
```

### Validation
- `student_id`: Student must exist
- `percentage`: Float or integer between 0 and 100
- `semester`: Integer between 1 and 8

### Success Response (201 Created)
```json
{
    "status": "success",
    "message": "Attendance created successfully",
    "attendance": {
        "id": 1,
        "student_id": 1,
        "subject": "Operating Systems",
        "percentage": 94.0,
        "semester": 4
    }
}
```

---

## List Attendance
Retrieves attendance records. Can be filtered by `student_id`.

- **URL:** `/api/attendance` or `/api/attendance?student_id=<student_id>`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** Any (`ADMIN` or `STUDENT`)

### Success Response (200 OK)
```json
{
    "status": "success",
    "attendance": [
        {
            "id": 1,
            "student_id": 1,
            "student_name": "Alex Johnson",
            "student_roll": "CS001",
            "subject": "Operating Systems",
            "percentage": 94.0,
            "semester": 4
        }
    ]
}
```

---

## Get Attendance by ID
Retrieves details of a single attendance record.

- **URL:** `/api/attendance/<attendance_id>`
- **Method:** `GET`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** Any (`ADMIN` or `STUDENT`)

### Success Response (200 OK)
```json
{
    "status": "success",
    "attendance": {
        "id": 1,
        "student_id": 1,
        "student_name": "Alex Johnson",
        "student_roll": "CS001",
        "subject": "Operating Systems",
        "percentage": 94.0,
        "semester": 4
    }
}
```

---

## Update Attendance
Updates an existing attendance record.

- **URL:** `/api/attendance/<attendance_id>`
- **Method:** `PUT`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Request Body
```json
{
    "percentage": 96.5,
    "semester": 4
}
```

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Attendance updated successfully"
}
```

---

## Delete Attendance
Deletes an attendance record.

- **URL:** `/api/attendance/<attendance_id>`
- **Method:** `DELETE`
- **Auth Required:** Yes (Bearer Token)
- **Role Required:** `ADMIN`

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Attendance deleted successfully"
}
```

---

# 5. System & Health APIs

## Health Check
Endpoint to verify the backend server is running.

- **URL:** `/api/health`
- **Method:** `GET`
- **Auth Required:** No

### Success Response (200 OK)
```json
{
    "status": "success",
    "message": "Secure Student Management API is running"
}
```

---

# 6. Standardized Error Formats

All error responses strictly follow this standardized format:
```json
{
    "status": "error",
    "message": "<Description of the error>"
}
```

### HTTP Status Codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Missing request body, missing fields, or invalid ranges (e.g. marks > 100, semester > 8).
- `401 Unauthorized`: Missing, invalid, or expired JWT Bearer token.
- `403 Forbidden`: Authenticated user does not possess the required role (e.g. STUDENT attempting ADMIN operation).
- `404 Not Found`: Target resource was not found.
- `409 Conflict`: Unique constraint violation (e.g. duplicate username, email, roll number, or existing student profile).
