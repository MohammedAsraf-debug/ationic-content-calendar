# ATIONIC CONTENT HUB

Internal content planning and production dashboard for **Ationic Digital Marketing Agency**.

A shared content calendar for two team members: plan what goes out, write it in one workspace,
move it through a production pipeline, and see each other's updates instantly.

**Stack:** React + TypeScript + Vite + Tailwind CSS + React Router + Firebase (Auth + Firestore).
Static frontend on Netlify — no custom backend.

---

## Contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Firebase setup](#firebase-setup)
5. [Environment variables](#environment-variables)
6. [Local development](#local-development)
7. [Production build](#production-build)
8. [Netlify deployment](#netlify-deployment)
9. [Firestore data model](#firestore-data-model)
10. [Security](#security)
11. [Testing](#testing)
12. [Keyboard shortcuts](#keyboard-shortcuts)
13. [Troubleshooting](#troubleshooting)

---

## Features

- **Calendar-first dashboard** — month grid with per-day content cards, month navigation, Today button.
- **Month summary cards** — Planned, Reels, Carousels, In Production, Scheduled, Published (calculated from Firestore).
- **Quick filters** — All / Reels / Carousels / Published / In Production / Scheduled, applied instantly.
- **Add content in < 30s** — title, type, date, platform, pillar, hook, CTA, priority, optional template.
- **Content workspace** — Idea, Hook, Script (Reel: Hook/Body/CTA · Carousel: 7 slides), Caption, CTA, Hashtags, References/Links, Notes. Autosaves as you type.
- **Production pipeline** — Idea → Script → Shoot → Edit → Review → Scheduled → Published. One click to move an item along, plus a detailed status dropdown (10 statuses).
- **Collaboration** — realtime Firestore listeners, "last updated by" + relative time, no manual refresh.
- **Content library** — search, filters, sort, inline status change, CSV export.
- **Analytics** — status / type / platform / pillar breakdowns and 6-month output, all live from Firestore.
- **Duplicate** (auto-numbers: `Title #2`) and **Delete** with confirmation.
- **Templates** — Reel, Carousel, Static Post, Story, YouTube structures pre-fill the workspace.
- **Nice-to-haves, all stable** — dark/light mode, `N` keyboard shortcut for Add Content, CSV export, responsive/mobile layout.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 (brand palette in `tailwind.config.js`) |
| Routing | React Router 6 |
| Auth | Firebase Authentication (email/password + Google) |
| Database | Cloud Firestore (realtime listeners) |
| Hosting | Netlify (static, SPA redirects) |

---

## Project structure

```
src/
  components/        UI building blocks (calendar, modals, pipeline, editor…)
  context/           AuthContext (Firebase auth) · UIContext (add-content modal, toasts)
  hooks/             useContent (shared realtime subscription) · useContentDraft (autosave)
  lib/               firebase init, Firestore service, date/filters/templates/CSV helpers
  pages/             Login · Dashboard (calendar) · ContentList · ContentWorkspace · Analytics
  types/             ContentItem type + all option lists
firestore.rules      Deployed rules (authenticated read/write only)
netlify.toml         Build config + SPA fallback + security headers
```

---

## Firebase setup

### 1. Create the project

1. Go to <https://console.firebase.google.com> → **Add project** (name it, e.g. `ationic-content-hub`).
2. Google Analytics is not required — disable it if prompted.

### 2. Register a web app

1. Project overview → the **`</>` (Web)** icon → register an app called `Ationic Content Hub`.
2. Firebase shows a `firebaseConfig` object. Keep it open, you need the six values next.

### 3. Enable Authentication

1. **Authentication** → **Get started**.
2. **Sign-in method** → enable **Email/Password** → Save.
3. **Sign-in method** → enable **Google** → pick a **support email** → Save.
   (The login page then shows "Continue with Google" next to the email form.)

### 4. Create the two user accounts

1. **Authentication** → **Users** → **Add user**.
2. Create both allowlisted accounts (`sudalaikannan.work@gmail.com`, `ationic.it@gmail.com`) with
   passwords, or let them sign in with Google once.
3. Set a **Display name** for each — that name is shown next to "Last updated by" and is never
   overwritten by the app afterwards.

> Both users have identical permissions: create, edit, delete, change status, add notes, update scripts.
> Do not add other accounts: `firestore.rules` rejects anyone outside the allowlist.

### 5. Create Firestore

1. **Firestore Database** → **Create database** → pick a region close to your team.
2. Start in **production mode** (rules are deployed in the next step).

### 6. Deploy the security rules

From the project folder (requires the Firebase CLI, `npm i -g firebase-tools` then `firebase login`):

```bash
firebase use --add          # link this folder to your Firebase project
firebase deploy --only firestore:rules,firestore:indexes
```

Or paste `firestore.rules` into **Firestore → Rules** in the console and publish.

---

## Environment variables

Create a `.env` file in the project root (see `.env.example`):

```bash
cp .env.example .env
```

```dotenv
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

Set them in **Netlify → Site settings → Environment variables** for production (mark them for all contexts).
`.env` is git-ignored, so credentials never enter the repository.

> The Firebase web config is public client configuration by design — access is controlled entirely by
> Authentication and Firestore rules. No service-account keys are used or required.

---

## Local development

```bash
npm install
cp .env.example .env      # then fill in your Firebase values
npm run dev               # http://localhost:5173
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run typecheck` | TypeScript only (no emit) |
| `npm run build` | Typecheck + production build into `dist/` |
| `npm run preview` | Serve the production build locally (SPA fallback included) |
| `npm run test:e2e` | Playwright end-to-end suite (see [Testing](#testing)) |

### Optional: develop against the Firebase Emulator Suite

Never touches production data. Requires Java and the Firebase CLI.

```bash
firebase emulators:start --only auth,firestore --project demo-ationic
npm run dev -- --mode emulator      # picks up .env.emulator.local
```

Create a throwaway user in the emulator (any email/password works):

```bash
curl -X POST "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"Test1234!","returnSecureToken":true}'
```

Emulator UI: <http://127.0.0.1:4000>.

---

## Production build

```bash
npm run build     # typechecks, then writes dist/
npm run preview   # verify the production bundle locally
```

Output is a static `dist/` folder — upload it anywhere that serves static files.

---

## Netlify deployment

### Option A — connect the Git repository (recommended)

1. Push this folder to GitHub/GitLab/Bitbucket.
2. Netlify → **Add new site → Import an existing project**.
3. Netlify detects Vite automatically; these come from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add the six `VITE_FIREBASE_*` variables under **Environment variables**.
5. **Deploy site**. Every push redeploys.

### Option B — manual deploy

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

### SPA routing

`netlify.toml` rewrites every path to `index.html`, so refreshing `/calendar`, `/content/abc123`
or `/analytics` never 404s:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

If you deploy manually and still get 404s, add a `public/_redirects` file containing:

```
/*  /index.html  200
```

### Authorized domains

Add your Netlify domain (**and any custom domain**) in
**Firebase Console → Authentication → Settings → Authorized domains**, otherwise sign-in fails on the deployed site.

---

## Firestore data model

Two collections, nothing more:

```
users/{userId}          displayName · email · lastSeenAt          (written on sign-in)

content/{contentId}     title · type · platform · publishDate · pillar · priority · status
                        hook · idea · script · caption · cta · hashtags · notes
                        references[] · carouselSlides[]
                        createdAt · updatedAt · createdBy · createdByName
                        updatedBy · updatedByName
```

- `publishDate` is a `YYYY-MM-DD` string (sorts and compares as plain text).
- `carouselSlides` always holds 7 entries so a Carousel never changes shape.
- `createdBy` / `updatedBy` hold the user id (enforced by rules); `*Name` holds the display name for the UI.

---

## Security

`firestore.rules` (deployed with `firebase deploy --only firestore:rules`):

```rules
match /content/{contentId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
                && request.resource.data.createdBy == request.auth.uid
                && request.resource.data.updatedBy == request.auth.uid
                && request.resource.data.title is string
                && request.resource.data.title.size() > 0
                && request.resource.data.publishDate is string;
  allow update: if request.auth != null
                && request.resource.data.createdBy == resource.data.createdBy
                && request.resource.data.updatedBy == request.auth.uid;
  allow delete: if request.auth != null;
}
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /{document=**} {
  allow read, write: if false;
}
```

- Signed-out visitors are redirected to `/login` and every content read is rejected by Firestore.
- Creators cannot be reassigned; every write is attributed to the editing user.
- No API keys, tokens or service accounts live in the repository.

### Allowed accounts

Only two accounts may use the app:

| Email | Email/Password | Google |
| --- | --- | --- |
| `sudalaikannan.work@gmail.com` | yes | yes |
| `ationic.it@gmail.com` | yes | yes |

`src/lib/authorizedEmails.ts` holds the list. Any other account is signed out the moment
it authenticates and sees *"This Google account is not authorized."* (or *"This email address is
not authorized."* for email/password). The client-side check runs in three places:

1. after `signInWithPopup` resolves,
2. after `signInWithEmailAndPassword` resolves,
3. on every restored session (`onAuthStateChanged`), which also covers a Google session that
   was cached by the browser.

The session guard runs while `loading` is still `true`, so `/calendar`, `/content`, `/analytics`
and `/content/:id` can never render for a rejected account — the router redirects to `/login`
first. To change who has access, edit `DEFAULT_AUTHORIZED_EMAILS` (or set
`VITE_AUTHORIZED_EMAILS` to a comma separated list, e.g. in `.env.emulator.local`); an empty value
falls back to the defaults so the app can never be locked for everyone.

> The allowlist is enforced twice: in the browser (above) for friendly UX, and in
> `firestore.rules` for security. See the next section.

### Firestore rules allowlist

`firestore.rules` gates every path on the same two accounts, so a bypassed client, a direct REST
call or a hand-written SDK script is rejected by the server:

```rules
function isAllowedUser() {
  return request.auth != null
         && request.auth.token.email in [
           "sudalaikannan.work@gmail.com",
           "ationic.it@gmail.com"
         ];
}
```

`isAllowedUser()` is required by `read`/`create`/`update`/`delete` on `/content/{contentId}` and by
`/users/{userId}` (which still requires `request.auth.uid == userId`); the catch-all
`match /{document=**} { allow read, write: if false; }` stays in place, and the creator
immutability / `updatedBy` attribution checks are unchanged. Changing who has access means editing
the list in **both** `firestore.rules` and `src/lib/authorizedEmails.ts` and redeploying:

```bash
firebase deploy --only firestore:rules
```

The emulator runs the same file, and the end-to-end suite signs in with the two allowlisted
addresses plus `outsider@ationic.com` to prove the denial, so the rules are verified before every
deploy.

---

## Testing

### Automated end-to-end suite

The suite runs against the Firebase emulators and covers: authentication (valid + invalid
credentials, Google sign-in button + cancelled pop-up, sign-out, blocked routes), profile display
names, calendar navigation, creating content, opening the workspace, autosave + reload persistence,
one-click status changes, duplicate, delete with confirmation, search/filters, templates, analytics,
deep links + refresh, and realtime sync between two simultaneous sessions.

```bash
npm i -D @playwright/test && npx playwright install chromium

firebase emulators:start --only auth,firestore --project demo-ationic   # terminal 1
npm run dev -- --mode emulator --port 5180                               # terminal 2

node e2e/seed.mjs                    # 2 allowlisted users + 1 outsider (safe to re-run)
npm run test:e2e                     # against the dev server on :5180
E2E_BASE_URL=http://localhost:4173 npm run test:e2e   # against the production build
```

### Manual smoke test after deploying

1. Open the Netlify URL while signed out → you land on `/login` and cannot reach `/calendar`.
2. Sign in with a wrong password → "Incorrect email or password."
3. **Continue with Google** → pick a Google account → you land on `/calendar`. Closing the
   pop-up shows "Google sign-in was cancelled."
4. Sign in → calendar shows the current month and month stats.
5. Press `N` → add content → it appears on the calendar instantly.
6. Click it → edit the script → the indicator shows "Saved…" → refresh → text is still there.
7. Click the **Editing** stage → status badge updates on the card.
8. Second browser, signed in as the other user → changes appear without refreshing.
9. Duplicate → `Title #2` is created · Delete → confirmation dialog works.
10. Refresh `/content/<id>` directly → no 404.

---

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `N` | Open the Add Content modal (ignored while typing in a field) |
| `Esc` | Close any modal |
| `Enter` / `⌘ + Enter` | Submit the open form |

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Access denied by Firestore rules" | Rules not deployed: `firebase deploy --only firestore:rules` |
| Sign-in fails on the deployed site | Add the Netlify domain to Firebase → Authentication → Authorized domains |
| "This sign-in method is not enabled…" | Google (or Email/Password) is off: Authentication → Sign-in method → enable it |
| "This domain is not authorised for sign-in" | Add the exact host to Authentication → Authorized domains (no protocol, no path) |
| Google pop-up opens but never returns | Blocked by a strict pop-up/ad blocker, or the browser blocks third-party cookies — allow pop-ups for the site |
| App loads but no data | Missing `VITE_FIREBASE_*` variables — redeploy after adding them |
| Login shows a config warning | `.env` missing or incomplete; restart `npm run dev` after editing it |
| Refresh on `/content/123` gives 404 | SPA redirect missing — check `netlify.toml` (or add `public/_redirects`) |
| Changes from the other person not showing | Confirm Firestore in the same project as your Auth; both users must be in the same Firebase project |