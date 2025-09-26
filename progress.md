# Project Progress Tracker

This document tracks the progress of the Food Discovery Platform revamp. It is designed to be a living document, updated by the development team and AI agents.

---

## Phase -1: Documentation & Planning

**Status:** `[DONE]`

- `[DONE]` Analyze existing codebase
- `[DONE]` Create comprehensive architecture & planning documents

---

## Phase 0: Preparatory Work

**Status:** `[DONE]`

- `[DONE]` Scaffold new service directories (`orchestrator`, `connectors`)
- `[DONE]` Set up shared schemas package (`@fd/schemas`)
- `[IN PROGRESS]` Set up secrets management (stubs in place)
- `[DONE]` Configure CI/CD for new services (GitHub Actions workflow created)

---

## Phase 1: Unified Schema & First Connector

**Status:** `[DONE]`
**Depends on:** Phase 0

1.  **Core Implementation:**
    - `[DONE]` Build Canonicalizer Service & Persistent DB (MongoDB integrated, initial upsert logic in place)
    - `[DONE]` Build first provider connector (Sanity, now push-based)
    - `[DONE]` Implement core orchestrator endpoints (`/search`, `/product/:slug`, `/ingest`)
    - `[DONE]` Migrate existing Sanity data (migration script created)
    - `[DONE]` Adapt frontend to use new API (Homepage & Product Detail page adapted with feature flag)
2.  **QA & Testing:**
    - `[DONE]` Unit tests for canonicalizer service logic.
    - `[DONE]` Integration tests for the first provider connector.
    - `[IN PROGRESS]` Contract tests between frontend and orchestrator for `/search` and `/product/:id`.
3.  **Integration Points Checklist:**
    - `[x]` Does the orchestrator handle the unified schema correctly?
    - `[x]` Is the frontend consuming the new API as expected? (via feature flag)

---

## Phase 2: Chat Page & Recommendations Migration

**Status:** `[IN PROGRESS]`
**Depends on:** Phase 1

1.  **Core Implementation (Orchestrator):**
    - `[DONE]` Migrate chat thread management (`GET /threads`, `PUT /threads/:id`, `DELETE /threads/:id`).
    - `[DONE]` Migrate chat history (`GET /history?threadId=...`).
    - `[IN PROGRESS]` Migrate message sending (`POST /message`), including Gemini integration.
    - `[TODO]` Implement real-time (WebSocket/streaming) connection.

2.  **Core Implementation (Frontend):**
    - `[DONE]` Build Chat UI Components (Layout, Sidebar, Thread view, etc.).
    - `[IN PROGRESS]` Adapt frontend to use new chat API endpoints under a feature flag (`USE_ORCHESTRATOR_CHAT`).
        - `[DONE]` Chat Sidebar (thread management) adapted.
        - `[DONE]` Main Chat View (history fetching) adapted.
        - `[TODO]` Main Chat View (message sending) to be adapted.

3.  **QA & Testing:**
    - `[DONE]` Unit tests for orchestrator chat thread management endpoints.
    - `[DONE]` Unit tests for orchestrator history endpoint.
    - `[TODO]` Unit tests for orchestrator message endpoint.
    - `[TODO]` E2E tests for the full chat flow via the orchestrator.

---

## Phase 3: Personalization & Advanced Recommendations

**Status:** `[TODO]`
**Depends on:** Phase 1 & Phase 2

1.  **Core Implementation:**
    - `[TODO]` Implement embedding pipeline
    - `[TODO]` Develop user intent modeling
    - `[TODO]` Enhance recommendation logic with embeddings and scoring
    - `[TODO]` Implement "reasons" generation
2.  **QA & Testing:**
    - `[TODO]` Unit tests for embedding generation.
    - `[TODO]` Integration tests for vector DB similarity lookups.
    - `[TODO]` E2E tests for personalized recommendation flow.
3.  **Integration Points Checklist:**
    - `[ ]` Are embeddings being generated and stored correctly?
    - `[ ]` Does the orchestrator use embeddings for candidate selection?
    - `[ ]` Does the Gemini "reasons" generation work as expected?

---

## Phase 4: Native Comments & Content Merging

**Status:** `[TODO]`
**Depends on:** Phase 1

1.  **Core Implementation:**
    - `[TODO]` Implement native comments API
    - `[TODO]` Update frontend to display unified comments
    - `[TODO]` Refine data merging logic
2.  **QA & Testing:**
    - `[TODO]` Unit tests for the comments API.
    - `[TODO]` Frontend tests for the unified comments display.
3.  **Integration Points Checklist:**
    - `[ ]` Does the orchestrator correctly merge comments from different sources?
    - `[ ]` Is the frontend displaying the unified comment list correctly?

---

## Phase 5: Reliability, Scaling & Observability

**Status:** `[TODO]`
**Depends on:** All previous phases

1.  **Core Implementation:**
    - `[TODO]` Implement circuit breakers, rate limiting, etc.
    - `[TODO]` Set up monitoring, logging, and tracing
2.  **QA & Testing:**
    - `[TODO]` Implement comprehensive testing (unit, integration, contract, E2E) across all services.
    - `[TODO]` Set up synthetic monitoring for critical user flows.

---

## Current Focus

- **Feature:** Implement True Recommendation Logic
- **Status:** Design and implement the orchestrator logic to generate intelligent recommendations based on user intent, replacing the current placeholder (latest products).
