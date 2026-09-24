# Alpha Rhythm - start here

This package contains the Alpha-branded pilot app plus shareable implementation material for Steve and the Alpha School of Music team.

## Fastest preview

Open **Alpha_Rhythm_Standalone.html** on a laptop/desktop. It is a single-file preview with the new Alpha crimson/cream identity and the supplied Alpha Boys' School logo.

For a student phone rollout, publish the **web/** folder to GitHub Pages and share the resulting HTTPS link.

## Home-screen icon

This build is already configured so that **Add to Home Screen / Install App uses a copy of the supplied Alpha logo** rather than the old AR placeholder:

- iPhone/iPad: `web/assets/apple-touch-icon.png`
- Android/PWA: `web/assets/icon-192.png` and `web/assets/icon-512.png`

The full supplied logo is also retained as `web/assets/alpha-boys-school-logo.png`.

## Share with Alpha staff

Send **docs/Alpha_Rhythm_Staff_Input_Note.pdf** (or the editable Word version). It asks for the five decisions that should shape the pilot before all 25 students start.

## Read the implementation guide

**docs/Alpha_Rhythm_Implementation_Guide.pdf** explains the features, pilot model, customization, deployment and the key privacy limitation of the pilot.

## App files

The **web/** folder contains the GitHub Pages/PWA version:
- index.html
- styles.css
- app.js
- config.js
- manifest.webmanifest
- service-worker.js
- assets/

Programme settings are in **web/config.js**. Branding and app-icon details are in **web/CUSTOMIZE.md**.

## Important pilot limitation

Data is stored locally in each student's browser/device. There is no central staff dashboard yet. Students can generate a weekly mentor summary and export data. Central accounts/reporting remain a Phase 2 decision after Alpha confirms what staff should see and what should remain private.
