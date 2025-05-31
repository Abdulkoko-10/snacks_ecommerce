# Manual Testing Checklist: Bottom Sheet Cart

**I. Visibility and Basic Interaction:**
    - [ ] **Open Cart:**
        - Action: Click the cart icon/button that triggers `setShowCart(true)`.
        - Expected: The bottom sheet slides up from the bottom of the screen.
    - [ ] **Close Cart (Backdrop):**
        - Action: When the bottom sheet is open, click on the dimmed area outside the sheet (the backdrop).
        - Expected: The bottom sheet slides down and disappears. `setShowCart(false)` is called.
    - [ ] **Close Cart (Escape Key):**
        - Action: When the bottom sheet is open, press the 'Escape' key.
        - Expected: The bottom sheet slides down and disappears.
    - [ ] **Content Display (Empty Cart):**
        - Action: Ensure the cart is empty. Open the cart.
        - Expected: The "Your shopping bag is empty" message and "Continue Shopping" button are displayed correctly within the bottom sheet.
    - [ ] **Content Display (With Items):**
        - Action: Add items to the cart. Open the cart.
        - Expected:
            - The re-added "Your Cart ({totalQuantities} items)" heading is visible and correct.
            - Product items are listed correctly (image, name, price, quantity controls, remove button).
            - Subtotal is displayed correctly.
            - "Pre-order Now" and "Pay with Stripe" buttons are visible.

**II. Cart Functionality:**
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
        - Expected: Item quantity is 1. Further clicks on '-' (if not disabled) should not take quantity below 1.
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
    - [ ] **Light Mode:**
        - Action: Ensure the application is in light mode. Open the cart.
        - Expected: The bottom sheet background, text colors, button colors, and other elements use the light theme variables as defined in `globals.css` and applied in `Cart.jsx`.
    - [ ] **Dark Mode:**
        - Action: Switch the application to dark mode. Open the cart.
        - Expected: The bottom sheet background, text colors, button colors, and other elements correctly switch to use the dark theme variables.
    - [ ] **RGB Mode (if applicable):**
        - Action: Switch the application to RGB mode. Open the cart.
        - Expected: The bottom sheet elements adapt to the RGB theme variables.
    - [ ] **Content Overflow:**
        - Action: Add enough items to the cart so that the content exceeds the `maxHeight` of the `cart-container` (`70vh`).
        - Expected: A vertical scrollbar appears within the content area of the bottom sheet, and the header/footer of the sheet remain fixed. Scrolling works smoothly.
    - [ ] **General Aesthetics:**
        - Action: Visually inspect the bottom sheet in all themes.
        - Expected: Spacing, alignment, font sizes, and overall appearance are aesthetically pleasing and consistent with the application's design. The added border radius on the top corners is visible.

**IV. Responsiveness:**
    - [ ] **Mobile View:**
        - Action: Using browser developer tools, switch to a small screen/mobile view (e.g., iPhone X, Galaxy S5). Open the cart.
        - Expected: The bottom sheet takes an appropriate width and height for mobile. Content is readable and usable. No horizontal overflow. Buttons are easily tappable.
    - [ ] **Tablet View:**
        - Action: Switch to a tablet view (e.g., iPad). Open the cart.
        - Expected: The bottom sheet adapts appropriately to the tablet screen size.
    - [ ] **Desktop View (various widths):**
        - Action: Resize the browser window on a desktop. Open the cart.
        - Expected: The bottom sheet remains anchored to the bottom and behaves consistently.
