# sports-buddy — Project Overview

## Summary

`sports-buddy` is a single-page React application that enables users to discover, create, and manage sports events and for admins to manage system data (events, sports, cities, areas) and view logs and dashboard statistics.

This document summarizes functionality, how things work (end-to-end), and exactly where to find the code that implements each feature.

## Core Functionality (what the app does)

- User authentication (register, login, reset password).
- View a list of sport events and event details.
- Create, edit and delete events (user + admin flows where applicable).
- Admin management: CRUD for events, sports, cities, areas.
- Admin dashboard: charts and statistics (uses `recharts`).
- Activity logs for admin review.

## How Things Work (end-to-end)

### 1) Authentication
- Firebase Authentication is used for sign-up, sign-in, and password reset.
- Where: `src/firebase.js` initializes Firebase; `src/contexts/AuthContext.jsx` provides auth state and helpers to the app.
- Pages/components: `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/ResetPassword.jsx`, and shared `src/components/AuthCard.jsx`.

Flow:
- The app initializes Firebase in `src/firebase.js`.
- `AuthContext` subscribes to Firebase auth state and exposes `user`, `signIn`, `signOut`, etc., to child components.
- Routes read `AuthContext` and may redirect unauthenticated users to login.

### 2) Event lifecycle (create → view → edit → delete)
- UI: `src/components/forms/EventForm.jsx` is the primary form for creating/editing events.
- Pages: `src/pages/AddEvent.jsx`, `src/pages/EditEvent.jsx`, `src/pages/EventList.jsx`, `src/pages/EventDetail.jsx`.
- Display: `src/components/EventCard.jsx` renders event summaries used in lists.
- Data layer: `src/utils/events.js` (and `src/utils/adminEvents.js` for admin-specific helpers) encapsulate Firestore CRUD operations.

Flow:
- User opens `EventList` which reads events via `events.js` and renders `EventCard` for each event.
- Viewing a specific event loads `EventDetail.jsx`, which requests the event document by id and displays fields.
- Creating or editing uses `EventForm.jsx` which validates inputs and calls functions in `events.js` to write to Firestore.
- Deletion is done via admin UI or via event actions that call `events.js` delete helpers.

### 3) Admin area and role checks
- Admin pages and components live under `src/components/admin/` and `src/pages/admin/`.
- `src/components/admin/AdminRoute.jsx` protects admin routes by checking the current user's admin claim (from Firebase custom claims).
- `scripts/make-admin.js` uses `firebase-admin` to set custom claims for a user (grant admin role).

Flow:
- Admin login is the same as user login; once a user has admin custom claim, `AdminRoute` allows access to admin pages.
- Admin pages include `AdminEvents.jsx`, `AdminDashboard.jsx`, `AdminSports.jsx`, `AdminCities.jsx`, `AdminAreas.jsx`, and `AdminLogs.jsx`.

### 4) Data model (collections — logical)
- `events` — primary collection for event documents (title, description, sport, city, area, datetime, location, createdBy, etc.).
- `sports` — list of sports (id, name, icon, optional metadata).
- `cities` / `areas` — location hierarchy for event locations.
- `logs` — admin activity logs (action, userId, timestamp, metadata).

Note: Exact field names live in the code where `events.js`, `sports.js`, `cities.js` handle reads/writes.

## Where to Find Code (file map)

- Project root: `package.json`, `vite.config.js`, `tailwind.config.js`, `firebase.json`, `firestore.rules`.
- Firebase initialization: `src/firebase.js`.
- Entry point: `src/main.jsx`, `index.html`.
- Global styles: `src/index.css`, `src/App.css`.

- Components (shared):
  - `src/components/Navbar.jsx`
  - `src/components/Layout.jsx`
  - `src/components/AuthCard.jsx`
  - `src/components/EventCard.jsx`
  - `src/components/SportCard.jsx`

- Forms:
  - `src/components/forms/EventForm.jsx`

- Admin components:
  - `src/components/admin/AdminNavbar.jsx`
  - `src/components/admin/AdminSidebar.jsx`
  - `src/components/admin/AdminLayout.jsx`
  - `src/components/admin/AdminCRUD.jsx`
  - `src/components/admin/AdminRoute.jsx`

- Pages (user):
  - `src/pages/EventList.jsx`
  - `src/pages/EventDetail.jsx`
  - `src/pages/AddEvent.jsx`
  - `src/pages/EditEvent.jsx`
  - `src/pages/Login.jsx`
  - `src/pages/Register.jsx`
  - `src/pages/ResetPassword.jsx`
  - `src/pages/Dashboard.jsx`
  - `src/pages/ProfileEdit.jsx`

- Pages (admin):
  - `src/pages/admin/AdminEvents.jsx`
  - `src/pages/admin/AdminAddEvent.jsx`
  - `src/pages/admin/AdminEditEvent.jsx`
  - `src/pages/admin/AdminEventDetails.jsx`
  - `src/pages/admin/AdminDashboard.jsx`
  - `src/pages/admin/AdminSports.jsx`
  - `src/pages/admin/AdminCities.jsx`
  - `src/pages/admin/AdminAreas.jsx`
  - `src/pages/admin/AdminLogs.jsx`

- Contexts:
  - `src/contexts/AuthContext.jsx` — provides auth state and helpers
  - `src/contexts/SidebarContext.jsx` — sidebar state shared in admin layout

- Utilities / data helpers:
  - `src/utils/events.js`
  - `src/utils/adminEvents.js`
  - `src/utils/sports.js`
  - `src/utils/cities.js`
  - `src/utils/areas.js`
  - `src/utils/logs.js`

- Scripts (server-side/admin tasks):
  - `scripts/make-admin.js` — grants admin custom claims using `firebase-admin`

## Tech Stack & Dependencies

- Frontend: `React 19` + `Vite` (`@vitejs/plugin-react`).
- Styling: `Tailwind CSS` + `PostCSS`.
- Backend: Firebase (Auth, Firestore, Hosting). `firebase-admin` used in scripts.
- Routing: `react-router-dom`.
- Charts: `recharts` (admin dashboard).
- Icons: `@heroicons/react`.
- Key dependencies are listed in `package.json`.

## Developer Setup & Common Commands

Install dependencies:

```powershell
npm install
```

Run dev server:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

Lint the repo:

```powershell
npm run lint
```

Deploy to Firebase Hosting (example):

```powershell
npm run build
firebase deploy --only hosting
```

## Notes, Known Gaps & Recommendations

- No explicit unit or integration tests found — consider adding Jest + React Testing Library for critical flows.
- Review `firestore.rules` to ensure proper security for read/write operations.
- Ensure tokens are refreshed after assigning admin custom claims (clients need to re-authenticate to see updated claims).
- Add a `README.md` developer section with environment variable instructions if any API keys or Firebase configs are stored via env files.

## Next Actions I Can Do (ask me to perform any):

- Add a concise `README.md` developer setup section and run commands.
- Generate a one-page PDF or ready-to-send Markdown tailored for your manager.
- Create a short data-model reference describing fields for each Firestore collection.

---

File created: `PROJECT_OVERVIEW.md`
