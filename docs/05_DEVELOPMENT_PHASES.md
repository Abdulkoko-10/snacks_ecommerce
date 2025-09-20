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

**Goal:** Ensure the system is robust, secure, and maintainable for production use.

1.  **Reliability & Safety:**
    -   **Retry/Circuit Breakers:** Implement exponential backoff and circuit breakers (e.g., using `opossum`) for all flaky provider endpoints in the connectors and orchestrator.
    -   **Rate Limiting:** Implement server-side rate limiting for both per-user requests and provider-level quotas to prevent abuse and cascading failures. Properly handle `429 Too Many Requests` responses.
    -   **Idempotency:** Ensure critical write operations (like posting comments) use idempotency keys.
    -   **Feature Flags:** Implement a robust feature flag system (e.g., using a DB or environment variables) to gate new provider connectors, cat animations, and the Gemini rollout.

2.  **Testing & Validation:**
    -   **Unit Tests:** Ensure high coverage for critical business logic in connectors (transformation logic) and the canonicalizer service.
    -   **Integration Tests:** Write integration tests for all orchestrator endpoints, mocking the responses from provider connectors and the Gemini service.
    -   **Contract Tests:** Implement contract tests (e.g., using Pact) to formally verify the contracts between the `frontend ↔ orchestrator` and the `orchestrator ↔ provider connectors`.
    -   **E2E Tests:** Create end-to-end tests for the critical user flow: chat → recommendation → product page.
    -   **Synthetic Monitoring:** Set up a scheduled script that runs hourly, hitting the core search, product, and chat flows, and alerts on any failures.

3.  **Observability & Operations:**
    -   **Health Checks:** Add `/health` endpoints to the orchestrator and all connector services. Configure alerts for failures.
    -   **Monitoring & Metrics:** Instrument all services to collect key metrics: request rates, latencies, error rates, cache hit ratio, and provider-specific error rates.
    -   **Distributed Tracing:** Propagate a unique `requestId` from the initial frontend request through the orchestrator and down to the connectors to allow for easy debugging of the entire request lifecycle.
    -   **Structured Logging:** Implement structured JSON logs across all services. Each log entry must include the `requestId`, and `userId` if available, to correlate user activity.
    -   **Runbooks:** Create operational runbooks for common failure scenarios, such as a provider connector failing or the cache needing to be warmed.

4.  **Security & Privacy:**
    -   **Provider Tokens:** Verify that all provider tokens are stored securely in the secrets manager and are never exposed to the client-side application.
    -   **Data Retention:** Define and implement a formal data retention policy for user data, logs, and comments.
    -   **PII Protection:** Ensure all services have mechanisms to protect Personally Identifiable Information (PII) and that no unnecessary PII is sent to third-party services like Gemini.
