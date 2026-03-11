# DevFlow — AI-Powered Project Management SaaS

A full-stack SaaS application for team project management with Claude AI integration for task summaries and project reports.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (REST) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (Google + GitHub OAuth) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Payments | Stripe (subscriptions) |
| Infra | Docker, GitHub Actions CI/CD |

## Features

- **Multi-tenant Workspaces** — teams with Owner/Admin/Member roles
- **Project & Task Management** — priorities, due dates, assignments
- **AI Task Summaries** — Claude AI reads comments and generates status summaries
- **AI Project Reports** — full health report with blockers and recommendations
- **Subscription Plans** — Free (3 projects) and Pro ($12/mo, unlimited) via Stripe
- **Activity Feed** — audit log of all team actions
- **GitHub + Google OAuth** — social login via NextAuth.js

## Architecture

```
src/
├── app/
│   ├── (auth)/login/          # Login page (OAuth)
│   ├── (dashboard)/           # Protected routes with sidebar layout
│   │   └── dashboard/         # Main dashboard
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth handler
│       ├── workspaces/        # Workspace CRUD
│       ├── projects/          # Project CRUD
│       ├── tasks/             # Task CRUD + [taskId] patch/delete
│       ├── ai/summarize/      # Claude AI task summary
│       ├── ai/report/         # Claude AI project report
│       └── stripe/            # Checkout + webhook
├── lib/
│   ├── db.ts                  # Prisma client (singleton)
│   ├── auth.ts                # NextAuth config
│   ├── ai.ts                  # Anthropic SDK wrapper
│   ├── stripe.ts              # Stripe client + plan config
│   └── utils.ts               # Helpers (cn, slugify, formatDate)
└── prisma/schema.prisma        # Full DB schema
```

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/devflow.git
cd devflow
npm install
```

### 2. Start the database

```bash
docker-compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET,
#          ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```

### 4. Run migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workspaces` | List user's workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/projects?workspaceId=` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/tasks?projectId=` | List tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task status/fields |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/ai/summarize` | Generate AI task summary |
| POST | `/api/ai/report` | Generate AI project report |
| POST | `/api/stripe/checkout` | Create Stripe checkout session |
| POST | `/api/stripe/webhook` | Handle Stripe events |

## Database Schema

Core models: `User`, `Workspace`, `WorkspaceMember`, `Project`, `Task`, `Comment`, `AiSummary`, `Activity`

Run `npx prisma studio` to browse data visually.

## Deployment

```bash
# Build Docker image
docker build -t devflow .

# Or deploy to Vercel
vercel --prod
```

CI/CD runs on every push via GitHub Actions (lint → typecheck → test → build).

---

Built with Next.js, Prisma, Claude AI, and Stripe.
