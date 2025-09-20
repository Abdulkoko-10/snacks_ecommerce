# Development Phases and Implementation Plan

## 1. Overview

This document adapts the original high-level implementation plan to the context of the existing codebase. It provides a more detailed, step-by-step roadmap for the revamp, breaking down each phase into concrete tasks.

---

## Phase 0: Preparatory Work

**Goal:** Set up the foundational tools, repository structure, and services needed for the new architecture.

1.  **Repository Scaffolding:**
    -   Create new top-level directories: `orchestrator/`, `connectors/`, `infra/`.
    -   The existing Next.js app will serve as the `frontend/` directory.
2.  **Shared Schemas:**
    -   Create a new shared package (e.g., `@fd/schemas` using npm workspaces or similar) to hold all TypeScript interfaces for API contracts (e.g., `CanonicalProduct`, `Comment`).
    -   Define and implement the Zod/Joi schemas for validation.
3.  **Orchestrator Service Setup:**
    -   Initialize a new Node.js/TypeScript project in the `orchestrator/` directory.
    -   Set up a basic Express/Fastify server.
    -   Integrate Clerk for server-side token validation.
4.  **Secrets Management:**
    -   Set up a secure secret store (e.g., Doppler, Vault, or cloud provider's secret manager) for provider API keys.
5.  **CI/CD Foundation:**
    -   Enhance the existing CI (likely GitHub Actions) to run linting, type-checking, and unit tests for the new `orchestrator` and `connectors` services.
    -   Add a step for running contract tests between services.

---

## Phase 1: Unified Schema, Orchestrator & First Connector

**Goal:** Build the core data pipeline for one provider and begin migrating the frontend to use the new API.

1.  **Build the Canonicalizer Service:**
    -   Implement the canonicalization/merge logic as a module within the orchestrator.
    -   Set up the Persistent DB (e.g., MongoDB) and connect it to the orchestrator.
2.  **Build the First Connector:**
    -   Create a new service in `connectors/` for a single provider (e.g., `uber-eats-connector`).
    -   Implement the logic to fetch data from the provider's API, transform it to the `CanonicalProduct` schema, and send it to the orchestrator's `/api/v1/ingest/provider-data` endpoint.
    -   Integrate Redis for caching provider responses.
3.  **Implement Core Orchestrator Endpoints:**
    -   Build out the `GET /api/v1/search` and `GET /api/v1/product/:canonicalId` endpoints in the orchestrator to read data from the new Persistent DB.
4.  **Data Migration:**
    -   Execute the one-time migration script (defined in `03_DATA_MODELS.md`) to move existing products and reviews from Sanity into the new Persistent DB as `CanonicalProduct` records.
5.  **Frontend Adaptation (Homepage):**
    -   Modify the frontend's homepage (`pages/index.js`) to fetch data from the new `GET /api/v1/search` endpoint instead of directly from Sanity.
    -   Update the `ProductCard` component to display data from the `CanonicalProduct` schema.

---

## Phase 2: Chat & Recommendation UI

**Goal:** Build the new chat interface and integrate it with the backend to show inline recommendations.

1.  **Build Chat UI Components:**
    -   Create the new `ChatPage` component with a sidebar for history and a main thread view.
    -   Develop the `ChatBubble` and `ChatRecommendationCard` components.
2.  **Implement Real-time Communication:**
    -   Add WebSocket (Socket.io) support to the orchestrator and the frontend to handle real-time chat messages.
3.  **End-to-End Chat Flow:**
    -   Implement the `POST /api/v1/chat/message` endpoint in the orchestrator.
    -   Integrate the initial Gemini API call to detect intent and get recommendation candidates.
    -   The orchestrator will then fetch the full `CanonicalProduct` data for the candidates and return a `ChatRecommendationPayload`.
4.  **Frontend Integration:**
    -   Connect the `ChatPage` to the WebSocket server.
    -   When a `ChatRecommendationPayload` is received, render the `ChatRecommendationCard` components in the chat thread.
    -   Ensure clicking a recommendation card navigates to the correct product page, which will now use the new `/product/:canonicalId` route structure.

---

## Phase 3: Personalization & Advanced Recommendations

**Goal:** Enhance the recommendation engine using embeddings and user history.

1.  **Embedding Pipeline:**
    -   Create a background process or service that generates embeddings for all `CanonicalProduct` records using the Gemini API.
    -   Store these embeddings in a Vector DB (or a chosen alternative).
2.  **User Intent Modeling:**
    -   Begin tracking user actions (e.g., clicks, likes) and build a simple user profile/intent embedding.
3.  **Enhance Recommendation Logic:**
    -   Update the chat/recommendation flow in the orchestrator to use embedding similarity as a primary factor for finding candidates.
    -   Implement the scoring model: `score = α*(embedding similarity) + β*(popularity) + ...`
4.  **"Reasons" Generation:**
    -   Add a step in the orchestrator to call the Gemini API with the top-ranked candidates to generate concise, human-readable reason strings for why an item is recommended.

---

## Phase 4: Native Comments & Content Merging

**Goal:** Fully integrate native, on-platform comments and refine data merging logic.

1.  **Implement Native Comments API:**
    -   Build the `POST /api/v1/product/:id/comment` endpoint in the orchestrator.
    -   When a comment is posted, the orchestrator will add it to the `comments` array of the corresponding `CanonicalProduct` in the Persistent DB.
2.  **Frontend UI for Comments:**
    -   On the product page, update the reviews/comments section to display the unified `comments` array from the `CanonicalProduct`.
    -   Show attribution for each comment (`origin` field).
    -   Add the UI toggle for "[All comments]" vs. "[FoodDiscovery comments only]".
3.  **Refine Merging Logic:**
    -   Continuously improve the canonicalization algorithm based on real-world data, focusing on edge cases for merging fields like images and tags.

---

## Phase 5: Reliability, Scaling & Observability

**Goal:** Harden the system for production use.

1.  **Implement Circuit Breakers:** Add circuit breakers (e.g., using a library like `opossum`) in the orchestrator for all calls to external services (connectors, Gemini).
2.  **Health Checks:** Add `/health` endpoints to the orchestrator and each connector.
3.  **Monitoring & Tracing:**
    -   Integrate a monitoring tool (e.g., Prometheus/Grafana, Datadog) to track key metrics (latency, error rates, etc.).
    -   Implement distributed tracing by propagating a `requestId` across all services.
4.  **Contract & Integration Tests:**
    -   Write automated contract tests (e.g., using Pact) for the frontend-orchestrator and orchestrator-connector communication.
5.  **Feature Flags:**
    -   Implement a feature flag system to safely roll out new connectors or major features like the Gemini-powered recommendations.
