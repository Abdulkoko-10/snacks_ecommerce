# Target Application Architecture ("To-Be")

## 1. Overview

This document outlines the target architecture for the Food Discovery Platform revamp. The goal is to transition from a monolithic application to a distributed system designed for scalability, aggregation of multiple data sources, and AI-powered intelligence.

## 2. High-Level Architecture Diagram

The target system is composed of several interconnected services:

```text
[Mobile UI (Next.js React)] <-----> [Frontend API / Next API routes]
           |                                  |
           ^                                  |
           | WebSocket / REST                 | REST/API
           |                                  v
           v                                  v
[Floating Cat UI]                     [API Gateway / Auth (Clerk)]
[Chat UI] <--- WebSocket ---> [Orchestrator Service (Node.js)]
                                     |
                                     |
   +---------------------------------+---------------------------------+
   |                                 |                                 |
   v                                 v                                 v
[Provider Connectors]         [Gemini Service]                [Sanity CMS]
(UberEats, Doordash, etc.)   (Embeddings, Reasons)      (Native Product Data, Comments)
   |                                 |                                 |
   v                                 v                                 v
[Cache (Redis)]             [Vector DB (Optional)]     [Persistent DB (Mongo/Firestore)]
                                                     (Merged Canonical Products, Events)
```

## 3. Core Components

### 3.1. Frontend (Next.js)
- **Responsibilities:** Renders the user interface, including the main product feeds, chat UI, and the floating cat assistant.
- **Communication:** Interacts with the backend via a combination of REST API calls (for data fetching) and WebSockets (for real-time chat).
- **Authentication:** Integrates with Clerk for user session management on the client-side.

### 3.2. Orchestrator Service (Node.js)
- **The Core:** This is the central brain of the backend. It does not perform business logic itself but orchestrates calls to other services.
- **Responsibilities:**
    - Handles incoming requests from the frontend.
    - Validates user sessions with Clerk.
    - Queries provider connectors for external data.
    - Calls the Gemini service for AI-powered insights and recommendations.
    - Fetches/stores canonical product data from the persistent database.
    - Manages chat sessions and pushes real-time events.
- **Technology:** Node.js with a framework like Express or Fastify, using TypeScript.

### 3.3. Provider Connectors
- **Role:** A set of individual microservices, one for each external food delivery provider (e.g., UberEats, DoorDash).
- **Responsibilities:**
    - Adapt provider-specific API responses into the unified platform schema.
    - Handle rate limiting and caching (Redis) for provider APIs.
    - Are idempotent and defensive to prevent cascading failures.

### 3.4. Gemini Service
- **Role:** Encapsulates all interactions with Google's Gemini models.
- **Responsibilities:**
    - Generating embeddings for products and user preferences.
    - Powering semantic search and similarity lookups.
    - Generating human-readable "reasons" for recommendations.
    - Analyzing user intent from chat messages.

### 3.5. Data Stores
- **Sanity CMS:** Stores FoodDiscovery-native content, such as manually created products, user comments, and articles. It acts as a source of truth for non-aggregated data.
- **Persistent DB (MongoDB/Firestore):** Stores the canonical, merged product records. This is the source of truth for aggregated products that combine data from multiple providers.
- **Cache (Redis):** Used for caching frequent API responses, particularly from provider connectors, to improve performance and reduce external API calls.
- **Vector DB (Pinecone/Milvus, optional):** Stores embedding vectors for fast similarity searches if needed.

### 3.6. Authentication (Clerk)
- **Role:** Acts as the central authentication and user management service.
- **Responsibilities:** Manages user sign-up, sign-in, profiles, and session validation for both the frontend and the backend services.

## 4. Core Design Principles

The architecture is guided by the following principles to ensure reliability and maintainability:

- **Single Source of Truth:** Each piece of data has one and only one authoritative source (e.g., canonical products in the persistent DB, native content in Sanity).
- **Explicit Contracts:** All cross-service communication uses versioned JSON schemas (e.g., defined with Zod/Joi) to prevent data mismatches.
- **Attribution Always Present:** Every piece of data from an external provider is tagged with its origin (`{ provider, providerProductId, fetchedAt }`).
- **Idempotent & Defensive Operations:** Connectors and data ingestion endpoints are designed to be idempotent and include circuit breakers and rate limits to isolate failures.
- **Observability:** The system will be instrumented with distributed tracing, structured logging, and automated contract tests to ensure health and performance.
