import uuid
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "title" in response.json()

def test_login_demo_student():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "student@ayush.gov.in", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"

def test_login_demo_recruiter():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "recruiter@ayushhealthtech.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "recruiter"

def test_register_student_success_and_login_case_insensitive():
    unique_id = uuid.uuid4().hex[:6]
    test_email = f"Student_{unique_id}@Example.Com"
    clean_email = test_email.lower()
    payload = {
        "email": test_email,
        "password": "Password123!",
        "full_name": "Test Student",
        "role": "student",
        "college_or_company": "Test AI Institute"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == clean_email
    assert data["user"]["role"] == "student"

    # Test login with uppercase email
    login_resp = client.post("/api/v1/auth/login", json={"email": test_email.upper(), "password": "Password123!"})
    assert login_resp.status_code == 200
    assert login_resp.json()["user"]["email"] == clean_email

    # Test duplicate registration with same email
    dup_resp = client.post("/api/v1/auth/register", json=payload)
    assert dup_resp.status_code == 400
    assert dup_resp.json()["detail"] == "Email is already registered"

def test_register_weak_password_fails():
    unique_id = uuid.uuid4().hex[:6]
    payload = {
        "email": f"weakuser_{unique_id}@example.com",
        "password": "weak",
        "full_name": "Weak Password User",
        "role": "student"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Password must be at least 8 characters" in response.json()["detail"]

def test_register_recruiter_without_company_fails():
    unique_id = uuid.uuid4().hex[:6]
    payload = {
        "email": f"recruiter_nocompany_{unique_id}@example.com",
        "password": "Password123!",
        "full_name": "Jane Recruiter",
        "role": "recruiter",
        "college_or_company": "   "
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Company/Organization name is required" in response.json()["detail"]

def test_register_recruiter_success():
    unique_id = uuid.uuid4().hex[:6]
    payload = {
        "email": f"recruiter_{unique_id}@example.com",
        "password": "Password123!",
        "full_name": "Jane Recruiter",
        "role": "recruiter",
        "college_or_company": "HealthTech Corp"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "recruiter"

def test_register_invalid_role_fails():
    unique_id = uuid.uuid4().hex[:6]
    payload = {
        "email": f"badrole_{unique_id}@example.com",
        "password": "Password123!",
        "full_name": "Unknown Role User",
        "role": "superadmin"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "Invalid role" in response.json()["detail"]
