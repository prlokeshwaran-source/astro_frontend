# Frontend UI Guide

## Brand palette

| Token | Value | Use |
| --- | --- | --- |
| Saffron | `#9A3412` | Top bars and footer |
| Dark brown | `#431407` | Desktop sidebar and headings |
| Cream | `#FFF7ED` | App background |
| Orange | `#F97316` | Primary actions and active navigation |
| Gold | `#F4C542` | Secondary accents |
| Light orange | `#FED7AA` | Borders |
| Muted grey | `#78716C` | Secondary labels |

Feature accents are defined in `src/styles/theme.css`: charts use violet, chat uses teal, calls use blue, payments use green, reports use amber, reviews use pink, complaints use red, and dashboards vary by role.

## Responsive navigation

- Desktop uses a dark, scrollable sidebar with all links for the current role.
- Mobile hides the full sidebar and uses a five-item bottom navigation suited to the signed-in role.
- Keep navigation destinations in `src/components/navigation/AppNavigation.jsx`; keep responsive layout rules in `src/styles/theme.css`.
- The app shell footer and top bar are in `src/App.jsx`.

## Motion and accessibility

Use short transitions for hover and selection states, with entrance motion kept subtle. Preserve focus indicators and usable touch sizes. `theme.css` includes a `prefers-reduced-motion` override; new animations should honor it. Icon-only controls must have an accessible name.

## Feature screen conventions

- Start a page with the shared `PageHeading` component.
- Use `content-card` for a primary task, and a clear empty state for missing data.
- Keep request/loading errors visible near the relevant section.
- Keep feature accent colors scoped to `.page-{page}` so a feature style does not recolor unrelated pages.
- Reports use the report generator form, language status, empty state, and report cards in `ReportsPage.jsx`; their visual rules live in `theme.css`.

## Logo and browser metadata

The astrology emblem source is `public/astro-logo.svg`. `index.html` references it as the SVG favicon; `AppNavigation.jsx` and the sign-in header use it as the Astra brand mark. Keep theme color and description metadata in `index.html` aligned with the brand.
