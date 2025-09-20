# API Contracts (Version 1)

## 1. Overview

This document defines the version 1 (`v1`) API contracts for the Food Discovery Platform's orchestrator service. All endpoints are prefixed with `/api/v1`.

**Authentication:** All user-facing endpoints require a valid authentication token (provided by Clerk), which will be verified at the API Gateway or in a middleware layer. Internal endpoints will be secured by other means (e.g., API keys).

**Schema Validation:** All request and response bodies will be validated against a strict schema (e.g., using Zod or Joi) to ensure data integrity.

---

## 2. Product Endpoints

### GET `/api/v1/search`
-   **Method:** `GET`
-   **Description:** Searches for canonical products based on a query and region.
-   **Query Parameters:**
    -   `q` (string, optional): The search query.
    -   `region` (string, required): The geographic region for the search.
    -   `limit` (integer, optional, default: 20): The number of results to return.
    -   `offset` (integer, optional, default: 0): The starting offset for pagination.
-   **Success Response (200 OK):**
    -   **Body:** An array of `CanonicalProduct` objects. See `03_DATA_MODELS.md` for the full schema.
    ```json
    [
      {
        "canonicalProductId": "fd::pizza::uuid123",
        "title": "Margherita Pizza",
        "images": ["https://.../img1.jpg"],
        "description": "Classic margherita with fresh basil",
        "price": { "amount": 6.95, "currency": "GBP" },
        "rating": 4.4,
        "numRatings": 132,
        "tags": ["pizza", "vegetarian", "italian"],
        "sources": [
          { "provider":"UberEats", "providerProductId":"ue123", "price":7.5, "deliveryEtaMin":25, "lastFetchedAt":"2025-09-15T12:00:00Z" },
          { "provider":"Doordash", "providerProductId":"dd456", "price":6.95, "deliveryEtaMin":18, "lastFetchedAt":"2025-09-15T11:58:00Z" }
        ]
      }
    ]
    ```

### GET `/api/v1/product/:canonicalId`
-   **Method:** `GET`
-   **Description:** Retrieves a single canonical product by its ID.
-   **URL Parameters:**
    -   `canonicalId` (string, required): The unique ID of the canonical product.
-   **Success Response (200 OK):**
    -   **Body:** A single `CanonicalProduct` object.

### GET `/api/v1/provider/product/:provider/:id`
-   **Method:** `GET`
-   **Description:** A diagnostic endpoint to view the raw, untransformed data for a specific product directly from a provider.
-   **URL Parameters:**
    -   `provider` (string, required): The name of the provider (e.g., "UberEats").
    -   `id` (string, required): The product's ID within that provider's system.
-   **Success Response (200 OK):**
    -   **Body:** The raw JSON object as returned by the provider's API.

---

## 3. Chat & Recommendation Endpoints

### POST `/api/v1/chat/message`
-   **Method:** `POST`
-   **Description:** The primary endpoint for the chat UI. The user's message is sent here, and the orchestrator processes it to generate a response, which may include recommendations.
-   **Request Body:**
    ```json
    {
      "message": "I'm looking for something spicy",
      "chatHistory": [ /* ... previous messages ... */ ]
    }
    ```
-   **Success Response (200 OK):**
    -   **Body:** A chat response object. If recommendations are generated, they will be in the format defined below.

### Chat Recommendation Payload (Example Response)
This is the structure of the `recommendations` payload returned by the chat endpoint when applicable.

```json
{
  "messageId": "msg_abc",
  "recommendations": [
    {
      "canonicalProductId": "fd::pizza::uuid123",
      "preview": {
        "title": "Margherita Pizza",
        "image": "https://...",
        "rating": 4.4,
        "minPrice": 6.95,
        "bestProvider": "Doordash",
        "eta": "18-25 min",
        "originSummary": ["UberEats", "Doordash"]
      },
      "reason": "You liked 'Pepperoni Classic' recently—this is a similar, cheaper option with fast delivery.",
      "meta": {
        "generatedBy": "gemini-vX",
        "confidence": 0.78
      }
    }
  ]
}
```

---

## 4. Content & Ingestion Endpoints

### POST `/api/v1/product/:id/comment`
-   **Method:** `POST`
-   **Description:** Allows an authenticated user to post a native "food-discovery" comment on a product.
-   **URL Parameters:**
    -   `id` (string, required): The `canonicalProductId`.
-   **Request Body:**
    ```json
    {
      "rating": 4,
      "text": "This was delicious!"
    }
    ```
-   **Success Response (201 Created):**
    -   **Body:** The newly created `Comment` object.

### POST `/api/v1/ingest/provider-data`
-   **Method:** `POST`
-   **Description:** An internal endpoint, likely triggered by a webhook from a provider connector, to push new data to the canonicalizer service.
-   **Security:** This endpoint must be secured via an internal API key, not user-facing authentication.
-   **Request Body:**
    ```json
    {
      "provider": "UberEats",
      "items": [ /* ... array of raw product data objects from UberEats API ... */ ]
    }
    ```
-   **Success Response (202 Accepted):**
    -   **Body:** An empty body, indicating the data has been accepted for asynchronous processing.
