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

The calendar reads the shared API by default. If the initial unfiltered result is empty, it shows three clearly marked sample events with future dates, including available and full activities. If the API is unavailable, it also shows an explicit error notice alongside the samples. A filtered live search with no matches stays empty; it does not introduce sample results.

Use `?demo=1` to open the samples directly. Choose the text, city, game, and date filters, then click Search or press Enter to apply them together. Changing controls does not update results or send API requests until submission. Switching language preserves unsubmitted choices. Reset clears the controls and restores all results. These controls also work on samples.

This week and This weekend use Montreal calendar dates, independent of the visitor's device timezone, and exclude activities that already started. Search and Reset are disabled while an event request is pending; changes made to other filters during that request remain pending until the next Search.

Available events show **Request to join / Demander à participer**. Real events retain the authenticated Wix registration bridge. Sample events open a clearly labelled demonstration form: submitting only displays a local demo confirmation and never calls the API or sends a registration message to Wix. Full and closed events cannot be requested.

For API testing, append the API address to a page URL:

`?api=https://YOUR-API-HOST`

No Supabase service-role key belongs in this static repository.

## Validation

The browser regression test uses Node.js and Playwright with installed Google Chrome: `node --test tests/calendar.test.cjs` (install Playwright locally with `npm install --no-save playwright` first). Set `BROWSER_CHANNEL=msedge` to use Edge. It checks empty/error fallback, live empty search results, FR/EN search, Enter, dropdowns, mobile overflow, full activities, and that sample requests never reach the API.

## Deployment

This repository is published with GitHub Pages and can be embedded in Wix as an external website/HTML frame.
