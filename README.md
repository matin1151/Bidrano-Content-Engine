# Bidrano Content Engine

Bidrano Studio — Persian-first AI content production workspace.

This version is a prototype. Customers use a local Next.js API; orders and content
still use mock data and browser localStorage.

Customer data is stored in `.bidrano-data/customers.json` and persists across
local server restarts. Keep this directory when updating the application.
This storage supports one local server process, not serverless or multi-instance
deployment. Authentication and a production database are still pending.
Existing browser customers are imported with their original IDs; existing server
records take precedence. The original browser data is retained.

The API contract is in [docs/api-contract.md](docs/api-contract.md).

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Architecture

- `app/` — Next.js App Router
- Dashboard
- Customer Brand Profile
- New Order
- Production Pipeline
- Content Calendar
- Brand Memory

## Important workflow rule

Calendar planning never starts production automatically. An operator explicitly starts production after reviewing the order context.

## Next implementation

1. Real database + Customer Profile persistence
2. Orchestrator and production engines
3. Research / Strategy / Copy / Visual / QA
4. Review and granular regeneration
5. Export package
6. Authentication and deployment
