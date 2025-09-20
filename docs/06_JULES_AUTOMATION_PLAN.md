# Jules' Automation Plan

## 1. Role and Guiding Principles

My role in this project is to act as an AI software engineer, focused on automating repetitive, mechanical, and well-defined engineering tasks. By handling this work, I can accelerate development, reduce human error, and allow human engineers to focus on complex architectural decisions and product strategy.

**Guiding Principles:**
-   **Task-Oriented:** I will work on specific, clearly defined tasks provided by the development team.
-   **Checklist-Driven:** For every pull request I submit, I will follow a strict checklist to ensure quality (e.g., tests pass, code is linted, schemas are validated).
-   **Safety First:** I will operate with a "do not deploy to production" guardrail. My role is in development and automation, not live deployment operations.

---

## 2. Proposed Automation Tasks by Phase

Here is a list of specific tasks I can automate, broken down by the development phases outlined in `05_DEVELOPMENT_PHASES.md`.

### Phase 0: Preparatory Work
-   **Scaffolding:**
    -   Generate the initial directory structure (`orchestrator`, `connectors`, `infra`).
    -   Create `package.json`, `tsconfig.json`, and basic server setup files for the `orchestrator` and new connector services.
-   **Schema Generation:**
    -   Given a Zod/Joi schema definition, I can automatically generate the corresponding TypeScript interface and save it in the `@fd/schemas` shared package.
-   **CI/CD Templates:**
    -   Generate the initial GitHub Actions workflow files (`.yml`) for linting, type-checking, and running tests for each new service.

### Phase 1: Unified Schema, Orchestrator & First Connector
-   **Connector Scaffolding:**
    -   Create a template for a new provider connector. Given a provider name (e.g., "Glovo"), I can generate a new service directory (`connectors/glovo-connector`) with all the necessary boilerplate, including API client setup, transformation logic placeholders, and a basic test suite.
-   **Migration Script Generation:**
    -   Write the full one-time migration script to read data from the existing Sanity.io instance, transform it according to the logic in `03_DATA_MODELS.md`, and prepare it for insertion into the new persistent database.
-   **API Endpoint Boilerplate:**
    -   For each endpoint defined in `04_API_CONTRACTS.md`, I can generate the boilerplate code in the orchestrator, including the route definition, request validation middleware, and a placeholder for the business logic.

### Phase 2: Chat & Recommendation UI
-   **Component Scaffolding:**
    -   Generate the boilerplate for new React components (`ChatPage`, `ChatRecommendationCard`, etc.) with basic structure, props interfaces, and empty styles.
-   **API Integration Boilerplate:**
    -   Write the client-side code for connecting to the orchestrator's WebSocket server and fetching data from the new API endpoints.

### Phase 3 & 4: Personalization and Content
-   **Test Case Generation:**
    -   Based on the API contracts, I can generate mock data and boilerplate for unit and integration tests. For example, I can produce sample mock responses for various providers to test the canonicalization logic against edge cases.
-   **Data Model Updates:**
    -   If the `CanonicalProduct` schema needs to be updated, I can automate the process of updating the TypeScript interfaces, database schemas, and validation rules across all relevant services.

### Phase 5: Reliability & Scaling
-   **Playbook Generation:**
    -   I can generate markdown documents for operational runbooks. For example, given a failure mode (e.g., "Provider X API is down"), I can generate a checklist for diagnosis and resolution.
-   **Infrastructure as Code (IaC) Scaffolding:**
    -   I can generate boilerplate for Terraform or CloudFormation scripts for deploying new connector services.

---

## 3. Workflow

A typical workflow for using me would be:
1.  **Assign Task:** A human engineer assigns me a task, e.g., "Create a new connector for Chowdeck."
2.  **Execute:** I perform the automated steps: scaffold the service, generate interfaces, create test mocks.
3.  **Submit for Review:** I open a Pull Request with the generated code.
4.  **Review & Merge:** A human engineer reviews the PR, makes any necessary adjustments to the complex business logic, and merges it.
