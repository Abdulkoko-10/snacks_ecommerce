# Goal: Revamp to Global Food Discovery Platform

We are transitioning from a city snacks e-commerce platform to a global food discovery platform called Food Discovery.

## Core Objectives

### Unify Data Sources

Replace the current static snack catalog with real-time products from multiple APIs.

Regionalized connectors (examples):

- UK → Uber Eats, DoorDash
- Nigeria → Glovo, Chowdeck
- Other countries mapped to equivalent food delivery services.

### Product Pages

Each product page includes:

- Images
- Ratings
- Comments (with source attribution: existing platform vs. external APIs)
- AI-powered “You may also like” section, based on:
  - User history
  - Product similarity (via embeddings + AI scoring)

### Chat Page (Main Entry Point)

#### UI/UX

- Inspired by ChatGPT layout.
- Sidebar → chat history (custom styled to match platform theme).
- Text entry window (persistent, styled with our RGB theme).
- Navbar → always visible across all pages for seamless navigation.

#### Functionality

- Users can chat with the AI like a normal conversation.
- Focused on food-related discovery and queries.
- When user requests a recommendation:
  - AI generates preview cards directly under the relevant chat bubble.
  - Card Format: WhatsApp-style “status cards” showing image + short preview.
  - Expansion option → opens the full product page.

### Homepage

- Continues to exist alongside Chat and Product pages.
- Displays three featured products, dynamically chosen based on:
  - Most liked products worldwide across the platform.

### Navigation Between Pages

- Three main entry points:
  - Homepage
  - Chat Page with AI
  - Product Pages
- Each is accessible independently but seamlessly connected.
- Search option available for direct food/product lookup.

### AI Companion: Cat Assistant

- 2D animated cat integrated throughout the platform.
- Acts as a quirky, helpful guide during discovery.
- Evolves with the platform roadmap (MVC → Intermediate → Miss Minutes–level).

## End Vision

The platform becomes the global hub for food discovery, where users can:

- Chat naturally with AI to find meals they want.
- Get live recommendations from regional APIs.
- Browse structured product pages with unified data.
- See trending global foods featured on the homepage.
- Enjoy a unique AI Cat assistant guiding them along the journey.
