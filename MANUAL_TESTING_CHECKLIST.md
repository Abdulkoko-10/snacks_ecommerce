# Manual Testing Checklist: Bottom Sheet Cart (Default Paper Styling)

**I. Visibility and Basic Interaction (Default Width Checks):**
    - [ ] **Open Cart (Desktop - Default Behavior):**
        - Action: On a desktop view (e.g., viewport width >= 1024px), click the cart icon/button.
        - Expected: Observe the Drawer's width. **Is it full-width by default, or is it less than full width and/or "stuck to the left"? Document the observed width and positioning.** The Drawer paper itself should be transparent.
    - [ ] **Open Cart (Tablet - Default Behavior):**
        - Action: On a tablet view (e.g., viewport width between 768px and 1023px), click the cart icon/button.
        - Expected: Observe the Drawer's width. **Is it full-width by default? Document the observed width and positioning.** The Drawer paper itself should be transparent.
    - [ ] **Open Cart (Mobile - Default Behavior):**
        - Action: On a mobile view (viewport width < 768px), click the cart icon/button.
        - Expected: The bottom sheet should be full-width by default. The Drawer paper itself should be transparent.
    - [ ] **Close Cart (Backdrop - Desktop & Mobile):**
        - Action: When the bottom sheet is open (test on both desktop and mobile layouts), click on the dimmed area outside the sheet (the backdrop).
        - Expected: The bottom sheet slides down and disappears. `setShowCart(false)` is called.
    - [ ] **Close Cart (Escape Key - Desktop & Mobile):**
        - Action: When the bottom sheet is open (test on both desktop and mobile layouts), press the 'Escape' key.
        - Expected: The bottom sheet slides down and disappears.
    - [ ] **Content Display (Empty Cart - Desktop & Mobile):**
        - Action: Ensure the cart is empty. Open the cart (test on both desktop and mobile layouts).
        - Expected: The "Your shopping bag is empty" message and "Continue Shopping" button are displayed correctly.
    - [ ] **Content Display (With Items - Desktop & Mobile):**
        - Action: Add items to the cart. Open the cart (test on both desktop and mobile layouts).
        - Expected:
            - The "Your Cart ({totalQuantities} items)" heading is visible and correct.
            - Product items are listed correctly.
            - Subtotal is displayed correctly.
            - Buttons are visible.

**II. Cart Functionality (Test on both Desktop and Mobile layouts):**
    - (All previous cart functionality tests remain crucial: Add Item, Increase/Decrease Quantity, Remove Item, Pre-order, Pay with Stripe (Locked))
    - [ ] **Add Item to Cart**
    - [ ] **Increase Item Quantity**
    - [ ] **Decrease Item Quantity**
    - [ ] **Decrease Item Quantity to 1**
    - [ ] **Remove Item from Cart**
    - [ ] **Pre-order Button**
    - [ ] **Pay with Stripe Button (Locked)**

**III. Theming and Styling (Glassmorphism & Readability):**
    - [ ] **Glassmorphism (Light Mode - Desktop & Mobile):**
        - Action: Ensure light mode. Open the cart.
        - Expected: `cart-container` has light theme glassmorphism. Drawer paper is transparent.
    - [ ] **Glassmorphism (Dark Mode - Desktop & Mobile):**
        - Action: Switch to dark mode. Open the cart.
        - Expected: `cart-container` has dark theme glassmorphism. Drawer paper is transparent.
    - [ ] **Glassmorphism (RGB Mode - Desktop & Mobile):**
        - Action: Switch to RGB mode (if applicable). Open the cart.
        - Expected: `cart-container` has RGB theme glassmorphism. Drawer paper is transparent.
    - [ ] **Text Readability over Glassmorphism (All Themes):**
        - Action: In all themes, check text elements inside the cart.
        - Expected: Text remains clearly readable against the glassmorphism background.
    - [ ] **Content Overflow (Desktop & Mobile):**
        - Action: Add enough items to exceed `maxHeight` (`70vh`).
        - Expected: Vertical scrollbar in `cart-container`. Scrolling is smooth.
    - [ ] **General Aesthetics (All Themes - Desktop & Mobile):**
        - Action: Visually inspect the bottom sheet.
        - Expected: Spacing, alignment, font sizes, border radius on top corners are pleasing.

**IV. Responsiveness (Default Width Behavior):**
    - [ ] **Desktop (various widths - Default Behavior):**
        - Action: Resize browser on desktop across various widths (e.g., 1024px, 1280px, 1920px). Open the cart.
        - Expected: **Observe and document the Drawer's width and positioning. Is it consistently full-width, or does it exhibit the "stuck to the left" behavior at any desktop size?**
    - [ ] **Transition between Screen Sizes (Default Behavior):**
        - Action: Open the cart. Resize the browser window across mobile, tablet, and desktop widths.
        - Expected: **Observe and document how the Drawer's width behaves during transitions. Does it smoothly adapt or show unexpected width/positioning issues?**
    - [ ] **Mobile View (various small screens):**
        - Action: Use developer tools for various mobile views. Open the cart.
        - Expected: The bottom sheet is full-width. Content is usable. No horizontal overflow.
    - [ ] **Tablet View (Default Behavior):**
        - Action: Switch to a tablet view. Open the cart.
        - Expected: **Observe and document the Drawer's width. Is it full-width or does it show issues?**

The primary goal of this testing round is to clearly determine the MUI Drawer's default width and positioning behavior with `anchor="bottom"` and minimal styling, specifically to understand if the "stuck to the left on desktop" issue is inherent to its default state or caused by other styles.


## Pre-Order System Testing

**Setup:**
- Ensure environment variables are correctly set up for Sanity (read/write tokens), Clerk, and Email (SMTP/service provider).
- Ensure test products are available in Sanity.
- Have a test user account in Clerk.
- Have access to the admin email inbox and test user email inbox.
- Sanity Studio should be running or accessible to verify pre-order document creation.

**Test Cases:**

**I. Cart and Pre-Order Initiation:**
1.  **[ ] User Not Signed In:**
    *   Add item(s) to cart.
    *   Open cart.
    *   Verify "Sign In to Pre-order" button is visible.
    *   Click "Sign In to Pre-order".
    *   Verify Clerk sign-in modal appears.
    *   Complete sign-in.
    *   Verify cart still contains items and now shows "Pre-order Now" button.
2.  **[ ] User Signed In, Cart Empty:**
    *   Ensure user is signed in.
    *   Navigate to cart (it should be empty or clear it).
    *   Verify "Your shopping bag is empty" message.
    *   Verify "Pre-order Now" button is NOT visible or is disabled if cart is empty.
3.  **[ ] User Signed In, Cart Has Items:**
    *   Ensure user is signed in.
    *   Add item(s) to cart.
    *   Open cart.
    *   Verify "Pre-order Now" button is visible and enabled.
    *   Click "Pre-order Now".
    *   Verify user is navigated to the `/pre-order` page.
    *   Verify cart drawer closes.

**II. Pre-Order Page (`/pre-order`):**
1.  **[ ] Display and Content:**
    *   Verify page title "Confirm Your Pre-Order" (or similar).
    *   Verify all items from cart are listed correctly with names, quantities, images, and correct subtotal per item.
    *   Verify overall subtotal and total quantity are correct.
    *   Verify "Confirm Pre-Order & Notify Me" button is visible and enabled.
    *   Verify responsiveness across different screen sizes (desktop, tablet, mobile).
    *   Verify design integration (liquid glass, theme modes).
2.  **[ ] Direct Navigation Attempts:**
    *   **[ ] Logged In, Empty Cart:** Try navigating directly to `/pre-order`. Verify user is redirected (e.g., to home) and an appropriate message (toast) is shown.
    *   **[ ] Not Logged In:** Try navigating directly to `/pre-order`. Verify user is redirected (e.g., to sign-in or home) and an appropriate message is shown.

**III. Pre-Order Submission and Confirmation:**
1.  **[ ] Successful Submission:**
    *   On the `/pre-order` page (with items and user logged in), click "Confirm Pre-Order & Notify Me".
    *   Verify loading state/toast appears ("Processing your pre-order...").
    *   Verify success toast appears ("Pre-order placed successfully!").
    *   Verify user is redirected to the success page (e.g., `/success?pre-order=true`).
    *   Verify the success page shows an appropriate confirmation message.
2.  **[ ] Cart Cleared:**
    *   After successful redirection to success page, navigate back to the shop or open the cart.
    *   Verify the cart is now empty.
3.  **[ ] User Confirmation Email:**
    *   Check the test user's email inbox.
    *   Verify a pre-order confirmation email is received.
    *   Verify email content: correct user name, pre-order ID, item details (name, quantity, price), total price, professional formatting.
4.  **[ ] Admin Confirmation Email:**
    *   Check the admin's email inbox.
    *   Verify an admin notification email is received.
    *   Verify email content: indication of a new pre-order, user details (ID, name, email), item details, total price, and a working link to the Sanity document.
5.  **[ ] Sanity Data Verification:**
    *   Open Sanity Studio.
    *   Navigate to the "Pre-Order" documents.
    *   Verify a new pre-order document exists with the correct details:
        *   `userId`, `userName`
        *   `cartItems` (product IDs, names, quantities, prices)
        *   `totalPrice`
        *   `status` set to "pending"
        *   `createdAt` timestamp.
6.  **[ ] API Failure Simulation (if possible/safe to test):**
    *   If `createPreOrder` API fails (e.g., Sanity write error, misconfiguration):
        *   Verify an error toast is shown on the `/pre-order` page.
        *   Verify user is not redirected.
        *   Verify cart is not cleared.
        *   Verify no confirmation emails are sent.

**IV. Edge Cases/Negative Tests:**
1.  **[ ] Clicking "Confirm Pre-Order" multiple times quickly:**
    *   Verify the button is disabled on first click to prevent multiple submissions.
2.  **[ ] Network interruption during submission:**
    *   (Difficult to simulate manually, but observe behavior if it occurs). Verify graceful failure or clear feedback.
3.  **[ ] Products with unusual names/details:**
    *   Test with products having special characters or very long names to ensure display is correct in cart, pre-order page, and emails.
