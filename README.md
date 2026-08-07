# Calendrier — Jouer pour de bon / Calendar — Playing for Good

Standalone bilingual event calendar for embedding in the Wix site.

## Features

- FR / EN interface toggle, remembered in the visitor's browser
- Free-text search by title, game, city, venue, or description
- Dynamic City and Game dropdowns
- Any City + Game combination
- All dates / This week / This weekend filters
- Chronological results grouped by day
- Responsive layout for desktop and mobile
- Expandable event descriptions
- API-driven through the shared Jouer pour de bon backend

## Data flow

`Supabase -> jouer-pour-de-bon-api -> this calendar -> Wix`

The live API contract expected by the calendar is:

- `GET /v1/events/filters`
- `GET /v1/events?city=...&game=...&from=...`

## Current preview mode

The shared API does not yet have a permanent public HTTPS deployment URL. Until it does, the page displays three clearly marked demo events so the design and filters can be previewed.

Once the API is deployed, append the API address while testing:

`?api=https://YOUR-API-HOST`

The same API address can later be made the default in `script.js`.

## Files

- `index.html` — page markup
- `styles.css` — visual design
- `i18n.js` — French and English UI strings
- `demo.js` — preview-only sample events
- `render.js` — event display and local filters
- `script.js` — API connection and interface behavior

## Deployment

This repository is intended to be published with GitHub Pages and embedded in Wix as an external website/HTML frame.
