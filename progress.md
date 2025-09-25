# Project Progress Tracker

This document tracks the progress of the Food Discovery Platform revamp. It is designed to be a living document, updated by the development team and AI agents.

---

## **Current Focus: Foundational Correction**

**Status:** `[IN PROGRESS]`

- **Goal:** Realign the codebase with the target microservices architecture and correct foundational data models before resuming feature development.
- `[DONE]` **Analysis:** A full analysis revealed significant architectural deviations and a data model mismatch.
- `[IN PROGRESS]` **Corrective Actions:**
    - `[DONE]` Corrected the shared schema from `CanonicalRestaurant` to `CanonicalProduct`.
    - `[DONE]` Scaffolded the `orchestrator` and `connectors` service directories.
    - `[DONE]` Implemented a mock chat backend (`/api/v1/chat/message`) to unblock the frontend.
    - `[TODO]` Begin migrating search and chat logic from the Next.js monolith to the new orchestrator service.

---

## Phase -1: Documentation & Planning

**Status:** `[DONE]`

- `[DONE]` Analyze existing codebase
- `[DONE]` Create comprehensive architecture & planning documents

---

## Phase 0: Preparatory Work

**Status:** `[IN PROGRESS]`

- `[DONE]` Scaffold new service directories (`orchestrator`, `connectors`)
- `[DONE]` Set up shared schemas package (`@fd/schemas`). *(Note: Corrected from `CanonicalRestaurant` to the official `CanonicalProduct` schema).*
- `[TODO]` Set up secrets management
- `[TODO]` Configure CI/CD for new services

---

## Phase 1: Unified Schema & First Connector

**Status:** `[TODO]`
**Depends on:** Phase 0

1.  **Core Implementation:**
    - `[TODO]` Build Canonicalizer Service & Persistent DB
    - `[TODO]` Build first provider connector
    - `[TODO]` Implement core orchestrator endpoints (`/search`, `/product/:id`). *(Note: A temporary `/search` endpoint exists in the monolith and will be migrated).*
    - `[TODO]` Migrate existing Sanity data
    - `[TODO]` Adapt frontend to use new API
2.  **QA & Testing:**
    - `[TODO]` Unit tests for canonicalizer service logic.
    - `[TODO]` Integration tests for the first provider connector.
    - `[TODO]` Contract tests between frontend and orchestrator for `/search` and `/product/:id`.
3.  **Integration Points Checklist:**
    - `[ ]` Does the orchestrator handle the unified schema correctly?
    - `[ ]` Is the frontend consuming the new API as expected?

---

## Phase 2: Chat Page & Recommendations

**Status:** `[IN PROGRESS]`
**Depends on:** Phase 1

1.  **Core Implementation:**
    - `[DONE]` Build Chat UI Components (Complete, including layout, styling, and responsiveness)
    - `[TODO]` Implement real-time (WebSocket/streaming) connection
    - `[DONE]` Implement end-to-end chat flow. *(Note: A mock backend has been created at `/api/v1/chat/message` to unblock the UI. This needs to be replaced by the real orchestrator logic).*
    - `[DONE]` UI Polish: Refined recommendation card design and implemented full-bleed carousel.
    - `[TODO]` Integrate with Gemini for recommendations.
    - `[TODO]` Polish and bugfix chat UI (Markdown rendering, modals, performance).
2.  **QA & Testing:**
    - `[TODO]` Unit tests for Chat UI components.
    - `[TODO]` E2E tests for the chat flow (from user message to recommendation display).
3.  **Integration Points Checklist:**
    - `[ ]` Does the Gemini API fully integrate here for basic responses?
    - `[ ]` Re-implement real-time connection for chat.
    - `[x]` Does the frontend correctly render `ChatRecommendationPayload`? *(Note: Renders mock data from the new mock API correctly.)*

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