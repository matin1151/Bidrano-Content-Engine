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
Automatic browser-data import requires the same browser origin (hostname and
port) as the previous version. Changing ports creates a separate browser store.

The API contract is in [docs/api-contract.md](docs/api-contract.md).
The source review and confirmed fixes are in [docs/code-review.md](docs/code-review.md).

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Run commands from the directory containing `package.json`. In Windows PowerShell,
use `npm.cmd` instead of `npm` if script execution is disabled.

## Checks

```bash
npm run typecheck
npm test
```

Regression checks use an isolated temporary directory and do not modify the
application's customer database.

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

## Reel Studio (local integration preview)

`/reels` adds independently selectable image/video AI providers, reference-image
optimization, scene generation and optional FFmpeg vertical MP4 composition.
Disabled by default; real keys, provider billing limits and an installed FFmpeg
are required. The first export is silent; narration/captions and automatic
storyboarding are not implemented. See [setup and limitations](docs/reel-studio.md).

## Remaining implementation

1. Real database + Customer Profile persistence
2. Orchestrator and production engines
3. Research / Strategy / Copy / Visual / QA
4. Review and granular regeneration
5. Export package
6. Authentication and deployment
