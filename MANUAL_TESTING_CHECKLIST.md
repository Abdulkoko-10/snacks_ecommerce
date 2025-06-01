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
