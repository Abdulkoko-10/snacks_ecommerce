# Optimization Targets - Initial Identification (Phase 1, Part 1)

This document lists potential areas for performance optimization identified during the initial thorough pass of the codebase.

## 1. Image Optimization

*   **Area:** Image handling throughout the application, particularly in `components/HeroBanner.jsx`, `components/Product.jsx`, and `pages/product/[slug].js`.
*   **Potential Impact:** Significant improvement in page load times (LCP, FCP), reduced bandwidth usage.
*   **Rationale:** Currently uses standard `<img>` tags. `next/image` (or `next-sanity-image` for Sanity images) is not consistently implemented. This means missing out on automatic resizing, modern format conversion (e.g., WebP), and optimized lazy loading. Explicit `width` and `height` are good, but served image sizes might not be optimal.

## 2. Page Rendering Strategy (Homepage)

*   **Area:** `pages/index.js` data fetching strategy.
*   **Potential Impact:** Faster initial page loads for the homepage, reduced server load.
*   **Rationale:** Currently uses `getServerSideProps`, rendering the page on every request. If homepage content (products, banners) doesn't change with extreme frequency, `getStaticProps` with Incremental Static Regeneration (ISR) would be more performant by serving static content and regenerating in the background.

## 3. Data Fetching Efficiency

*   **Area:** Data fetching logic in `pages/index.js` and `pages/product/[slug].js`.
*   **Potential Impact:** Reduced data transfer, faster server response times, lower database/CMS load.
*   **Rationale:**
    *   Homepage (`getServerSideProps`): Fetches *all* products (`*[_type == "product"]`) and *all* banners on every request. This could be inefficient if the number of products/banners is large. Consider pagination or fetching a curated subset.
    *   Product Detail Page (`getStaticProps`): Fetches *all* products again for the "You may also like" section. A more targeted query (e.g., by category, random subset) would be more efficient than loading all products for every product page build/revalidation.

## 4. Client-Side State Management (React Context)

*   **Area:** `context/StateContext.js`.
*   **Potential Impact:** Reduced unnecessary component re-renders, improved UI responsiveness.
*   **Rationale:** The `StateContext` provides a broad range of state variables and setters. Components consuming this context may re-render even if the specific piece of state they use hasn't changed. If profiling reveals this as a bottleneck, strategies like splitting context or using selectors could be beneficial.

## 5. API Route Security

*   **Area:** Environment variable usage in `pages/api/createReview.js` and `pages/api/stripe.js`.
*   **Potential Impact:** Critical security vulnerability prevention. While not directly a "performance" optimization, it's a crucial finding during a codebase review.
*   **Rationale:**
    *   `pages/api/createReview.js`: Uses `process.env.NEXT_PUBLIC_SANITY_TOKEN` for a write operation. Sanity write tokens should be kept server-side only (e.g., `process.env.SANITY_API_WRITE_TOKEN`) and not prefixed with `NEXT_PUBLIC_`.
    *   `pages/api/stripe.js`: Uses `process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY`. Stripe Secret Keys **must never** be exposed client-side. This should be a non-public variable like `process.env.STRIPE_SECRET_KEY`.

## 6. API Route Logic (`pages/api/stripe.js`)

*   **Area:** Stripe API route implementation details.
*   **Potential Impact:** Improved robustness, correct payment processing, better maintainability.
*   **Rationale:**
    *   **Image URL Construction:** Hardcoded string replacement for Sanity image URLs is brittle and assumes specific formats (`image-`, `-webp`). Using Sanity's `imageUrlBuilder` or passing full URLs from client would be more robust.
    *   **Currency Mismatch:** Prices in frontend components seem to be in NGN (Nigerian Naira, denoted by "N"), but the Stripe API route hardcodes "usd" (US Dollars). This will lead to incorrect billing.
    *   **Shipping Options:** Hardcoded shipping rate ID lacks flexibility.

## 7. Third-Party Library Usage & Optimization

*   **Area:** Impact of libraries like MUI, Swiper, Clerk, and react-icons.
*   **Potential Impact:** Reduced JavaScript bundle sizes, faster load and interaction times.
*   **Rationale:**
    *   **MUI (`@mui/material`):** Can be heavy if not tree-shaken properly or if overly broad imports are used. Ensure correct SSR setup for styles.
    *   **Swiper:** Used for carousels. Large numbers of slides (e.g., from loading all products) can impact performance. Assess its contribution to bundle size and explore its optimization features (lazy loading slides).
    *   **Clerk (`@clerk/nextjs`):** Authentication can add overhead (middleware, client-side scripts, data fetching). Review its configuration and impact.
    *   **react-icons:** Ensure tree-shaking is effective to only include used icons.
    *   **canvas-confetti:** Ensure it's loaded efficiently (e.g., async, on demand) and doesn't block critical rendering.

## 8. JavaScript Bundle Size Analysis

*   **Area:** Overall application JavaScript bundle size.
*   **Potential Impact:** Faster initial page loads, improved parse/compile times for JavaScript.
*   **Rationale:** While `swcMinify: true` is good, a formal analysis (e.g., using `@next/bundle-analyzer` or `source-map-explorer`) is needed to identify specific large modules or chunks that could be optimized, code-split further, or dynamically imported.

## 9. Sanity Backend Considerations

*   **Area:** Sanity schema design and query performance.
*   **Potential Impact:** Faster data retrieval from the CMS.
*   **Rationale:** While queries appear straightforward, ensure that fields frequently used in queries (e.g., `slug.current`, `product._ref` on reviews) are appropriately indexed in the Sanity schema. This is a backend check but impacts frontend performance.

## 10. Code Splitting for Large Components

*   **Area:** Potentially large React components that are not critical for initial view.
*   **Potential Impact:** Reduced initial JavaScript load, faster perceived performance.
*   **Rationale:** Next.js handles page-level code splitting. However, very large components within a page that are not immediately visible (e.g., complex modals, sections further down the page) could be candidates for dynamic import (`next/dynamic`) to defer their loading.

## Supplementary Identification (Phase 1, Part 2)

These targets were identified during the second review pass, building upon the initial findings.

## 11. Clerk Client-Side Performance

*   **Area:** Clerk.js client-side library.
*   **Potential Impact:** Reduced initial bundle size, faster Time to Interactive (TTI).
*   **Rationale:** While `publicRoutes: ['/(.*)']` in `middleware.js` avoids running full auth logic on every page, the Clerk client-side JavaScript is still loaded globally via `ClerkProvider` in `_app.js`. Its bundle size contribution and initialization performance should be evaluated.

## 12. CSS File Size and `backdrop-filter` Overuse

*   **Area:** `styles/globals.css` and widespread use of `backdrop-filter`.
*   **Potential Impact:** Faster page rendering, reduced browser rendering load, smoother animations/scrolling.
*   **Rationale:** `globals.css` is very large (1000+ lines), potentially containing unused or inefficiently organized styles. The extensive use of `backdrop-filter` for glassmorphism effects across many components (`.navbar-container`, `.product-card`, etc.) is known to be resource-intensive and can degrade performance, especially on less powerful devices. Opportunities for pruning/splitting the CSS and selectively applying or finding alternatives for `backdrop-filter` should be explored.

## 13. MUI Server-Side Rendering (SSR) Configuration

*   **Area:** Material-UI style configuration for server-rendered pages.
*   **Potential Impact:** Prevention of style flashing (FOUC - Flash of Unstyled Content) and incorrect styles on initial load.
*   **Rationale:** MUI (used for `SwipeableDrawer` in Cart and potentially other components) typically requires specific SSR setup in `pages/_document.js` and `pages/_app.js` to ensure styles are correctly injected and hydrated. The current `_document.js` is basic and lacks this, which could lead to UX degradation if more MUI components are used or issues are observed.

## 14. Cart Image Optimization

*   **Area:** Images within the `components/Cart.jsx` component.
*   **Potential Impact:** Faster cart rendering, reduced bandwidth if many items are in the cart.
*   **Rationale:** Similar to product display pages and components, images in the cart (`.cart-product-image`) currently use standard `<img>` tags. These should be optimized using `next/image` for better performance, lazy loading, and format negotiation.

## 15. `canvas-confetti` Loading Strategy

*   **Area:** Loading and execution of the `canvas-confetti` library (from `lib/utills.js`).
*   **Potential Impact:** Reduced main bundle size, improved initial load performance if confetti is not needed on all pages.
*   **Rationale:** `canvas-confetti` is listed as a direct dependency and used for success celebrations. To avoid including its code in the main JavaScript bundle unnecessarily, it should be dynamically imported (`next/dynamic` for components or dynamic `import()` for utility functions) only on the pages/components where it's actually used (e.g., the success page).

## 16. Client-Side Data Caching/Revalidation Strategy

*   **Area:** Management of client-side fetched data, particularly after mutations (e.g., review submission).
*   **Potential Impact:** Improved UX with optimistic updates, reduced unnecessary API calls, more robust data synchronization, simplified state management.
*   **Rationale:** Currently, data like reviews are re-fetched manually after submission (e.g., `handleReviewSubmitSuccess` in `ProductDetails.js`). Adopting a dedicated client-side data fetching and caching library like SWR or React Query could provide more sophisticated features like automatic caching, stale-while-revalidate, optimistic updates, and focus revalidation, leading to a more responsive and efficient application.
