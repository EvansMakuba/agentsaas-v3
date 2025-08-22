

# AgentSaaS v3: The AI-Powered, Human-Executed Engagement Platform

**Project Status:** `In Development - Foundational infrastructure complete.`

This repository contains the complete codebase for AgentSaaS v3, a multi-tenant, two-sided marketplace connecting **Brands** with a swarm of AI agents whose actions are published and managed by a distributed network of **Human-in-the-Loop (HIL) Executors**.

## Core Architecture

The application is a decoupled, microservice-oriented system managed by Docker Compose. It is designed for scalability and maintainability, separating the user-facing API from the asynchronous AI task processing.

- **Frontend:** A Next.js 15 application located in the `/frontend` directory. It provides role-based dashboards for Brands and Executors.
- **Backend API:** A Python Flask server (`app.py`) that handles all authenticated API requests, user management, and payment initiation.
- **Authentication:** Handled by [Clerk](https://clerk.com/). User identity is verified on the backend via standard JWT validation (`auth.py`).
- **Database:** Google Cloud Firestore is used as the primary database for storing user, campaign, and task data.
- **Background Processing (The AI Swarm):** An asynchronous task processing system built with Celery and Redis.
  - **Redis:** Acts as the message broker and result backend.
  - **Celery Beat (`celery_beat.py`):** The "Orchestrator." A scheduled process that periodically scans for active campaigns and triggers task generation.
  - **Celery Worker (`tasks.py`):** The "Engine." These are the processes that will execute the CrewAI agents to find opportunities and generate content.

## Local Development Environment Setup

Follow these steps to get the entire platform running locally.

### Prerequisites

- **Python 3.11+** and **`uv`**
- **Node.js 20+** and **`npm`**
- **Docker** and **Docker Compose**
- A **Google Cloud Platform** project with Firestore enabled.
- A **Clerk** application for authentication.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agentsaas-v3.git
cd hustle4
```

### 2. Configure Backend Environment

1.  **Create Virtual Environment:**
    ```bash
    uv venv
    source .venv/bin/activate
    ```

2.  **Install Python Dependencies:**
    ```bash
    uv pip install -r requirements.txt
    ```

3.  **Set Up Backend Secrets (`.env`):**
    Create a `.env` file in the project root (`hustle4/`). Use the `.env.example` file (we should create this) as a template and fill in the following values:
    - `APP_MODE="development"`
    - Clerk JWT verification keys (`CLERK_JWKS_URL`, `CLERK_ISSUER`, `CLERK_SECRET_KEY`)
    - IntaSend API keys (can be placeholders for now)
    - Application URLs (`FRONTEND_URL`)

4.  **Add GCP Credentials:**
    Place your downloaded Google Cloud service account key in the project root and name it `google-application-credentials.json`.

### 3. Configure Frontend Environment

1.  **Navigate to Frontend:**
    ```bash
    cd frontend
    ```

2.  **Install Node.js Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Frontend Secrets (`.env.local`):**
    Create a `.env.local` file in the `/frontend` directory. Use the `frontend/.env.local.example` file (we should create this) as a template and fill in the following values:
    - Clerk frontend keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
    - Clerk UI routing URLs
    - API base URL (`NEXT_PUBLIC_API_BASE_URL`)

4.  **Return to Root:**
    ```bash
    cd ..
    ```

### 4. Running the Application

The entire application is managed by Docker Compose.

1.  **Ensure Docker Desktop is running.**
2.  From the project root (`hustle4/`), run:
    ```bash
    docker-compose up --build
    ```
    This will build the Python environment, start the Redis, API, Beat, and Worker containers.

3.  **In a separate terminal, run the frontend:**
    ```bash
    cd frontend
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Current State & Next Steps

The project has successfully implemented the foundational user onboarding and campaign creation loop.

**Completed Features:**
- User sign-up/sign-in via Clerk.
- Post-signup role selection for "Brand" or "Executor".
- Role-based redirection to placeholder dashboards.
- A functional Brand Dashboard for creating and funding campaigns (using a mocked payment flow).
- A fully operational backend engine (API, Celery, Redis) that correctly identifies active campaigns.

**Next Immediate Steps:**
1.  Implement the AI Content Generation Crew using CrewAI.
2.  Replace the placeholder logic in `tasks.py` to call this crew.
3.  Populate the `available_tasks` collection in Firestore.
4.  Build out the Executor Dashboard to display and handle these tasks.
```
