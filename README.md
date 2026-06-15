# Chalet Oddaz starter website

This is the first static bilingual website for Chalet Oddaz, Samoëns.

## What it includes

- English homepage at `/`
- French homepage at `/fr/`
- Chalet details
- Gallery placeholders
- Manual availability table
- Location page
- Enquiry page with a Tally placeholder
- No booking engine, no online payment, no database

## How to upload to GitHub

1. Open your `chalet-oddaz` repository on GitHub.
2. Click **Add file** → **Upload files**.
3. Upload all files and folders from this package.
4. Commit directly to the `main` branch.

## Cloudflare Pages settings

When connecting the GitHub repository to Cloudflare Pages:

- Framework preset: **None**
- Build command: leave blank
- Build output directory: `/`

Cloudflare will give you a temporary preview domain such as:

`chalet-oddaz.pages.dev`

Use that for testing before connecting the GoDaddy domains.

## Edit availability

Open:

`data/availability.json`

Statuses allowed:

- `available`
- `reserved`
- `pending`
- `closed`

Example:

```json
{
  "from": "2027-02-14",
  "to": "2027-02-21",
  "status": "available",
  "note_en": "February holiday week",
  "note_fr": "Semaine de vacances de février"
}
```

## Add the Tally form

Create a form in Tally, then replace the placeholder button or block in:

- `enquiry/index.html`
- `fr/demande/index.html`

## Replace photos

Current placeholders are SVG files in:

`assets/`

Later, professional photos can be added and referenced from the CSS or page HTML.
