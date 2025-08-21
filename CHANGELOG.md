# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **Reviews Not Displaying:** Resolved an issue where approved reviews were not visible on the frontend. This was caused by the Sanity CDN serving stale data. The fix involves using a dedicated `previewClient` that bypasses the CDN, ensuring that the latest review and product data is always fetched.
- **Support for Private Datasets:** Updated the Sanity client configuration to use the `NEXT_PUBLIC_SANITY_TOKEN` environment variable for all read operations. This allows the application to fetch data from private Sanity datasets.
- **Clarified Environment Variables:** Identified that the required `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` environment variables were missing.

### Notes
- The final resolution of the reviews issue required configuring the Sanity project settings correctly. This included:
    1.  Ensuring the `NEXT_PUBLIC_SANITY_TOKEN` was valid and had "read" permissions.
    2.  Adding the website's URL to the "CORS origins" list in the Sanity project API settings.
