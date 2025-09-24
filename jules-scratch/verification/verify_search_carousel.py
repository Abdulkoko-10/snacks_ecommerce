from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        verify_search_carousel(page)
    finally:
        browser.close()

def verify_search_carousel(page: Page):
    """
    This test verifies that a user can perform a search on the homepage
    and that the results are displayed in a carousel.
    """
    # 1. Arrange: Go to the homepage.
    page.goto("http://localhost:3000")

    # 2. Act: Find the search input, fill it, and click the search button.
    search_input = page.get_by_placeholder("e.g., 'pizza in new york'")
    expect(search_input).to_be_visible()
    search_input.fill("cafe")

    search_button = page.get_by_role("button", name="Search")
    search_button.click()

    # 3. Assert: Confirm that the carousel is visible.
    # We expect the carousel to be visible after the search is complete.
    carousel = page.locator(".recommendation-swiper")
    expect(carousel).to_be_visible(timeout=10000) # Increased timeout

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)