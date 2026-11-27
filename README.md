# Astra Frontend

Responsive React and Vite frontend for the Astrology Consultation platform. It supports user, astrologer, and administrator workspaces and communicates with the FastAPI backend.

## Requirements

- Node.js 20 or newer with npm
- The backend running locally or at a configured API URL

## Run locally

In PowerShell from the frontend directory:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` if the backend is not at `http://127.0.0.1:8000/api/v1`. Ensure the backend's `CORS_ORIGINS` includes the Vite origin, usually `http://localhost:5173`.

Build and preview a production bundle:

```powershell
npm run build
npm run preview
```

## User interface

- Saffron, dark brown, cream, orange, and gold Astra theme with feature-specific accent colors.
- Desktop role-aware sidebar and mobile role-aware bottom navigation.
- Responsive user, astrologer, and admin page flows.
- English, Tamil, and Hindi language selection. Authenticated selection is saved through the backend and applied to chart, location, report, and PDF requests.
- Astrologer discovery and application, consultation booking/status, birth charts, messaging, calls, payments, reports, reviews, complaints, and admin tools.
- Birth chart views include Rasi, Navamsa, planet placements, and a filterable Dasha/Bhukti timeline.
- Chat supports text, image, file, audio, voice recording, and video attachments within the backend size limit.
- The Astra astrology emblem is at `public/astro-logo.svg` and is used as the browser icon and app mark.

## Source map

```text
src/
  api/          API client and feature endpoint modules
  contexts/     authentication state, language state, and translations
  components/   shared navigation, chart, chat, and page components
  pages/        role-aware feature screens
  pages/admin/  administrator screens
  styles/       base, feature, location, and theme styles
  App.jsx       authenticated app shell and page routing
  main.jsx      React providers and stylesheet entry point
public/         browser icon and app image assets
index.html      document metadata and SVG favicon reference
```

See [docs/UI_GUIDE.md](docs/UI_GUIDE.md) for layout and theme conventions, [docs/STATE_AND_API.md](docs/STATE_AND_API.md) for authentication/language/report flows, and [docs/FILE_GUIDE.md](docs/FILE_GUIDE.md) for the source file map.
