# Frontend Component List

## 1. Overview

This document provides a skeleton list of the primary frontend components required for the Food Discovery Platform. These components will be built using React/Next.js and will be strictly typed using TypeScript interfaces from the shared `@fd/schemas` package.

## 2. Core Layout & Navigation

-   **`Navbar`**
    -   **Description:** A sticky navigation bar present on all pages.
    -   **Contains:** Logo, navigation links, and the global `SearchBar`.

-   **`Footer`**
    -   **Description:** The standard site footer.
    -   **Contains:** Informational links, social media links, copyright information.

-   **`Layout`**
    -   **Description:** A wrapper component that includes the `Navbar` and `Footer` to ensure a consistent layout across all pages.

## 3. Page-Level & Feature Components

-   **`HomepageFeed`**
    -   **Description:** The main component for the homepage.
    -   **Responsibilities:** Calls the `/api/v1/search` endpoint to fetch and display an aggregated feed of products using the `ProductCard` component.

-   **`ProductCard`**
    -   **Description:** A preview component used to display a product in feeds, search results, and recommendation lists.
    -   **Displays:** Image, title, rating, minimum price, and provider summary.

-   **`ProductPage`**
    -   **Description:** The full, detailed view of a single canonical product.
    -   **Responsibilities:** Renders all information from the `CanonicalProduct` object, including all sources, a unified comments/reviews section, and the "You may also like" recommendations.

-   **`SearchBar`**
    -   **Description:** A unified search input, located in the `Navbar`.
    -   **Responsibilities:** Takes user input and triggers navigation to a search results page.

## 4. Chat & Assistant Components

-   **`ChatPage`**
    -   **Description:** The main view for the AI-powered chat hub.
    -   **Contains:** `SidebarHistory` and `ChatThread`.

-   **`SidebarHistory`**
    -   **Description:** A sidebar component within the `ChatPage` that displays a list of the user's past chat conversations.

-   **`ChatThread`**
    -   **Description:** The main component for displaying a conversation.
    -   **Contains:** A series of `ChatBubble` and `ChatRecommendationCard` components.

-   **`ChatRecommendationCard`**
    -   **Description:** A special card shown directly within the `ChatThread` to display a product recommendation.
    -   **Responsibilities:** Shows a preview of a recommended product and expands to the full `ProductPage` on click.

-   **`FloatingCatAssistant`**
    -   **Description:** A floating UI element (Lottie/SVG wrapper) present on all pages.
    -   **Responsibilities:** Triggers animations based on system events (e.g., recommendation shown). Opens the `ChatPage` or a chat drawer on click. (Note: Initial implementation will be a simple placeholder).
