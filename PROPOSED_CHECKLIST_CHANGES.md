### Proposed Additions/Modifications for MANUAL_TESTING_CHECKLIST.md

**Option 1: Add as a new dedicated section at the beginning of "User Interface & Experience (UI/UX)"**

```markdown
### Re-testing Sign-In Functionality (High Priority)

*   **[ ] Navbar - "Sign In" Button (from Ellipsis/Theme Menu):**
    *   [ ] Locate and click the "Sign In" option within the Navbar's ellipsis or theme dropdown menu.
    *   [ ] **Expected:** Clerk.js sign-in modal appears promptly.
    *   [ ] **Clerk Modal Theming:** Verify the modal's styling (background, text colors, input fields, buttons) is consistent with the site theme, reflecting the `clerkAppearance` settings from `pages/_app.js`.
    *   [ ] **Sign-In Flow:** Complete the sign-in process using valid test user credentials.
    *   [ ] **Post Sign-In (Navbar):**
        *   [ ] Verify the "Sign In" option in the menu is replaced by user-specific options or a `UserButton`.
        *   [ ] If `UserButton` is present, verify it displays correctly and is functional.
*   **[ ] Cart - "Sign In to Pre-order" Button:**
    *   [ ] Add at least one item to the cart to make the cart relevant.
    *   [ ] Open the cart.
    *   [ ] Verify the "Sign In to Pre-order" button is visible.
    *   [ ] Click the "Sign In to Pre-order" button.
    *   [ ] **Expected:** Clerk.js sign-in modal appears promptly.
    *   [ ] **Clerk Modal Theming:** (If not already checked above, or re-verify) Verify the modal's styling is consistent with the site theme.
    *   [ ] **Sign-In Flow:** Complete the sign-in process (if not already signed in from the navbar test). If already signed in, this button might change to "Pre-order Now" immediately or after a page refresh/cart update. Note this behavior.
    *   [ ] **Post Sign-In (Cart):**
        *   [ ] Verify the "Sign In to Pre-order" button changes to "Pre-order Now".
        *   [ ] Verify the user's session is recognized (e.g., user information is available to the `handlePreOrder` function, though this is harder to see directly without dev tools).
*   **[ ] General Post Sign-In State:**
    *   [ ] Navigate to different pages and refresh the page.
    *   [ ] **Expected:** User remains signed in. Navbar shows authenticated state (e.g., `UserButton`). Cart continues to show "Pre-order Now" if items are present.
*   **[ ] Sign-Out Flow (if testing sign-in again):**
    *   [ ] If a `UserButton` or sign-out option is available, test the sign-out flow.
    *   [ ] **Expected:** User is signed out. Navbar reverts to "Sign In" state. Cart reverts to "Sign In to Pre-order" button.

```

**Option 2: Integrate into existing checklist sections**

1.  **Under "User Interface & Experience (UI/UX)" -> "Cart - Not Signed In":**
    *   Modify/Add:
        *   `[ ] Verify "Sign In to Pre-order" button is visible.`
        *   `[ ] Click button: Clerk.js sign-in modal should appear **promptly**.`
        *   `[ ] Clerk modal: Test sign-in and sign-up flows.`
        *   `[ ] **Clerk Modal Theming:** Verify the modal's styling (background, text colors, input fields, buttons) is consistent with the site theme, reflecting the `clerkAppearance` settings from `pages/_app.js`.`

2.  **Under "User Interface & Experience (UI/UX)" -> "Cart - Signed In":**
    *   Add/Modify:
        *   `[ ] After successful sign-in (either via Navbar or Cart button), verify "Sign In to Pre-order" button changes to "Pre-order Now".`

3.  **Consider adding a new subsection under "User Interface & Experience (UI/UX)" for Navbar specific tests if it doesn't exist:**
    ```markdown
    *   **[ ] Navbar - User Authentication:**
        *   [ ] **Not Signed In:** Locate and click the "Sign In" option within the Navbar's ellipsis or theme dropdown menu.
        *   [ ] **Expected:** Clerk.js sign-in modal appears promptly.
        *   [ ] **Clerk Modal Theming (Navbar initiated):** Verify modal styling consistency.
        *   [ ] Complete sign-in flow.
        *   [ ] **Post Sign-In (Navbar):** Verify "Sign In" option updates to `UserButton` or authenticated state.
    ```

---
### Additional Testing Scenarios (Incorporating RGB Theme and Specific Sign-In Interactions)

**1. RGB Theme Robustness Testing:**

*   **[ ] Activate RGB Theme Mode:**
    *   [ ] From the theme selection menu, switch to "RGB Mode".
    *   [ ] **Expected:** UI elements (backgrounds, text, buttons, glass effects) should update to reflect the initial RGB theme settings.
*   **[ ] RGB Color Picker Interaction:**
    *   [ ] Locate and use the RGB color picker (usually near the theme switcher).
    *   [ ] Select several different valid colors.
    *   [ ] **Expected:** For each color selection, the UI should dynamically update to reflect the chosen RGB values across themed elements.
    *   [ ] **Console Check:** Monitor the browser's developer console for any errors during theme switching or color picking.
*   **[ ] RGB Theme - Invalid LocalStorage Value (Advanced/Edge Case):**
    *   [ ] Ensure RGB mode is currently active or can be activated upon reload.
    *   [ ] Open browser developer tools and go to `Application` -> `Local Storage`.
    *   [ ] Manually change the value associated with the `rgbColor` key (or similarly named key responsible for storing the selected RGB color) to an invalid value (e.g., an empty string `""`, a malformed hex like `"#12"`, or a word like `"invalid"`).
    *   [ ] Reload the page. If RGB mode isn't active by default, switch to it.
    *   [ ] **Expected:**
        *   [ ] The site should not crash or become unusable.
        *   [ ] Ideally, the site should fall back to a default color (either the default light/dark theme, or a default within the RGB mode).
        *   [ ] Check the console for any errors related to theme processing or color parsing. Note any unhandled exceptions.
*   **[ ] Post-RGB Theme Tests - Sign-In Button Functionality:**
    *   [ ] After performing the RGB theme tests (including the invalid value test and restoring to a valid RGB color):
        *   [ ] Verify the "Sign In" button in the Navbar's ellipsis menu is still visible (if signed out) and functional (opens Clerk modal).
        *   [ ] Add an item to the cart and verify the "Sign In to Pre-order" button in the Cart is still visible (if signed out) and functional (opens Clerk modal).

**2. Navbar `SignInButton` (Ellipsis Menu) - Detailed Interaction Test:**

*   **[ ] Pre-condition:** Ensure the user is signed out.
*   **[ ] Open Ellipsis Menu & Trigger Sign-In:**
    *   [ ] Click the ellipsis icon in the Navbar to open the theme/options menu.
    *   [ ] Within the opened menu, click the "Sign In" option.
    *   [ ] **Expected (Clerk Modal):** The Clerk sign-in modal should open promptly.
    *   [ ] **Expected (Ellipsis Menu Behavior):**
        *   Observe if the ellipsis menu closes automatically when the Clerk modal opens.
        *   If it does not close automatically, it should remain interactive or close when focus moves to the modal or a click occurs outside the menu.
*   **[ ] Interact with Clerk Modal & Ellipsis Menu Closure:**
    *   [ ] **Scenario A: Sign In Successfully**
        *   [ ] Complete the sign-in process via the modal.
        *   [ ] **Expected:** After successful sign-in, the Clerk modal should close. The ellipsis menu (if it was still open) should now reflect the authenticated state (e.g., "Sign In" changes to "Sign Out" or UserButton appears) or close.
    *   [ ] **Scenario B: Close Clerk Modal Manually**
        *   [ ] If not signing in, manually close the Clerk modal (e.g., by clicking its close button or pressing Esc).
        *   [ ] **Expected:** The ellipsis menu (if it was still open) should allow further interaction or close upon clicking outside of it. It should not be stuck or cause UI freezes.
*   **[ ] Verify No UI Freezes or Overlap Issues:**
    *   [ ] Ensure there are no issues with the ellipsis menu and Clerk modal overlapping in a way that makes either unusable.

**3. Cart `SignInButton` - Re-verification (Post Other Tests):**

*   **[ ] Pre-condition:** Ensure the user is signed out. Add an item to the cart.
*   **[ ] Open Cart & Trigger Sign-In:**
    *   [ ] Open the cart view.
    *   [ ] Click the "Sign In to Pre-order" button.
    *   [ ] **Expected:** The Clerk sign-in modal should open reliably and without any errors.
    *   [ ] (Optional) Perform a quick sign-in and ensure the cart state updates to allow pre-ordering.
