

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



### **The AgentSaaS v3 Business Model: From Service to Platform**

Our current model is essentially a managed service with a 30% take rate. It's profitable, but it's not a high-growth, venture-scale business yet. To get there, we need to build a self-service platform with clear, tiered pricing that delivers exponential value.

#### **1. The Core Value Proposition (Our "Elevator Pitch")**

*   **For Brands:** "We provide an AI-powered platform that builds and deploys authentic, trusted digital personas to engage with niche online communities, turning passive audiences into active brand advocates."
*   **For Executors:** "We provide a gamified platform that allows you to monetize your authentic online presence by executing high-quality engagement tasks for top brands, with zero creative work required."

#### **2. The Product: Tiered SaaS Plans for Brands**

We will move away from a simple "$100/week" model to a tiered subscription model. This is the standard for SaaS and is what investors expect to see.

| Feature / Tier | **Starter** | **Growth (Most Popular)** | **Scale (Enterprise)** |
| :--- | :--- | :--- | :--- |
| **Price/Month** | $400/mo | $1,000/mo | $2,500+/mo |
| **Target Audience** | Small businesses, startups | Growing businesses, marketing agencies | Large brands, enterprise teams |
| **Included Tasks** | ~120 Comment Threads | ~300 Comment Threads | Custom |
| | ~25 Post Threads | ~75 Post Threads | |
| **Executor Tier Access** | Tier 1 & 2 | Tier 1, 2, & 3 | **Guaranteed Tier 3** |
| **Approval Workflow** | ✅ | ✅ | ✅ |
| **Campaign Knowledge Base** | ✅ (Basic) | ✅ (Advanced) | ✅ (With Onboarding) |
| **Activity Log** | ✅ | ✅ | ✅ |
| **Performance Analytics** | Basic | **Advanced** (Sentiment, Mentions) | **Custom Reporting** |
| **Strategic Review** | ❌ | ✅ (Automated) | ✅ (Human + AI) |
| **Dedicated Support** | ❌ | ❌ | ✅ |

**Why this works:**
*   **Clear Upsell Path:** It provides a clear reason for a brand on the "Starter" plan to upgrade to "Growth" to access higher-tier executors and better analytics.
*   **Scalable Pricing:** It anchors our value in the volume of engagement we can provide.
*   **Sticky Features:** The advanced analytics and strategic review become indispensable, creating a high switching cost for our clients.

#### **3. The "Defensible Moat": Our Data & Executor Network**

An investor will always ask, "What stops someone else from building this?" Our answer is not just our code; it's our data ecosystem.

1.  **The Executor Network:** This is our most valuable asset. A curated, vetted, and tiered network of authentic human accounts is incredibly difficult and time-consuming to replicate. We are not just a software company; we are a **talent network**.
2.  **The "Genesis Mind" (Platform Mindscape):** Our daily learning loop is a powerful data moat. With every campaign we run, our platform gets smarter. It learns the unique cultural nuances, peak activity times, and trending topics for hundreds of subreddits. A new competitor would be starting from zero, while our platform's intelligence would be compounding daily.
3.  **The Performance Data:** We will have the world's best dataset on what kind of content performs well in specific niche communities for specific brand objectives. This data is invaluable for training our models and providing strategic insights that no one else can.

#### **4. The Go-to-Market Strategy (How we get our first 100 Brands)**

1.  **Phase 1: The "Concierge" Beta (Months 1-3)**
    *   We don't launch the self-service SaaS platform yet. It's too early.
    *   We manually onboard our first **5-10 beta clients**. We find them through direct outreach on platforms like LinkedIn, targeting marketing managers at direct-to-consumer (DTC) brands in specific verticals (e.g., craft beverages, tech gadgets, sustainable products).
    *   We act as their "concierge." We help them write their objectives, we manually monitor the results, and we have weekly calls with them.
    *   **Goal:** To use this first cohort to gather invaluable feedback, prove our value with glowing case studies, and refine the AI engine on real-world data.

2.  **Phase 2: The "Founder-Led Sales" Launch (Months 4-6)**
    *   We use our case studies and testimonials to target our next **20-30 clients**.
    *   We launch the self-service "Starter" and "Growth" plans.
    *   Sales are still driven by us, the founders, doing demos and building relationships.

3.  **Phase 3: Scaling (Months 7+)**
    *   With a proven product and a solid client base, we can now start to scale marketing and sales.
    *   This is the point where we would use the metrics from our first 30+ clients to **raise a seed round of investment.**

#### **5. The Pitch to an Investor/Co-founder**

Here is how we frame our business:

"We are building an intelligent marketing platform that solves the problem of authentic community engagement at scale. Brands today are desperate to connect with customers in niche online communities, but their corporate marketing feels inauthentic and is often rejected.

Our platform combines a sophisticated AI swarm—which handles strategy, opportunity analysis, and content creation—with a curated network of human Executors who provide the final, authentic touch of publishing and engagement.

We are not just another social media tool. We are building a **learning ecosystem**. Our key defensible moats are our tiered Executor network and our proprietary "Genesis Mind," a platform-level intelligence that learns from every interaction, allowing us to deliver increasingly effective campaigns over time.

We have a working prototype, a clear, tiered SaaS business model, and a phased go-to-market strategy. We are seeking a partner to help us capture this massive market opportunity."

This is a business model that is not just about code; it's about creating a scalable, defensible, and highly valuable platform. This is the vision we can confidently build towards.
