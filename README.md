This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Environment Variables

This project requires certain environment variables to be set up for full functionality. These include keys for services like Sanity (for content management), Stripe (for payments), and Clerk (for authentication).

1.  **Copy the example file**:
    Create a new file named `.env.local` in the root of your project by copying the existing `.env.example` file:
    ```bash
    cp .env.example .env.local
    ```
2.  **Fill in the values**:
    Open `.env.local` and replace the placeholder values with your actual API keys and configuration details for each service.

### Clerk Authentication Setup

To enable user authentication features, you'll need to configure Clerk:

1.  **Create a Clerk Account**: If you don't have one, sign up at [https://clerk.com](https://clerk.com).
2.  **Create a Clerk Application**: In your Clerk dashboard, create a new application for this project.
3.  **Find API Keys**: Navigate to the API Keys section in your Clerk application settings. You will need the "Publishable key" and the "Secret key".
4.  **Update `.env.local`**:
    Add these keys to your `.env.local` file:
    ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key_here"
    CLERK_SECRET_KEY="your_clerk_secret_key_here"
    ```
    *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is used on the frontend.
    *   `CLERK_SECRET_KEY` is used on the backend for server-side authentication.

Make sure to keep your secret keys confidential and do not commit `.env.local` to your repository.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
