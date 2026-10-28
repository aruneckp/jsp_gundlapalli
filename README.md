# Vedagirivaripalle voter register

React + Vite static website. All 1,141 voter records are bundled in the app
(`src/data/voters.json`), so there is no server or database.

Tabs: **Search → Voter (view / edit) → Family → Edits**. The address keeps the
tab and voter (`#voter-104`), so the browser Back button and bookmarks work.

## Run on your laptop
```
npm install
npm run dev        # opens http://localhost:5173
```

## Deploy on Render (free, public)
1. Push this folder to a GitHub repository.
2. On render.com: **New → Blueprint**, pick the repo, click **Apply**
   (it reads `render.yaml`).
   Or **New → Static Site** with
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`
3. Render gives you a public link like `https://<name>.onrender.com`.
   Every push to GitHub redeploys automatically.

## Settings
`src/config.js`
- `SHOW_VOTER_ID` (default `false`): voter ID card numbers are hidden because
  the site is public. Set to `true` to show them.

## Edits
Saved in each visitor's browser (localStorage). The Edits tab exports a CSV of
the full list with changes, and imports such a CSV on another device.

## Updating the data
Replace `src/data/voters.json` (same format) and push.
