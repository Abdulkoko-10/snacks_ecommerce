from playwright.sync_api import sync_playwright, Page, expect

def verify_new_styles(page: Page):
    """
    This script verifies the new styling for the search controls and result cards.
    """
    # 1. Navigate to the homepage and wait for it to load.
    page.goto("http://localhost:3000/", timeout=60000) # 60 second timeout for initial load

    # Wait for a stable element like the footer to ensure the page is ready.
    footer = page.locator("footer")
    expect(footer).to_be_visible(timeout=15000) # Increased timeout to 15 seconds

    # 2. Find the search input and button and perform a search.
    # Use get_by_placeholder for the input and get_by_role for the button.
    search_input = page.get_by_placeholder("e.g., 'pizza in new york'")
    search_button = page.get_by_role("button", name="Search")

    # Expect the controls to be visible before interacting
    expect(search_input).to_be_visible()
    expect(search_button).to_be_visible()

    search_input.fill("sushi")
    search_button.click()

    # 3. Wait for the results to appear.
    # We can wait for the first result card to be rendered.
    # The card is a div with a h3 inside it containing the restaurant name.
    # We will wait for our mock restaurant name to appear.
    first_result = page.locator('h3:text("The Mock Pizzeria (Next.js API)")')
    expect(first_result).to_be_visible(timeout=10000) # 10 second timeout

    # 4. Take a screenshot of the entire page.
    page.screenshot(path="jules-scratch/verification/styling_verification.png")

# Boilerplate to run the verification
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_new_styles(page)
        browser.close()
