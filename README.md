# Vedagirivaripalle voter register

React + Vite static website for the 1,141 voters on the 2026 Gram Panchayat
list. Built mobile-first; read-only (no editing).

Pages: **Dashboard** (totals, village-wise and ward-wise counts) · **Voters**
(search in Telugu or English, filters by village, ward, gender, age and
relation, sort, CSV download) · **Analysis** (age and gender, village × ward,
largest households) · voter page with **family tree**.

## Sign-in
The site asks for a user id and password. At build time the voter list is
encrypted with them (AES-GCM, key from PBKDF2), so the published site contains
no readable voter data and no password. A wrong user id or password simply
fails to decrypt. The user id is not case-sensitive; the password is.

The values come from two environment variables:

| variable     | meaning   |
|--------------|-----------|
| `VOTER_USER` | user id   |
| `VOTER_PASS` | password  |

**Keep this GitHub repository private.** The plain list in
`src/data/voters.json` is part of the source, so anyone who can read the repo
can read the data, whatever the sign-in.

## Run on your laptop
```
cp .env.example .env   # then fill in VOTER_USER and VOTER_PASS
npm install
npm run dev            # opens http://localhost:5173
```
Sign-in needs a secure page (https or localhost). Opening the dev server from
a phone by IP address (http://192.168…) will not sign in; use the Render link.

## Deploy on Render
1. Push this folder to a **private** GitHub repository.
2. On render.com: **New → Blueprint**, pick the repo, enter `VOTER_USER` and
   `VOTER_PASS` when asked, click **Apply** (it reads `render.yaml`).
   Or **New → Static Site** with Build Command `npm ci && npm run build`,
   Publish Directory `dist`, and the two variables under **Environment**.
3. To change the password later, edit `VOTER_PASS` under Environment and
   redeploy. Everyone signs in again.

## Settings
`src/config.js`
- `SHOW_VOTER_ID` (default `false`): show voter ID card numbers on the voter
  page and in the CSV.

## Updating the data
Replace `src/data/voters.json` (same format) and push.
