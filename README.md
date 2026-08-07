# Calendrier — Jouer pour de bon / Calendar — Playing for Good

Standalone bilingual event calendar plus organizer and Join pages for embedding in the Wix site.

## Public calendar

The root page provides:

- FR / EN interface toggle, remembered in the visitor's browser
- Free-text search by title, game, city, venue, or description
- Dynamic City and Game dropdowns
- Any City + Game combination
- All dates / This week / This weekend filters
- Chronological results grouped by day
- Responsive layout for desktop and mobile
- Expandable event descriptions
- Number of confirmed players
- Number of spots left
- Age group
- Join button when registration is open and capacity remains

## Organizer page

`/organizer/`

Required organizer fields currently include:

- activity name
- game
- date, start time, end time, and timezone
- city, country, and venue
- maximum number of players
- age group (all ages, under 18, 18+, or a custom min/max range)
- cost per player and currency
- publication choice: draft or publish/open registration

Optional fields include description and street address.

The form previews the resulting activity locally. When it is opened with a configured API address and an organizer access token is available in browser storage, it can call `POST /v1/organizer/activities`, which creates the competition and its linked calendar event together.

## Join page

`/join/?event=EVENT_ID&competition=COMPETITION_ID`

The Join page:

- loads public event availability without requiring login
- shows participant count, spots left, age group, and fee
- disables joining when the activity is full or registration is closed
- asks which cause the player is playing for
- requires a player access token only for the actual `POST /v1/registrations` call

## API data flow

`Supabase -> jouer-pour-de-bon-api -> calendar / organizer / Join pages -> Wix`

Expected API routes:

- `GET /v1/events/filters`
- `GET /v1/events?city=...&game=...&from=...`
- `GET /v1/calendar/events/:id`
- `POST /v1/organizer/activities`
- `POST /v1/registrations`

## Capacity model

The public calendar distinguishes:

- `participantsCount`: confirmed registrations
- `reservedCount`: confirmed + pending-payment registrations
- `spotsLeft`: maximum capacity minus reserved registrations

Pending-payment registrations reserve a spot, which prevents the final place from being sold twice while checkout is in progress. The backend feature branch also contains a Supabase trigger intended to enforce this at the database layer.

## Preview mode

Until the shared API has a permanent public HTTPS deployment URL, the calendar shows three clearly marked demo events. The organizer and Join pages also remain safe previews unless an API address and authenticated token are available.

For API testing, append the API address to a page URL:

`?api=https://YOUR-API-HOST`

No Supabase service-role key belongs in this static repository.

## Deployment

This repository is published with GitHub Pages and can be embedded in Wix as an external website/HTML frame.
