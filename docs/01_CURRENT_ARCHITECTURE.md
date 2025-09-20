# Current Application Architecture ("As-Is")

## 1. Overview

This document describes the current architecture of the Food Discovery Platform before the planned revamp. The application is a monolithic Next.js web application that functions as a single-source e-commerce store.

## 2. Technology Stack

The platform is built on a modern JavaScript stack:

- **Framework:** [Next.js](https://nextjs.org/) (v13.5.6)
- **Language:** JavaScript (with React v18)
- **Package Manager:** npm

## 3. Architectural Components

### 3.1. Frontend

- **Monolithic Frontend:** The entire user interface is rendered by a single Next.js application.
- **UI Components:** Built with standard React components, located in the `/components` directory.
- **Styling:** Primarily uses global CSS with CSS Modules, located in `/styles`.
- **State Management:** Utilizes React's Context API for global state management, particularly for the shopping cart (`/context/StateContext.js`).
- **Client-Side Data Fetching:** Employs the `SWR` library for dynamic client-side data fetching, notably for loading product reviews.

### 3.2. Backend

- **Serverless Functions:** The backend logic is implemented using Next.js API Routes within the `/pages/api` directory.
- **Key Endpoints:**
    - `api/stripe.js`: Handles payment processing logic with Stripe.
    - `api/createReview.js`: Manages the creation of new product reviews.
    - `api/createPreOrder.js`: Handles pre-order submissions.

### 3.3. Data & Content

- **Headless CMS:** [Sanity.io](https://www.sanity.io/) serves as the primary data source. The Sanity Studio project is co-located within the `/koko` directory.
- **Data Fetching Strategy:**
    - **Static Site Generation (SSG):** Product pages are pre-rendered at build time using `getStaticProps` and `getStaticPaths` for performance.
    - **Client-Side Rendering (CSR):** Dynamic content like reviews is fetched on the client-side using SWR.
- **Current Sanity Schemas:**
    - `product`: A simple model containing fields like `name`, `image`, `price`, and `details`.
    - `review`: Stores user-submitted reviews for products.
    - `banner`: Manages content for the homepage hero banner.

### 3.4. Services & Integrations

- **Authentication:** User sign-up and sign-in are handled by [Clerk](https://clerk.com/), integrated via the `@clerk/nextjs` package. The sign-in/up pages are located at `/pages/sign-in` and `/pages/sign-up`.
- **Payments:** Payment processing is integrated with [Stripe](https://stripe.com/) via the `@stripe/stripe-js` library and a corresponding backend API route.

## 4. Summary

The current architecture is a classic, tightly-coupled Next.js application, well-suited for a single-vendor e-commerce site. It relies heavily on serverless functions for its backend and Sanity.io for content management. It lacks the distributed nature, data aggregation capabilities, and AI features envisioned in the target architecture.
