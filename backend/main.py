
import os
import hmac
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI

app = FastAPI(
    title="AI Logistics Command Center",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kamilla998.github.io",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Admin-Token"]
)

AGENTS = [
    {"name": "Chief of Staff", "role": "Coordinates all AI agents."},
    {"name": "GTM Engineer", "role": "Product growth and launch strategy."},
    {"name": "SEO/AEO Agent", "role": "SEO and content visibility."},
    {"name": "Web Developer", "role": "Platform development and bug fixing."},
    {"name": "Social Media Agent", "role": "Social media content and engagement."},
    {"name": "Ad Manager", "role": "Advertising campaigns and performance."},
    {"name": "Sales Agent", "role": "Lead generation and sales."},
    {"name": "Customer Support", "role": "Customer support and inquiry triage."}
]


class TaskRequest(BaseModel):
    task: str = Field(min_length=3, max_length=5000)


@app.get("/")
def home():
    return {
        "status": "online",
        "service": "AI Logistics Command Center",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/agents")
def get_agents():
    return {
        "total_agents": len(AGENTS),
        "agents": AGENTS
    }


@app.post("/api/chief-of-staff")
def chief_of_staff(
    request: TaskRequest,
    x_admin_token: str | None = Header(default=None)
):
    expected_token = os.getenv("ADMIN_TOKEN")

    if not expected_token:
        raise HTTPException(
            status_code=503,
            detail="Admin token is not configured."
        )

    if not x_admin_token or not hmac.compare_digest(
        x_admin_token, expected_token
    ):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized."
        )

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key is not configured."
        )

    try:
        client = OpenAI(api_key=api_key)

        instructions = """
You are Chief of Staff of an AI-powered US logistics company.

You coordinate these seven specialist agents:
1. GTM Engineer
2. SEO/AEO Agent
3. Web Developer
4. Social Media Agent
5. Ad Manager
6. Sales Agent
7. Customer Support

Analyze the user's task and provide:
1. Your understanding of the task.
2. Which specialist agents should handle it.
3. A numbered action plan.
4. Expected deliverables.
5. Missing information or risks.

Do not claim that work has already been completed.
Do not claim to have contacted customers, changed systems,
published content, or spent money.
You are planning and coordinating work only.
Be professional, concise and practical.
"""

        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-6"),
            instructions=instructions,
            input=request.task
        )

        return {
            "agent": "Chief of Staff",
            "status": "completed",
            "task": request.task,
            "plan": response.output_text,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as error:
        print(f"Chief of Staff error: {error}")
        raise HTTPException(
            status_code=500,
            detail="The AI task could not be processed."
        )
