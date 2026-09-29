from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_and_health():
    res1 = client.get("/")
    assert res1.status_code == 200
    assert res1.json()["status"] == "online"

    res2 = client.get("/health")
    assert res2.status_code == 200
    assert res2.json()["status"] == "healthy"


def test_auth_workflow():
    register_payload = {
        "email": "rgpv_student_test@example.com",
        "password": "securepassword123",
        "full_name": "RGPV Aspirant",
        "branch": "Computer Science & Engineering",
        "semester": 4,
        "daily_study_hours": 3.0,
        "target_score": 85,
        "preferred_language": "hinglish"
    }

    # Register
    reg_res = client.post("/api/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    token = data["access_token"]

    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "rgpv_student_test@example.com",
        "password": "securepassword123"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Me (Profile)
    headers = {"Authorization": f"Bearer {token}"}
    profile_res = client.get("/api/v1/auth/me", headers=headers)
    assert profile_res.status_code == 200
    p_data = profile_res.json()
    assert p_data["email"] == "rgpv_student_test@example.com"
    assert p_data["target_score"] == 85


def test_documents_syllabus_and_plan_workflow():
    # Login to get token
    login_res = client.post("/api/v1/auth/login", json={
        "email": "rgpv_student_test@example.com",
        "password": "securepassword123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Syllabus
    syl_res = client.get("/api/v1/documents/syllabus/dbms_cs403", headers=headers)
    assert syl_res.status_code == 200
    syl_data = syl_res.json()
    assert len(syl_data["units"]) == 5

    # Generate Study Plan
    exam_d = (date.today() + timedelta(days=12)).isoformat()
    plan_payload = {
        "subject_id": "dbms_cs403",
        "exam_date": exam_d,
        "daily_hours": 2.5,
        "target_score": 80
    }
    plan_res = client.post("/api/v1/plans/generate", json=plan_payload, headers=headers)
    assert plan_res.status_code == 200
    plan_data = plan_res.json()
    assert plan_data["status"] == "success"
    plan_id = plan_data["plan_id"]

    # Approve Plan
    appr_res = client.post(f"/api/v1/plans/{plan_id}/approve", headers=headers)
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "approved"


def test_quiz_and_progress_workflow():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "rgpv_student_test@example.com",
        "password": "securepassword123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch teaching material + quiz
    quiz_res = client.get("/api/v1/quizzes/topic/dbms_u3_t2", headers=headers)
    assert quiz_res.status_code == 200
    q_data = quiz_res.json()
    assert "explanation" in q_data
    assert "quiz" in q_data
    quiz_id = q_data["quiz"]["quiz_id"]
    first_q_id = q_data["quiz"]["questions"][0]["question_id"]

    # Submit answers
    sub_payload = {
        "topic_id": "dbms_u3_t2",
        "answers": [
            {
                "question_id": first_q_id,
                "answer_text": "2NF removes partial dependency. 3NF removes transitive dependency."
            }
        ]
    }
    sub_res = client.post(f"/api/v1/quizzes/{quiz_id}/submit", json=sub_payload, headers=headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["status"] == "evaluated"
    assert "evaluation" in sub_data
    assert "verification" in sub_data
    assert "mastery_update" in sub_data

    # Dashboard
    dash_res = client.get("/api/v1/progress/dashboard?subject_id=dbms_cs403", headers=headers)
    assert dash_res.status_code == 200
    d_data = dash_res.json()
    assert d_data["subject_code"] == "CS-403"
    assert "unit_breakdown" in d_data
    assert len(d_data["unit_breakdown"]) == 5
