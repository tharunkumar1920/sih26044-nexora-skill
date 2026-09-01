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
