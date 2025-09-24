This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started: Food Discovery Platform

This project has been refactored into a multi-service architecture. To run the full platform in a development environment, you will need to run **three** separate services in **three** different terminal windows.

### Prerequisites

1.  **Install Dependencies:** Before running any service, make sure you have installed the necessary dependencies in both the root directory (for the frontend) and in each service's directory.
    ```bash
    # Install root dependencies (for Next.js frontend)
    npm install

    # Install orchestrator dependencies
    cd orchestrator && npm install && cd ..

    # Install connector dependencies
    cd connectors/google-places-connector && npm install && cd ../..
    ```
2.  **Environment Variables:** Create a `.env.development` file in the root directory. This file is used by the Next.js frontend.
    ```
    NEXT_PUBLIC_ORCHESTRATOR_URL=http://localhost:3001/api/v1
    ```

### Running the Development Environment

Open three separate terminal tabs or windows and run the following commands, one in each terminal.

**Terminal 1: Start the Orchestrator**
The orchestrator is the central service that manages data flow.

```bash
cd orchestrator
npm run dev
```
*This will start the orchestrator service, typically on port 3001.*

---

**Terminal 2: Start the Frontend**
This is the Next.js user interface.

```bash
# Make sure you are in the root directory
npm run dev
```
*This will start the frontend, typically on port 3000.*

---

**Terminal 3: Run the Connector (to provide data)**
The connector fetches data from providers and sends it to the orchestrator. Since the orchestrator's data store is currently in-memory, you need to run the connector at least once *after* starting the orchestrator to populate it with data.

```bash
cd connectors/google-places-connector
npm start
```
*This script will run, send its mock data to the orchestrator, and then exit. You should see success messages in both this terminal and the orchestrator's terminal.*

### Viewing the Application

Once all services are running, open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The homepage should now display products fetched from the orchestrator.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
