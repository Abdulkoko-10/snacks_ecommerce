# Manual Testing Checklist: Bottom Sheet Cart (Full Width Verified)

**I. Visibility and Basic Interaction:**
    - [ ] **Open Cart (Desktop - True Full Width):**
        - Action: On a desktop view (e.g., viewport width >= 1024px), click the cart icon/button.
        - Expected: The bottom sheet slides up from the bottom, **spanning the entire viewport width from left to right**. The Drawer paper itself is transparent.
    - [ ] **Open Cart (Tablet - Full Width):**
        - Action: On a tablet view (e.g., viewport width between 768px and 1023px), click the cart icon/button.
        - Expected: The bottom sheet slides up from the bottom, spanning the full width of the screen. The Drawer paper itself is transparent.
    - [ ] **Open Cart (Mobile - Full Width):**
        - Action: On a mobile view (viewport width < 768px), click the cart icon/button.
        - Expected: The bottom sheet slides up from the bottom, occupying the full width of the screen. The Drawer paper itself is transparent.
    - [ ] **Close Cart (Backdrop - Desktop & Mobile):**
        - Action: When the bottom sheet is open (test on both desktop and mobile layouts), click on the dimmed area outside the sheet (the backdrop).
        - Expected: The bottom sheet slides down and disappears. `setShowCart(false)` is called.
    - [ ] **Close Cart (Escape Key - Desktop & Mobile):**
        - Action: When the bottom sheet is open (test on both desktop and mobile layouts), press the 'Escape' key.
        - Expected: The bottom sheet slides down and disappears.
    - [ ] **Content Display (Empty Cart - Desktop & Mobile):**
        - Action: Ensure the cart is empty. Open the cart (test on both desktop and mobile layouts).
        - Expected: The "Your shopping bag is empty" message and "Continue Shopping" button are displayed correctly within the bottom sheet.
    - [ ] **Content Display (With Items - Desktop & Mobile):**
        - Action: Add items to the cart. Open the cart (test on both desktop and mobile layouts).
        - Expected:
            - The "Your Cart ({totalQuantities} items)" heading is visible and correct.
            - Product items are listed correctly (image, name, price, quantity controls, remove button).
            - Subtotal is displayed correctly.
            - "Pre-order Now" and "Pay with Stripe" buttons are visible.

**II. Cart Functionality (Test on both Desktop and Mobile layouts):**
    - [ ] **Add Item to Cart:**
        - Action: From a product page, add an item to the cart. Open the cart.
        - Expected: The item appears in the bottom sheet with correct details and quantity. Totals update.
    - [ ] **Increase Item Quantity:**
        - Action: In the cart, click the '+' button for an item.
        - Expected: Item quantity increases. Subtotal and total quantity update.
    - [ ] **Decrease Item Quantity:**
        - Action: In the cart, click the '-' button for an item (ensure quantity > 1).
        - Expected: Item quantity decreases. Subtotal and total quantity update.
    - [ ] **Decrease Item Quantity to 1:**
        - Action: In the cart, for an item with quantity > 1, click '-' until quantity is 1.
        - Expected: Item quantity is 1. Further clicks on '-' should not take quantity below 1 (or button becomes disabled if implemented).
    - [ ] **Remove Item from Cart:**
        - Action: In the cart, click the 'remove item' (TiDeleteOutline) button for an item.
        - Expected: Item is removed from the cart. Subtotal and total quantity update. If it's the last item, the empty cart view should appear.
    - [ ] **Pre-order Button:**
        - Action: Click the "Pre-order Now" button.
        - Expected: Toast message "Your pre-order has been placed successfully!" appears. Cart is cleared. Sheet closes.
    - [ ] **Pay with Stripe Button (Locked):**
        - Action: Click the "Pay with Stripe" button.
        - Expected: Toast message "Payment processing is coming soon!" appears. User is not redirected.

**III. Theming and Styling:**
    - [ ] **Glassmorphism (Light Mode - Desktop & Mobile):**
        - Action: Ensure the application is in light mode. Open the cart (test on both desktop and mobile layouts).
        - Expected: The `cart-container` (content area) has the `glassmorphism` effect (semi-transparent background, blur, themed border) as defined by `--glass-background-light`, etc. The `Drawer` paper itself is transparent, allowing this effect to show.
    - [ ] **Glassmorphism (Dark Mode - Desktop & Mobile):**
        - Action: Switch the application to dark mode. Open the cart (test on both desktop and mobile layouts).
        - Expected: The `cart-container` correctly uses dark theme glassmorphism variables (`--glass-background-dark`, etc.). The `Drawer` paper is transparent.
    - [ ] **Glassmorphism (RGB Mode - Desktop & Mobile):**
        - Action: Switch the application to RGB mode (if applicable). Open the cart (test on both desktop and mobile layouts).
        - Expected: The `cart-container` correctly uses RGB theme glassmorphism variables. The `Drawer` paper is transparent.
    - [ ] **Text Readability over Glassmorphism (All Themes):**
        - Action: In all themes, check text elements (item names, prices, totals, buttons, headings) inside the cart.
        - Expected: Text remains clearly readable against the glassmorphism background. `var(--text-color)` should ensure this.
    - [ ] **Content Overflow (Desktop & Mobile):**
        - Action: Add enough items to the cart so that the content exceeds the `maxHeight` of the `cart-container` (`70vh`).
        - Expected: A vertical scrollbar appears within the content area of the bottom sheet. The "Your Cart" heading and the cart bottom (subtotal/buttons) should ideally remain visible or behave gracefully with scrolling. Verify scrolling is smooth.
    - [ ] **General Aesthetics (All Themes - Desktop & Mobile):**
        - Action: Visually inspect the bottom sheet in all themes and layouts.
        - Expected: Spacing, alignment, font sizes, and overall appearance are aesthetically pleasing and consistent with the application's design. The added border radius on the top corners of the sheet is visible.

**IV. Responsiveness:**
    - [ ] **Desktop (various widths - True Full Width):**
        - Action: Resize browser on desktop across various widths (e.g., 1024px, 1280px, 1920px). Open the cart.
        - Expected: Sheet is consistently full-width, edge-to-edge, and not "stuck to the left".
    - [ ] **Transition between Screen Sizes (Consistent Full Width):**
        - Action: Open the cart. Resize the browser window across mobile, tablet, and desktop widths.
        - Expected: The cart sheet remains consistently full-width.
    - [ ] **Mobile View (various small screens):**
        - Action: Using browser developer tools, switch to various small screen/mobile views (e.g., iPhone SE, iPhone X, Galaxy S5). Open the cart.
        - Expected: The bottom sheet is full-width. Content is readable and usable. No horizontal overflow. Buttons are easily tappable.
    - [ ] **Tablet View (Full Width):**
        - Action: Switch to a tablet view (e.g., iPad, Nexus 7). Open the cart.
        - Expected: The bottom sheet is full-width and adapts appropriately.
