# CS-6440-Final-Project

Health Informatics — final project for CS-6440.

This repository is a small React app (Vite) containing pages and components for health/symptom tracking, messaging, and profile management.

## Prerequisites

- Node.js (18.x or later recommended)
- npm (comes with Node.js) or a compatible package manager
- A modern browser for development (Chrome, Edge, Firefox)

On Windows, these instructions assume you are using PowerShell.

## Install

1. Open PowerShell and change into the project directory:

```powershell
cd 'CS-6440-Final-Project'
```

2. Install dependencies:

```powershell
npm install
```

If you prefer yarn or pnpm, you can use those instead but the README uses npm commands.

## Available scripts

The project defines the following npm scripts (see `package.json`):

- `npm run dev` — Start the Vite development server (hot-reload).
- `npm run build` — Produce an optimized production build in the `dist/` folder.
- `npm run preview` — Serve the production build locally for quick verification.
- `npm run lint` — Run ESLint across the codebase.

## Run (development)

Start the dev server and open the app in your browser:

```powershell
npm run dev
```

Vite will print a local URL (usually http://localhost:5173) — open that in your browser.

## Build and preview (production)

Create a production build and preview it locally:

```powershell
npm run build; npm run preview
```

The `preview` command serves the contents of `dist/` so you can confirm the production bundle.

## Project structure (important files)

- `index.html` — App entry
- `src/main.jsx` — React app bootstrap
- `src/App.jsx` — Top-level routes and layout
- `src/pages/` — Page components (Home, Profile, Messaging, HealthTracking, SymptomTracking)
- `src/components/Sidebar.jsx` — Sidebar component
- `src/css/` — App CSS files

## Linting

Run ESLint with:

```powershell
npm run lint
```

If ESLint reports issues, fix them manually or use an editor integration (VS Code ESLint extension) to apply fixes.

## Troubleshooting

- If dependencies fail to install, delete `node_modules` and `package-lock.json` and run `npm install` again.
- If the dev server port is in use, Vite will usually prompt to use a different port — accept or free the port.
- If React types or ESLint plugins cause type/lint errors in your environment, ensure your Node version and npm packages are compatible with the versions pinned in `package.json`.