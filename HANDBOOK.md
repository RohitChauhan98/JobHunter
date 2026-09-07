# JobHunter Handbook

A practical guide to understanding this project — what it does, how the pieces fit together, and where to look when you need to change something.

For setup commands, see [README.md](./README.md).  
For the original product vision and long-form design notes, see [PROJECT_SPECIFICATION.md](./PROJECT_SPECIFICATION.md).  
For end-user setup (install extension, configure AI, use shortcuts), see the in-app guide at `/guide`.

---

## 1. What is JobHunter?

JobHunter helps candidates apply to jobs faster by:

1. **Storing a reusable profile** (personal info, experience, education, skills, Q&A)
2. **Auto-filling application forms** in the browser on supported ATS platforms
3. **Generating AI answers** tailored to the job and the user’s profile
4. **Tracking applications** from draft → submitted → interview → offer

It is a **semi-automated** assistant: the user still reviews and submits forms. Full auto-submit is on the roadmap, not current behavior.

---

## 2. The three packages

| Package | Path | Role | Default URL |
|---------|------|------|-------------|
| **Backend** | `backend/` | Auth, profile, applications, AI orchestration | `http://localhost:4000` |
| **Web** | `web/` | Marketing site + logged-in dashboard | `http://localhost:3000` |
| **Extension** | `extension/` | Chrome MV3 extension that fills forms on job sites | Loaded from `extension/dist` |

Root `package.json` is a thin workspace: scripts like `dev:backend`, `dev:web`, `dev:extension`, and `db:*` delegate into each package.

```
┌─────────────────────┐       ┌─────────────────────┐
│  Chrome Extension   │       │   Web (Next.js)     │
│  popup / content /  │       │  marketing + dash   │
│  options            │       │                     │
└──────────┬──────────┘       └──────────┬──────────┘
           │  JWT + REST                 │  JWT + REST
           └──────────────┬──────────────┘
                          ▼
                 ┌─────────────────┐
                 │  Express API    │
                 │  + Prisma       │
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │  PostgreSQL     │
                 │  (e.g. Neon)    │
                 └─────────────────┘
```

Both clients talk to the same API. CORS allows `CORS_ORIGIN` (web) and `chrome-extension://` origins.

---

## 3. Mental model: how a fill works

Typical path when a user opens a Greenhouse/Lever/etc. application page:

1. **Content script** injects on matching host permissions.
2. **AdapterRegistry** picks a platform adapter (Greenhouse → Lever → Workday → Ashby → Generic).
3. Adapter **detects fields** and optional **job details** (title, company, description).
4. Detection is sent to the **background service worker**; the **popup** shows field count / platform.
5. User clicks auto-fill → background sends profile → content script **maps fields** and fills the DOM.
6. For essay questions, **Smart Answer UI** can call `POST /api/ai/smart-answer` with job context.
7. **@shortcuts** (e.g. `@email`, `@summary`) expand from the stored profile without calling AI.
8. Optionally, the job is recorded via `POST /api/applications`.

State rule of thumb:

- **Profile / apps / AI config** → backend + Postgres  
- **Session JWT** → web `localStorage` (`jh_token`) or extension storage  
- **Ephemeral page state** (detected fields, last fill for undo) → content script memory  

---

## 4. Backend (`backend/`)

### Layout

```
backend/
├── prisma/
│   ├── schema.prisma    # Source of truth for DB models
│   └── seed.ts          # Optional sample data
└── src/
    ├── index.ts         # Express app, mounts routes
    ├── config/          # Zod-validated env (PORT, DATABASE_URL, JWT_*, AI keys)
    ├── middleware/      # authenticate, validate (Zod), errorHandler
    ├── routes/          # Thin HTTP layer
    ├── services/        # Business logic (auth, profile, applications, ai/*)
    └── utils/           # Prisma client, JWT helpers, AppError
```

Pattern: **route → service → Prisma**. Validation is Zod in the route; auth is JWT Bearer via `authenticate`.

### Domain models (Prisma)

| Model | Purpose |
|-------|---------|
| `User` | Email + bcrypt password + plan fields |
| `Profile` | Contact info, links, summary, resume metadata (1:1 with User) |
| `WorkExperience` / `Education` / `Skill` | Nested profile data |
| `CustomAnswer` | Saved Q&A for reuse / shortcuts context |
| `JobPreference` | Target roles, locations, remote, salary range |
| `Application` | Tracked jobs with status enum |
| `AIConfig` | Per-user provider, keys, model, temperature, maxTokens |
| `Subscription` / `Payment` | Razorpay plan purchases and donations |
| `UsageCounter` | Free-tier AI generation quotas |

**Application statuses:** `draft` | `submitted` | `rejected` | `interview` | `offer` | `withdrawn`

**AI providers:** `openai` | `anthropic` | `openrouter` | `local` (Ollama-compatible)

**Plans:** `free` (25 AI/mo) · `pro` (₹299/mo or ₹2,999/yr) · `lifetime` (₹4,999)

### API map

All authenticated routes need `Authorization: Bearer <token>`.

| Area | Methods | Notes |
|------|---------|-------|
| `GET /api/health` | public | Liveness |
| `/api/auth` | `POST /register`, `POST /login`, `GET /me` | Password min 8 chars; `/me` includes plan |
| `/api/profile` | `GET/PUT /` | Core personal fields |
| | `POST/PUT/DELETE /experience/:id` | Work history |
| | `POST/PUT/DELETE /education/:id` | Education |
| | `PUT /skills` | Replace full skills list |
| | `POST/PUT/DELETE /custom-answers/:id` | Saved answers |
| | `PUT /preferences` | Job prefs upsert |
| `/api/applications` | CRUD + `GET /stats` | Filter by status/platform/search |
| `/api/ai` | `POST /generate` | Raw completion (quota-gated) |
| | `POST /cover-letter` | From job description |
| | `POST /answer` | Question + optional context |
| | `POST /smart-answer` | Rich job context (extension) |
| | `POST /resume-optimize` | Suggestions vs JD |
| | `GET/PUT /config` | Provider settings |
| | `POST /test-connection` | Verify provider works |
| `/api/billing` | `GET /plans` | Public plan + donation presets |
| | `GET /status` | Current plan, usage, payments |
| | `POST /checkout` + `/verify` | Razorpay order for paid plans |
| | `POST /donate` + `/donate/verify` | One-time tips (auth optional) |
| | `POST /webhook` | Razorpay payment webhooks |

Server-level AI keys in `.env` are optional; users can store their own keys in `AIConfig`.

### Env essentials

See README for the full `.env` template. Required at minimum:

- `DATABASE_URL`
- `JWT_SECRET` (≥ 16 characters)

Optional for payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.

---

## 5. Web dashboard (`web/`)

Next.js App Router app with two surfaces:

### Marketing (`src/app/(marketing)/`)

Public pages: home, features, pricing, about, guide, donate, privacy, terms.  
The **Guide** page is the product how-to for end users (install, profile, AI, shortcuts).

### Auth + dashboard

| Route | Purpose |
|-------|---------|
| `/login`, `/register` | Auth against backend |
| `/dashboard` | Overview |
| `/dashboard/profile` | Edit profile data |
| `/dashboard/applications` | Application tracker |
| `/dashboard/ai` | Choose provider / models / keys |
| `/dashboard/billing` | Plan status + Razorpay checkout |
| `/dashboard/settings` | Account preferences |

Shared client code:

- `src/lib/api.ts` — fetch wrapper + token in `localStorage`
- `src/lib/auth.tsx` — auth context
- `src/lib/razorpay.ts` — Checkout.js loader
- `src/components/ui/` — UI primitives (Radix-style)
- `src/components/marketing/` — landing/guide sections

API base URL: `NEXT_PUBLIC_API_URL` or `http://localhost:4000/api`.

---

## 6. Browser extension (`extension/`)

Chrome Manifest V3. Build output lands in `extension/dist` (load that folder unpacked).

### Layout

```
extension/src/
├── adapters/       # Platform-specific form detection
├── background/     # Service worker (messaging hub)
├── content/        # Runs on job pages
│   ├── index.ts           # Orchestrates detect / fill / undo
│   ├── formFiller.ts      # Writes values into DOM
│   ├── fieldMapper.ts     # Maps FieldType → profile values
│   ├── smartAnswerUI.ts   # AI answer buttons on textareas
│   ├── shortcutExpander.ts# @token expansion
│   └── pageScraper.ts     # Job metadata helpers
├── popup/          # Small React UI (detect / fill)
├── options/        # Fuller profile UI in extension
├── types/          # Shared TS types
└── utils/          # api, storage, messaging, constants
```

### Supported platforms (adapters)

Registered in order in `adapters/index.ts`:

1. Greenhouse  
2. Lever  
3. Workday  
4. Ashby  
5. **Generic** (always matches; last resort)

Manifest host permissions also list Wellfound and SmartRecruiters; those currently rely more on generic / host matching than dedicated adapter classes.

### Adding a new ATS adapter

1. Create `extension/src/adapters/YourAdapter.ts` extending `BaseAdapter`.
2. Implement `name`, `matches(url)`, and override `detectForm` / job extraction as needed.
3. Register it **above** `GenericAdapter` in `adapters/index.ts`.
4. Add host permissions + content_script matches in `public/manifest.json`.

### Field types

Fields are classified into types like `firstName`, `email`, `linkedinUrl`, `coverLetter`, `workAuthorization`, `customQuestion`, etc. (`extension/src/types`). Pattern lists live in `utils/constants.ts` (`FIELD_PATTERNS`).

---

## 7. Core product features (what exists today)

| Feature | Where it lives |
|---------|----------------|
| Register / login (JWT) | Backend auth + web + extension API client |
| Profile CRUD | Backend profile routes; web dashboard; extension options |
| Form detection + auto-fill | Extension adapters + formFiller |
| Undo last fill | Content script keeps `lastFillResults` |
| Smart AI answers on forms | `smartAnswerUI` → `/api/ai/smart-answer` |
| Cover letter / resume tips | `/api/ai/cover-letter`, `/resume-optimize` |
| @shortcuts | `shortcutExpander` + profile fields |
| Application tracking | `/api/applications` + dashboard page |
| Multi-provider AI config | `AIConfig` model + dashboard AI page |

Not fully built yet (see README roadmap): PDF resume parsing, LinkedIn/Indeed-specific adapters, multi-step form automation, Firefox, fully automated submissions.

---

## 8. Local development cheat sheet

```bash
# Install everything
npm run install:all

# DB
npm run db:generate
npm run db:push
# optional: cd backend && npx tsx prisma/seed.ts

# Three processes
npm run dev:backend    # :4000
npm run dev:web        # :3000
npm run dev:extension  # watch → extension/dist
```

Load `extension/dist` via Chrome → Extensions → Developer mode → Load unpacked.

Useful DB GUI: `npm run db:studio`.

---

## 9. Where to look when…

| You want to… | Start here |
|--------------|------------|
| Change env validation | `backend/src/config/index.ts` |
| Add an API endpoint | `backend/src/routes/*` + matching `services/*` |
| Change DB shape | `backend/prisma/schema.prisma` then `db:push` / migrate |
| Change AI prompting | `backend/src/services/ai/` |
| Fix auto-fill mapping | `extension/src/content/fieldMapper.ts`, `formFiller.ts` |
| Fix detection on a platform | That platform’s adapter under `extension/src/adapters/` |
| Change popup UX | `extension/src/popup/` |
| Change dashboard pages | `web/src/app/dashboard/` |
| Change landing / guide copy | `web/src/app/(marketing)/` |
| Understand intended product scope | `PROJECT_SPECIFICATION.md` |
| Brief an AI coding agent | `AI_AGENT_PROMPT.md` |

---

## 10. Security & privacy notes

- Passwords are bcrypt-hashed; sessions are JWTs (default expiry `7d`).
- AI API keys may be stored per user in `AIConfig` — treat the DB as sensitive.
- Extension requests elevated host access only for listed job platforms + localhost API.
- Users should still review AI-generated answers before submitting applications.
- Do not commit `.env` files or real API keys.

---

## 11. Version & status

- **Version:** 0.1.0 (private)  
- **Node:** ≥ 18  
- **Scope:** MVP — semi-automated fill + AI assist + tracking  

When in doubt: the **code and Prisma schema** are the source of truth; the specification may describe future or alternate ideas that are not implemented yet.
