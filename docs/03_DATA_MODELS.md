# Data Models and Migration Strategy

## 1. Overview

This document details the transition from the current data models in Sanity.io to the new, unified data models that will power the revamped Food Discovery Platform. It covers the current schemas, the target schemas, a gap analysis, and the proposed data flow and migration strategy.

## 2. Current Data Models (in Sanity.io)

The existing data is stored in two main schemas within Sanity.

### 2.1. `product` Schema
A simple model for a product sold directly by the platform.
- `name` (string)
- `image` (array of images)
- `slug` (slug)
- `price` (number)
- `details` (string)

### 2.2. `review` Schema
A model for a user-submitted review, linked to a `product`.
- `user` (string)
- `rating` (number)
- `reviewTitle` (string)
- `comment` (text)
- `product` (reference to a `product`)
- `createdAt` (datetime)
- `approved` (boolean)

---

## 3. Target Data Models

The new architecture introduces a "canonical" product model that will live in a dedicated **Persistent Database (e.g., MongoDB/Firestore)**. This model will be the single source of truth for all product information displayed to the user, whether it originates from an external provider or from the platform itself.

### 3.1. `CanonicalProduct` Schema (Target)
This is the unified product JSON structure.

```json
{
  "canonicalProductId": "string",    // e.g., "fd::pizza::uuid123"
  "title": "string",
  "images": ["string"],
  "description": "string",
  "price": {
    "amount": "number",
    "currency": "string"
  },
  "rating": "number",
  "numRatings": "number",
  "tags": ["string"],
  "sources": [
    {
      "provider": "string",          // "UberEats", "Doordash", "FoodDiscovery"
      "providerProductId": "string",
      "price": "number",
      "deliveryEtaMin": "number",
      "lastFetchedAt": "datetime"
    }
  ],
  "comments": [
    // See Comment Schema below
  ],
  "popularityScore": "number",
  "lastFetchedAt": "datetime"
}
```

### 3.2. `Comment` Schema (Nested within `CanonicalProduct`)
This schema unifies existing reviews and new comments from various sources.

```json
{
  "id": "string",
  "text": "string",
  "author": "string",                // "Alice", "user:clerk_user_1"
  "origin": "string",                // "external:UberEats", "food-discovery"
  "rating": "number",                // Optional
  "createdAt": "datetime"
}
```

---

## 4. Gap Analysis and Data Flow Strategy

### 4.1. Key Differences
- **Location:** The source of truth shifts from Sanity.io to a new Persistent DB for aggregated products.
- **Structure:** The target schema is heavily denormalized and enriched, containing aggregated data (`rating`, `numRatings`), provider-specific source info, and unified comments.
- **Scope:** The new model is built to handle data from multiple sources, not just one.

### 4.2. New Data Flow
1.  **Ingestion:** Provider Connectors fetch data from external APIs (e.g., UberEats).
2.  **Canonicalization:** A "Canonicalizer/Merge Service" processes this data. It uses the algorithm below to match incoming items to existing `CanonicalProduct` records in the Persistent DB.
3.  **Storage:**
    - If a match is found, the existing `CanonicalProduct` is updated (e.g., a new provider is added to the `sources` array).
    - If no match is found, a new `CanonicalProduct` is created.
    - The result is saved to the **Persistent DB**.
4.  **Serving:** The frontend reads exclusively from the **Persistent DB** via the Orchestrator service to display product information.

### 4.3. Role of Sanity.io in the New Architecture
Sanity.io will be repurposed to store **only platform-native content**:
-   Products added manually by platform administrators. These will be ingested by the Canonicalizer service just like any other provider, with their `origin` marked as `"food-discovery"`.
-   Comments written directly on the platform. These will be added to the `comments` array of the corresponding `CanonicalProduct` in the Persistent DB.

### 4.4. Migration Plan for Existing Data
1.  **One-Time Script:** A migration script will be created.
2.  **Read Products:** The script will read all `product` documents from the current Sanity.io instance.
3.  **Transform:** Each Sanity `product` will be transformed into the new `CanonicalProduct` schema.
    - A `sources` array will be created with one entry: `{ "provider": "FoodDiscovery", "providerProductId": product._id, ... }`.
4.  **Read Reviews:** For each product, the script will find all associated `review` documents.
5.  **Transform Reviews:** Each `review` will be transformed into the new `Comment` schema and added to the `comments` array of its parent `CanonicalProduct`.
6.  **Write to DB:** The fully formed `CanonicalProduct` objects will be written to the new Persistent DB.

---

## 5. Canonicalization & Deduplication Algorithm

The following algorithm will be used by the merge service to deduplicate items from different providers:

1.  **Normalize Fields:** Lowercase title, remove extra whitespace, strip punctuation.
2.  **Exact Match by Provider ID:** If a `providerProductId` from a source already exists in a `CanonicalProduct`'s `sources` list, it's an exact match.
3.  **Tokenized Title Similarity:** Compute Jaccard similarity and Levenshtein distance on normalized titles. If similarity is > `0.85`, it's a candidate match.
4.  **Feature Matching:** Check for price proximity (+/- 15%) and identical cuisine tags.
5.  **Embedding Similarity Fallback:** If available, check if the product embedding cosine similarity is > `0.92`.
6.  **Human Review Threshold:** If a match score is ambiguous (e.g., between 0.7 and 0.85), flag the item for manual review.
7.  **Merge Policy:** When merging, combine unique images, average ratings (weighted by `numRatings`), and append new providers to the `sources` array.
