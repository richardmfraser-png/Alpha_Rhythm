# Publish Alpha Rhythm with GitHub Pages

1. Create a new GitHub repository, for example `alpha-rhythm`.
2. Upload the **contents** of the `web` folder to the repository root.
3. In GitHub, open **Settings -> Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. GitHub will provide a public HTTPS link after deployment.
7. Open that link on a phone.

## Save it like an app

### iPhone / iPad
Open the GitHub Pages link in Safari, tap **Share -> Add to Home Screen -> Add**.

The home-screen tile is configured to use the supplied Alpha Boys' School logo through `assets/apple-touch-icon.png`.

### Android
Open the link in Chrome and choose **Install app** or **Add to Home screen** when offered.

The installable web-app manifest uses the same supplied Alpha artwork through the 192px and 512px icon files.

## Before sharing with all 25 students

- Confirm the final programme name and Alpha's approval of the supplied branding.
- Confirm semester dates and target minutes.
- Decide what information mentors should receive.
- Test with 2-3 students for several days.
- Make sure students understand that pilot data is saved on their own device/browser.

## Updating the app

Edit the source files and push/upload the changed files to the same GitHub repository. GitHub Pages will republish automatically.

If students do not immediately see a future update, change the cache name near the top of `service-worker.js` to a new value so installed copies refresh their cached files.
