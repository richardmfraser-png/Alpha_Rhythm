# Alpha Rhythm - branded pilot

Alpha Rhythm is a local-first, mobile-friendly student self-management app designed for a semester pilot at Alpha School of Music.

## Branding in this build

This version uses the supplied Alpha Boys' School artwork and a palette sampled directly from it:

- Alpha crimson: `#BF002D`
- Alpha cream: `#F5EFD5`
- Deep ink: `#252212`

The same supplied artwork is used for the browser favicon and home-screen app icon. The app does not redraw or replace the logo.

## What it does

- Daily "My 3" deliverables
- Music practice, reading/study, mindfulness/meditation and exercise tracking
- Morning intention and private evening reflection
- Semester goals and progress tracking
- Weekly check-in and mentor-ready summary
- CSV export, JSON backup/restore
- Installable/offline-capable when hosted on HTTPS (for example GitHub Pages)
- No leaderboard

## Data model / privacy

This pilot stores each student's information in that browser/device using localStorage. It does **not** send data to a central server. Private daily reflections are excluded from mentor summaries and from CSV unless the student explicitly enables them.

For a 25-student pilot, the simplest workflow is one shared app URL plus weekly student-generated mentor summaries. A later phase can add accounts, centralized staff dashboards and role-based permissions after Alpha confirms its reporting and privacy requirements.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Customize

Edit `config.js` to change the programme name, semester length and default targets. See `CUSTOMIZE.md`.
