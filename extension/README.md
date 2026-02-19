# JobHunter Browser Extension

## Purpose
Chrome/Edge browser extension that detects job application forms on supported platforms and auto-fills them using the user's stored profile data.

## Architecture
```
src/
├── adapters/        # Platform-specific form detection (Greenhouse, Lever, etc.)
├── background/      # Service worker — messaging hub, data persistence
├── content/         # Content scripts — form detection, filling, undo
├── popup/           # Extension popup UI (React)
├── options/         # Full-page profile management UI (React)
├── types/           # Shared TypeScript interfaces
├── utils/           # Storage, messaging, constants
└── styles/          # Tailwind CSS
```

## Supported Platforms
- **Greenhouse** — `boards.greenhouse.io`
- **Lever** — `jobs.lever.co`
- **Workday** — `*.myworkdayjobs.com`
- **Wellfound** — `wellfound.com`
- **Ashby** — `jobs.ashbyhq.com`
- **SmartRecruiters** — `jobs.smartrecruiters.com`
- **Generic** — Fallback for company career pages

## Development

```bash
# Install dependencies
npm install

# Build (development, with watch)
npm run dev

# Build (production)
npm run build

# Type check
npm run type-check
```

## Loading in Chrome
1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` directory

## Testing
Load the extension, navigate to a Greenhouse or Lever job posting, and click the extension icon. You should see a detected form. Set up your profile in the options page, then click "Auto-Fill Form".
