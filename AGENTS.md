# Repository Guidelines

## Project Structure & Module Organization

This repository is a small TypeScript progressive web app for inspection checklists. The main
source is `app.ts`; its compiled browser output is `app.js`. Page markup is in `index.html`,
styles are in `styles.css`, and PWA metadata and service-worker behavior are in `manifest.json`
and `sw.js`. PNG/SVG icons live at the repository root. Browser dependencies that must be
deployed with the app, including jsPDF assets, are kept in `vendor/`. There is currently no
automated test directory.

## Build, Test, and Development Commands

Install dependencies with `npm install`, then use:

- `npm run build` — compile strict TypeScript from `app.ts` to the configured JavaScript output.
- `npm run lint` — lint the TypeScript source with ESLint.
- `npm run format:check` — verify Prettier formatting across the repository.
- `npm run format` — rewrite files using the project’s Prettier rules.

No test runner is configured. For browser changes, serve the repository through a local HTTP
server (for example, `npx serve .`) and manually exercise checklist entry, photo handling,
history, and PDF export; service workers and module loading should not be tested from `file://`.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, single quotes, trailing commas, and a 100-column width.
Run Prettier and ESLint before submitting changes. Keep TypeScript strict and prefer explicit
interfaces and union types for checklist data and statuses. Use `camelCase` for variables and
functions, `PascalCase` for types/classes/enums, and descriptive DOM IDs or `data-*` attributes.
Escape user-provided text before inserting it into HTML, and preserve the existing localStorage
and service-worker cache behavior when changing persistence or assets.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects with a focused prefix where useful, such as `fix: ...`,
`feat: ...`, or `Remove ...`. Keep each commit focused. Pull requests should explain user-visible
behavior changes, list validation commands run, and include screenshots for UI changes. Call out
changes to generated `app.js`, deployed vendor assets, localStorage formats, or cache versions.
