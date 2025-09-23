import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:3000")
        await page.get_by_role("textbox").click()
        await page.get_by_role("textbox").fill("pizza")
        await page.get_by_role("button", name="Search").click()

        # Wait for the carousel to be visible
        carousel = page.locator(".recommendation-swiper")
        await expect(carousel).to_be_visible()

        # Scroll down to the carousel
        await carousel.scroll_into_view_if_needed()

        # Add a small delay to ensure all images are loaded
        await asyncio.sleep(2)

        await page.screenshot(path="jules-scratch/verification/verification.png")
        await browser.close()

asyncio.run(main())
