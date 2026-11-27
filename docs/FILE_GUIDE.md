# Frontend File Guide

This index maps frontend files to their main responsibility. Feature screens should call the matching API module rather than constructing endpoint URLs inline.

## Entry and public assets

| File | Responsibility |
| --- | --- |
| `index.html` | Browser metadata, app title, and favicon links |
| `src/main.jsx` | React root, providers, and stylesheet imports |
| `src/App.jsx` | Authentication screen, role-aware app shell, page navigation |
| `public/astro-logo.svg` | Astra astrology emblem used in the app and browser tab |
| `public/favicon.ico` | Legacy browser icon fallback |
| `public/logo192.png`, `public/logo512.png` | App icons for installed/PWA-like contexts |

## API modules (`src/api`)

| File | Responsibility |
| --- | --- |
| `client.js` | Shared fetch client, API base URL, bearer auth, WebSocket URL |
| `authApi.js` | Register, sign-in, current account, token refresh/logout |
| `userApi.js` | Profile and language preference requests |
| `astrologerApi.js` | Astrologer search, application, own profile |
| `astrologyApi.js` | Birth chart requests |
| `locationApi.js` | Place autocomplete/search |
| `consultationApi.js` | Consultation booking, list, and status changes |
| `chatApi.js` | Chat history, messages, attachments, socket connection |
| `callApi.js` | Call start and end |
| `paymentApi.js` | Payment record actions |
| `reportApi.js` | Report generation, listing, sharing, PDF download |
| `reviewApi.js` | Review submission and listing |
| `complaintApi.js` | Complaint submission and management |
| `adminApi.js` | Admin dashboard, approvals, and user actions |
| `voiceApi.js` | Text-to-speech requests |

## Shared state, components, and helpers

| File | Responsibility |
| --- | --- |
| `src/contexts/AuthContext.jsx` | Authenticated user and token state |
| `src/contexts/LanguageContext.jsx` | Language selection, persistence, and translation helper |
| `src/contexts/translations.js` | English/Tamil/Hindi UI dictionaries |
| `src/components/navigation/AppNavigation.jsx` | Role-specific desktop sidebar and mobile bottom nav |
| `src/components/common/PageState.jsx` | Page heading, loading/empty/error states, generic data table |
| `src/components/charts/ChartDiagram.jsx` | South Indian and North Indian chart diagrams |
| `src/components/chat/ChatAttachment.jsx` | Image, video, audio, and file rendering/download |
| `src/utils/tokenStorage.js` | Browser token persistence |

## Screens (`src/pages`)

| File | Responsibility |
| --- | --- |
| `DashboardPage.jsx` | Role-aware overview and quick links |
| `AstrologersPage.jsx` | Astrologer discovery and booking entry point |
| `AstrologerApplicationPage.jsx` | Astrologer application form |
| `ConsultationsPage.jsx` | Consultation booking and status actions |
| `BirthChartPage.jsx` | Rasi/Navamsa, planet details, and Dasha/Bhukti filters |
| `ChatPage.jsx` | Consultation chat and attachment composer |
| `CallsPage.jsx` | Consultation call controls/history |
| `PaymentsPage.jsx` | Payment records/status display |
| `ReportsPage.jsx` | Localized report generation, preview, sharing, PDF download |
| `ReviewsPage.jsx` | Reviews |
| `ComplaintsPage.jsx` | User support requests and admin complaint tools |
| `ProfilePage.jsx` | Account profile |
| `NotFoundPage.jsx` | Unknown-page fallback |
| `pages/admin/AstrologerApprovalsPage.jsx` | Admin application review |
| `pages/admin/UsersPage.jsx` | Admin user management |

## Styles

| File | Responsibility |
| --- | --- |
| `src/styles/global.css` | Base components, layout, and responsive foundations |
| `src/styles/features.css` | Feature-specific widgets and page styles |
| `src/styles/locations.css` | Place autocomplete menu |
| `src/styles/theme.css` | Astra palette, accents, animation, report design, responsive navigation |
| `.env.example` | Safe frontend API URL template |
