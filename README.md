<div align="center">

# FNI — Forerunners Network International

**One community. One mission. Connected.**

A mobile-first community app experience for the Forerunners Network International.

`React` · `TypeScript` · `Vite` · `Capacitor`

[View source](https://github.com/jk-larbi/FNI-APP-2.0) · [Open the GitHub Pages preview](https://jk-larbi.github.io/FNI-APP-2.0/)

</div>

---

## Product direction

FNI is being shaped as a connected digital space for ministry communication and community life. The interface takes inspiration from familiar messaging apps while bringing ministry-focused areas into one mobile-first experience.

## Interface areas

- **Chats** — conversations, chat folders and message interactions.
- **Contacts** — a dedicated place for people and connections.
- **Calls** — calling and video-call entry points in the interface.
- **FNI Community** — a home for wider community engagement.
- **Settings** — profile, appearance, notifications and app preferences.

The interface also includes interaction patterns for replies, reactions, attachments, stickers and ministry-related message content.

> This repository currently focuses on the client-side app experience. A live backend, real-time messaging, authentication, push notifications and production calling services should not be assumed to be active unless separately configured and verified.

## Design principles

- Mobile-first layouts and touch-friendly navigation.
- A consistent FNI identity using deep blue, purple and restrained gold accents.
- Familiar messaging patterns with ministry-specific context.
- Clear navigation and practical controls rather than decorative complexity.

## Technology

| Area | Technology |
|---|---|
| UI | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Icons | Lucide React |
| Mobile foundation | Capacitor 8 |

## Run locally

### Requirements

- Node.js (LTS recommended)
- npm

```bash
git clone https://github.com/jk-larbi/FNI-APP-2.0.git
cd FNI-APP-2.0
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

## Android development

The project includes Capacitor Android support.

```bash
npm run android:sync
```

This builds the web application and synchronizes the output with the Android project. Android Studio and the Android SDK are required to build and run the native application.

## Deployment

The web preview is configured for GitHub Pages under the repository path `/FNI-APP-2.0/`. The project uses a dedicated Vite mode for that deployment base path.

## Project links

- [GitHub repository](https://github.com/jk-larbi/FNI-APP-2.0)
- [Issues and feedback](https://github.com/jk-larbi/FNI-APP-2.0/issues)

---

<div align="center">

*Forerunners Network International*

</div>
