# Bidrano Content Engine

Bidrano Studio — Persian-first AI content production workspace.

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
