# Air Monsters

Air Monsters is a location-based Augmented Reality (AR) web game where players hunt and catch virtual creatures whose types are determined by real-world Air Quality Index (AQI) data.

## What it does
Players create a customized "Guardian" avatar and explore a map to find monster locations. When within 500 meters of a monster, players enter AR Hunt Mode, using their device's camera, GPS, and compass to track down the creature in their environment. Different monsters represent different air quality levels (e.g., Breezy for good air, Smokey for poor air), educating players about their local environment through the "Clean Air Catch Card".

## How it works
The application is a client-side web application built with HTML, CSS, and Vanilla JavaScript, intended to be run on mobile browsers.
- **AR Experience:** Uses `navigator.mediaDevices` for the camera feed, `navigator.geolocation` for distance calculations, `deviceorientation` for the compass, and `three.js` to render 3D monster models during the catch sequence.
- **Air Quality Data:** Integrates with the Airly API to fetch real-time AQI data (`aqi.js`), caching responses in `localStorage` to respect the rate limits.
- **Storage:** User accounts, customizations, and caught monsters are persisted locally using the browser's `localStorage` API (`storage.js`, `auth.js`).

## Orchestration Flow & Architecture
This project follows a modular, Single Page Application (SPA) architecture without a heavyweight framework. For a developer inheriting the repo, understanding the screen-switching flow is key:

- **`index.html`**: Contains all UI "screens" as sibling `<div>` elements (e.g., `#home-screen`, `#ar-screen`). Only one screen has the `.active` CSS class at a time.
- **`js/app.js`**: The main entry point. It initializes the app, pre-fetches AQI data, and provides the `showScreen(screenId)` router function. It also handles URL hash routing (e.g., logging into `#home` or `#ar`).
- **`js/config.js`**: Holds the global `state` object, sharing data (like the current user, selected monster, and active distance) across isolated modules.
- **Screen Modules** (e.g., `home.js`, `ar.js`, `ar-catchmode.js`): Each major screen has a corresponding JS module. They encapsulate specific logic and event listeners. Many modules use a `MutationObserver` on their respective DOM element to detect when their screen becomes `.active` or inactive. This allows them to cleanly start and stop heavy processes like the camera feed or GPS polling without global lifecycle hooks.
- **Styling**: Structured with one CSS file per screen (e.g., `css/00-global.css`, `css/03-home.css`) for maintainability.

## Setup
```bash
npm install
npm run dev
```

## Open
`http://localhost:8080`

**Note:** AR features require testing on a mobile device or a browser environment that can simulate camera, GPS, and device orientation APIs (e.g., Chrome Developer Tools Sensors).
