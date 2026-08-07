# Calendrier — Jouer pour de bon / Calendar — Playing for Good

Standalone bilingual game calendar and registration UI for embedding in the Wix site.

## Live pages

- Calendar: `/`
- Organizer form prototype: `/organizer/`
- Player Join page: `/join/?event=EVENT_ID&competition=COMPETITION_ID`

GitHub Pages base URL:

`https://irisalukiferriswheel.github.io/calendrier-jouer-pour-de-bon/`

## Calendar features

- FR / EN interface toggle, remembered in the visitor's browser
- Free-text search by title, game, city, venue, or description
- Dynamic City and Game dropdowns
- Any City + Game combination
- All dates / This week / This weekend filters
- Chronological results grouped by day
- Responsive layout for desktop and mobile
- Expandable event descriptions
- Player count, spots remaining, and age group
- Join button only when registration is open and capacity remains
- API-driven through the shared Jouer pour de bon backend

## Organizer form prototype

The organizer page prepares the fields needed by the calendar and registration system:

- activity title and game
- description
- date, start/end time, and timezone
- city, country, venue, and address
- maximum participants
- required age-group selection (all ages, youth, 18+, or custom range)
- fee and currency
- draft vs publish/open-registration state

The page currently validates and previews the backend-shaped payload. Real publishing remains disabled until organizer authentication is connected.

## Join page

The Join page receives the calendar event and competition IDs, collects the player's cause, and is prepared to submit to `POST /v1/registrations` when an authenticated player API token is available. Demo mode does not create fake registrations.

## Data flow

`Organizer -> competition + linked event -> Supabase/API -> calendar -> Join -> registration`

The live API contract expected by the calendar is:

- `GET /v1/events/filters`
- `GET /v1/events?city=...&game=...&from=...`

The API draft PR extends event responses with capacity and registration availability fields.

## Current preview mode

The shared API does not yet have a permanent public HTTPS deployment URL. Until it does, the calendar displays clearly marked demo events so design, filters, capacity display, and Join states can be previewed safely.

Once the API is deployed, append the API address while testing:

`?api=https://YOUR-API-HOST`

The same API address can later be made the default in `script.js`.

## Deployment

This repository is published with GitHub Pages and is intended to be embedded in Wix as an external website/HTML frame.
