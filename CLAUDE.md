# Dashboard Lab: project instructions

## What this is
A public learn-in-public website about building dashboards, from mock data to the PL-300 exam. It is also a portfolio piece, so quality and accuracy matter.

## Architecture
- Static site, no build step, hosted on GitHub Pages. Must keep working when index.html is opened directly.
- Hash routing in js/app.js: `#/` is the home panel, `#/lesson/<id>/<tab>` is a lesson page.
- Tabs: overview, learn, setup, apply, guide.
- All lesson content lives in js/lessons.js as data (LESSONS, TRACKS, LOG). Add content there, not in app.js.
- Labs are functions in the LABS object in app.js, referenced by a lesson's `lab` field.
- Only external dependencies: Chart.js 4.4.1 from cdnjs and Google Fonts. Keep it that way unless asked.
- Progress uses localStorage wrapped in try/catch.

## Data
- Everything is synthetic: a mock trading execution desk (NYSE, NASDAQ, ARCA, BATS, Dark Pool).
- Grain: one row per trading day per venue. Columns: date, venue, orders, fill_rate, latency_ms, notional_musd.
- Never add real, client or employer data. Generated CSVs and databases are gitignored.

## Writing rules
- Never use em dashes or en dashes in site copy, READMEs or commit messages. Use commas, periods, colons or "to" for ranges.
- Sentence case, plain verbs, short sentences.
- Exam facts (PL-300 weights, prices, limits) change. Cite the official Microsoft Learn study guide and flag anything uncertain.

## Design
- Graph-paper background, navy ink #1C2A3A, teal #1F7A8C, marker yellow #F2C94C, alert #C8553D.
- Fonts: Bricolage Grotesque (display), IBM Plex Sans (body), IBM Plex Mono (code).
- Light and dark themes via CSS variables in css/style.css. Keep both working.
- Must stay responsive and keyboard accessible.

## Workflow
- Test in a browser after changes: home page, one lesson per tab, and every lab.
- Add a dated entry to LOG in js/lessons.js for each meaningful change.
