# Migration Plan: Monolith to Microservices

This document outlines the incremental migration plan for transitioning the Food Discovery Platform from a monolithic Next.js application to a distributed system with an orchestrator and connectors.

## 1. Overview

The goal of this migration is to refactor the existing application into a more scalable and maintainable microservices architecture without disrupting the live platform. The migration will be performed in phases, with feature flags used to control the rollout of new services.

## 2. Core Principles

- **Incremental Rollout:** New services will be introduced incrementally, with the existing application remaining fully functional.
- **Feature Flags:** A feature flag system will be used to switch between the legacy API routes and the new orchestrator-based logic.
- **Data Consistency:** Data will be kept consistent between the old and new systems during the migration.
- **No User Disruption:** The migration will be transparent to users, with no impact on their experience.

## 3. Migration Phases

### Phase 0: Scaffolding and Infrastructure (In Progress)

- **Service Directories:** Create `/orchestrator`, `/connectors`, and `/infra` directories.
- **Shared Schemas:** Establish a `@fd/schemas` package with unified data contracts.
- **Migration Plan:** Create this `migration-plan.md` document.
- **Orchestrator Setup:** Initialize a basic Node.js/Express application for the orchestrator.
- **Authentication:** Add stubs for Clerk authentication and secrets management.

### Phase 1: First Connector and Orchestrator Endpoints

- **Sanity Connector:** Build the first provider connector for Sanity.
- **Orchestrator Endpoints:** Implement stub endpoints for search, product details, and chat recommendations.
- **Schema Adherence:** Ensure all new endpoints use the unified schemas.

### Phase 2: Feature Flag Implementation

- **Feature Flag System:** Introduce a simple feature flag mechanism (e.g., using environment variables).
- **Conditional Logic:** Add logic to the frontend to switch between legacy and new APIs based on the feature flag.

### Phase 3: Verification and Deployment

- **Testing:** Add unit and integration tests for the new services.
- **CI/CD:** Update the CI/CD pipeline to support the new microservices architecture.
- **Vercel Deployment:** Ensure the new services can be deployed and tested on Vercel.

## 4. Key Refactoring Steps

- **Chat Logic:** The chat logic in `pages/api/v1/chat/message.js` will be moved to the orchestrator.
- **Recommendation Engine:** The recommendation logic will be extracted into a dedicated service.
- **Data Fetching:** Data fetching from Sanity will be moved to the Sanity connector.
- **Database Storage:** Chat history and other data will be migrated to a new database managed by the orchestrator.