# Alpha Rhythm - customization guide

Most programme changes are in **config.js**.

## Rename the programme

Change:

```js
brand: {
  appName: "Alpha Rhythm",
  organization: "Alpha School of Music",
  tagline: "Practice. Purpose. Progress."
}
```

The codebase can still be adapted for another student programme or a personal Road to 75 variant.

## Change the semester length

Set `program.defaultWeeks` to the desired number of weeks. Students can also change their individual semester length in Settings.

## Change default daily targets

Edit:

```js
defaultTargets: {
  practice: 60,
  reading: 20,
  mindfulness: 10,
  exercise: 30
}
```

Students can adjust targets in Settings. For an institutional rollout, Alpha should decide which targets are fixed, recommended or individually set.

## Change the daily habits

Edit the `habits` array. Each habit needs:

- `id`: short unique key with no spaces
- `label`: what students see
- `unit`: normally `min`
- `help`: short description

If you add a new habit, also add a matching starting value in `program.defaultTargets`.

## Alpha branding

The supplied Alpha Boys' School artwork is stored at:

`assets/alpha-boys-school-logo.png`

The home-screen and browser icons are derived from that same artwork:

- `assets/apple-touch-icon.png` - iPhone/iPad home screen
- `assets/icon-192.png` - web app manifest
- `assets/icon-512.png` - web app manifest
- `assets/favicon-32.png` and `favicon-16.png` - browser tabs

Brand colors are defined at the top of `styles.css`. The current palette is sampled from the supplied artwork: crimson `#BF002D`, cream `#F5EFD5`, and deep ink `#252212`.

If Alpha later supplies a different approved identity file, replace the logo and regenerate the icon sizes rather than stretching or redrawing the artwork.

## Central staff dashboard

This pilot is local-first. Do not treat it as a centralized student-record system. For central reporting, add authentication and a backend only after Alpha decides what staff may see, how long data is retained, and how consent/privacy should work.
