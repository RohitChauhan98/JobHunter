# 🎯 JobHunter

**Automated Job Application Assistant** — Save hours of repetitive form-filling with intelligent auto-fill and AI-powered response generation.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-Private-red)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

---

## 📖 Handbook

New to the codebase? Start with **[HANDBOOK.md](./HANDBOOK.md)** — how the three packages connect, data model, API map, extension adapters, and “where to look when…”.

---

## 📋 Overview

In today's competitive job market, candidates apply to hundreds of positions — filling out the same forms, answering the same questions, and manually tailoring responses over and over. **JobHunter** eliminates this friction with:

- **🧩 Browser Extension** — Detects job application forms and auto-fills them with your profile data
- **🌐 Web Dashboard** — Manage your profile, track applications, and configure AI settings
- **⚙️ Backend API** — Stores user data, orchestrates AI providers, and powers the whole system

---

## 🏗️ Architecture

```
┌──────────────────┐         ┌──────────────────┐
│  Browser Extension│◄────────►│  Web Dashboard   │
│  (Chrome MV3)    │         │  (Next.js)       │
│                  │         │                  │
│  • Content Scripts│         │  • Profile Mgmt  │
│  • Platform      │         │  • App Tracker   │
│    Adapters      │         │  • AI Settings   │
│  • Popup UI      │         │  • Analytics     │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         └──────────┬─────────────────┘
                    │
         ┌──────────▼──────────┐
         │   Backend API       │
         │   (Express + Prisma)│
         │                     │
         │  • Auth (JWT)       │
         │  • Profile CRUD     │
         │  • AI Generation    │
         │  • Application      │
         │    Tracking         │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │  PostgreSQL (Neon)  │
         └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Extension** | TypeScript, React, Zustand, Tailwind CSS, Vite, Manifest V3 |
| **Web Dashboard** | Next.js 14, React 18, Tailwind CSS, Radix UI, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod |
| **Database** | PostgreSQL (NeonDB serverless) |
| **AI Providers** | OpenAI, Anthropic Claude, OpenRouter, Local LLMs (Ollama) |
| **Auth** | JWT (bcrypt password hashing) |

---

## ✨ Key Features

### Browser Extension
- **Platform-specific adapters** for Greenhouse, Lever, Workday, Ashby, and a generic fallback
- **Intelligent field detection** — maps form fields to your profile using pattern matching
- **AI-powered answer generation** — generates tailored responses for open-ended questions
- **Shortcut expander** — quickly insert pre-written answers
- **Page scraper** — extracts job details for tracking

### Web Dashboard
- **Profile management** — personal info, work experience, education, skills, custom Q&A pairs
- **Application tracker** — monitor status across all your applications
- **AI configuration** — choose your preferred AI provider and model
- **Settings** — manage account preferences

### Backend API
- **Multi-provider AI** — seamlessly switch between OpenAI, Anthropic, OpenRouter, or local LLMs
- **Secure auth** — JWT-based authentication with bcrypt hashing
- **Comprehensive profile** — stores resume metadata, work history, education, skills, job preferences
- **Application tracking** — full CRUD for job applications

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** database (or a [NeonDB](https://neon.tech) serverless instance)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/JobHunter.git
cd JobHunter
npm run install:all
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/jobhunter

# JWT
JWT_SECRET=your-secret-key-at-least-16-chars
JWT_EXPIRES_IN=7d

# AI Providers (all optional — users can supply keys at runtime)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama3

# Razorpay (optional in local — checkout errors clearly if unset)
# https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=
```

### 3. Set Up the Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
cd backend && npx tsx prisma/seed.ts
```

### 4. Start Development Servers

Run each in a separate terminal (or use a process manager):

```bash
# Backend API (http://localhost:4000)
npm run dev:backend

# Web Dashboard (http://localhost:3000)
npm run dev:web
```

### Razorpay billing

Plans (INR): **Free** (25 AI gens/mo) · **Pro** ₹299/mo or ₹2,999/yr · **Lifetime** ₹4,999.  
Donations accepted on `/donate`. Dashboard billing is at `/dashboard/billing`.

1. Create a Razorpay account and copy **Test** key id + secret into `backend/.env`
2. Run `npx prisma db push` so `Subscription` / `Payment` / `UsageCounter` tables exist
3. Optional webhook: `POST /api/billing/webhook` with events `payment.captured`, `payment.failed` and set `RAZORPAY_WEBHOOK_SECRET`

```bash
# Extension (watch mode — outputs to extension/dist)
npm run dev:extension
```

### 5. Load the Extension in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/dist` folder

---

## 📁 Project Structure

```
JobHunter/
├── backend/                  # Express API server
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed script
│   └── src/
│       ├── index.ts          # App entry point
│       ├── config/           # Environment validation (Zod)
│       ├── middleware/        # Auth, error handling, validation
│       ├── routes/           # API route handlers
│       ├── services/         # Business logic & AI providers
│       └── utils/            # Prisma client, JWT, errors
│
├── extension/                # Chrome Extension (Manifest V3)
│   ├── public/
│   │   └── manifest.json     # Extension manifest
│   ├── scripts/
│   │   └── build.mjs         # Custom build script
│   └── src/
│       ├── adapters/         # Platform-specific form adapters
│       ├── background/       # Service worker
│       ├── content/          # Content scripts (form filler, scraper)
│       ├── options/          # Options page (React)
│       ├── popup/            # Popup UI (React)
│       ├── types/            # Shared TypeScript types
│       └── utils/            # API client, storage, messaging
│
├── web/                      # Next.js web dashboard
│   └── src/
│       ├── app/              # App router pages
│       │   ├── dashboard/    # Dashboard (profile, applications, AI, settings)
│       │   ├── login/        # Login page
│       │   └── register/     # Registration page
│       ├── components/       # Reusable UI components
│       └── lib/              # API client, auth context, utilities
│
└── package.json              # Root workspace scripts
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/profile` | Get user profile |
| `PUT` | `/api/profile` | Update user profile |
| `GET` | `/api/applications` | List tracked applications |
| `POST` | `/api/applications` | Create a new application |
| `PUT` | `/api/applications/:id` | Update an application |
| `DELETE` | `/api/applications/:id` | Delete an application |
| `POST` | `/api/ai/generate` | Generate AI response |

All authenticated endpoints require `Authorization: Bearer <token>` header.

---

## 🤖 Supported AI Providers

| Provider | Model Examples | Notes |
|----------|---------------|-------|
| **OpenAI** | GPT-4, GPT-4o, GPT-3.5 Turbo | Requires API key |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | Requires API key |
| **OpenRouter** | Any model via OpenRouter | Requires API key |
| **Local (Ollama)** | Llama 3, Mistral, etc. | Self-hosted, no API key needed |

---

## 🔌 Supported Job Platforms

The extension ships with dedicated adapters for:

- **Greenhouse** (`*.greenhouse.io`)
- **Lever** (`*.lever.co`)
- **Workday** (`*.myworkdayjobs.com`)
- **Ashby** (`*.ashbyhq.com`)
- **Generic fallback** for any other career page

Adding a new adapter? Create a class extending `BaseAdapter` in `extension/src/adapters/` and register it in the adapter index.

---

## 🧪 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run install:all` | Install dependencies for all packages |
| `npm run dev:backend` | Start backend in watch mode |
| `npm run dev:web` | Start Next.js dev server |
| `npm run dev:extension` | Build extension in watch mode |
| `npm run build:backend` | Compile backend TypeScript |
| `npm run build:web` | Build Next.js for production |
| `npm run build:extension` | Production build of extension |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## 🗺️ Roadmap

- [ ] Resume parsing (PDF/DOCX upload)
- [ ] LinkedIn & Indeed platform adapters
- [ ] Automated multi-step form navigation
- [ ] Application analytics & success metrics
- [ ] Cover letter generation
- [ ] Salary expectation intelligence
- [ ] Fully automated application submissions
- [ ] Firefox extension support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and not currently licensed for public distribution.
