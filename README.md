# FNI — Forerunners Network International

Source snapshot for the FNI community and cell-group application.

- AppDeploy app ID: `fni-1tza8x`
- Current live app: https://fni-1tza8x.v2.appdeploy.ai/
- Imported source snapshot: `1794357096113`

## Stack
React, TypeScript, Vite, and the AppDeploy SDK for authentication, backend APIs, database, storage, notifications, invites and realtime subscriptions.

## Local development
Run `npm install`, then use the scripts in `package.json`.

## Scope and status
This repository captures the currently deployed source. It does not mean all requested future features are already implemented.

The Man of God portal, church-wide meeting controls, genuine live attendance/presence, church-wide announcements, and delegated administrator permissions remain planned until implemented and deployed.

The current meeting surface is not a genuine audio/video conferencing service. Accurate join/leave attendance needs a real meeting provider and its presence events or webhooks.

The app references `public/resources/fni-logo.png`; the real logo asset was not part of this source export. Supply the official asset rather than substituting an invented logo.

GitHub Pages alone cannot host the backend API, authentication, database, storage, or realtime services. Use a backend-capable host for the complete app.
