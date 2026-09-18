# TaskQuest 🎯

A simple, gamified to-do app built for anyone to use — designed to feel fun for high
schoolers. People create an account, add tasks, mark them **Urgent 🔥 / Important ⭐ /
Someday 🌱**, and earn points, streaks, and levels as they complete things.

The project has three parts that all talk to the same backend:

```
taskquest/
├── server/   Node.js + Express API (auth, tasks, points/streaks) — Postgres database
├── web/      React + Vite web app (works in any browser, including phones)
└── mobile/   Expo (React Native) app for iOS/Android
```

## Changelog

**v1.7.0**
- Dev Tools now has a second, easier way to turn on: create a list named
  `Manchester2023` with the 🏀 emoji while logged in, and the panel unlocks
  for your account — no .env editing or server restart needed. Delete that
  list and it locks back. See **Turning on Dev Tools** below. (The old
  `ENABLE_DEV_TOOLS`/`VITE_ENABLE_DEV_TOOLS` env vars still work too, and now
  force it on for every account on that server.)

**v1.6.0**
- Guided tour — new accounts now get a short, automatic walkthrough that
  spotlights each real button (add task, priority filters, lists, level bar,
  streak, avatar, dashboard, achievements, dark mode) with a one-line
  explanation of what it does. Tap the new **?** button in the header
  anytime to see it again.
- Tidied up the main screen: added small "Lists" / "Priority" section
  labels above those rows, and shrank/collapsed a couple of header buttons
  on narrow phone screens so nothing gets cut off. No features were removed
  — everything works exactly as before, just easier to follow at a glance.

**v1.5.0**
- Dev Tools — an optional, off-by-default panel for testing your own account
  without grinding through real task completions: jump to any level, set your
  streak to any number, award yourself any badge, or fully reset your
  progress. Only affects your own points/streak/badges/avatar — never your
  tasks or lists. Hidden completely unless you turn it on yourself (see
  **Turning on Dev Tools** below); off by default everywhere, including
  anything you deploy publicly.

**v1.4.1** — bug fixes found during a full app test pass, no new features:
- Fixed: cancelling a repeating task series used to delete every day it had
  generated, including ones you'd already completed and gotten credit for.
  Now only the unfinished future days are removed — completed days stay in
  your history exactly like the confirmation message always said they would.
- Fixed: deleting a list that doesn't exist, while you only have one list
  left, showed a confusing "you need at least one list" message instead of
  "list not found."

**v1.4**
- Productivity dashboard — a new 📊 button in the header opens a stats page
  with 4 charts: **This week's XP** (daily total for the last 7 days),
  **Streak** (a 14-day activity calendar), **Category breakdown** (completed
  tasks per list, e.g. Homework vs Chores vs Job Apps), and **Most productive
  hour** (which hour of the day you complete the most tasks in). Every chart
  shows a friendly message instead of an empty graph until you have enough
  data. Hover or tab to any bar for the exact numbers.
- (The dashboard is currently in the web app only — not yet in mobile.)

**v1.3**
- Achievements & badges — a new 🏆 button in the header opens an Achievements
  page showing 4 badges: **Early Bird** (complete a task before 9 AM),
  **Zero Inbox** (finish every task in a list), **Streak Master** (reach a
  14-day streak), and **Scholar** (complete 10 homework tasks). Earning one
  during a session pops up a celebration banner with confetti. Badges are
  permanent once earned and don't affect points or streaks.
- (Badges are currently in the web app only — not yet in mobile.)

**v1.2**
- Character progression — a cosmetic avatar that levels up with you. Tap the
  avatar bubble at the top of the dashboard to open the picker; new
  animal/icon avatars unlock automatically as you hit higher levels (12
  total, from 🐣 at Level 1 up to 👑 at Level 15). Purely cosmetic — no effect
  on points, streaks, or gameplay.
- (Avatars are currently in the web app only — not yet in mobile.)

**v1.1**
- Repeating tasks — schedule a task to repeat daily for N days or until a date;
  each day becomes its own real, checkable task.
- Lists — organize tasks into named lists (every account starts with "Homework"
  and "Chores"); create, switch between, and delete lists from the web app.
- Database switched from local SQLite to Postgres, so data survives free hosting
  restarts/redeploys.
- (Lists and repeating tasks are currently in the web app only — not yet in mobile.)

**v1.0** — initial release: accounts, prioritized tasks (Urgent/Important/Someday),
points, streaks, levels, dark mode.

## Opening this in VS Code

1. Unzip the project anywhere on your computer.
2. Open **VS Code** → **File → Open Folder…** → select the `taskquest` folder (the
   one containing `server`, `web`, and `mobile`). Opening the top-level folder lets
   you see and edit all three parts from one window.
3. Open a terminal in VS Code (`` Ctrl+` `` / `` Cmd+` ``) — you'll use it to run the
   commands below. You can open multiple terminals (the `+` icon) to run the server
   and a client at the same time.

**Recommended VS Code extensions** (VS Code will likely prompt you to install these —
say yes): ESLint, Prettier, Tailwind CSS IntelliSense, and either the "Expo Tools" or
"React Native Tools" extension.

**Prerequisites:** [Node.js](https://nodejs.org) 18 or newer (which includes `npm`).
Check with `node -v` in a terminal.

## 1. Run the backend (do this first)

The web and mobile apps both need the API running.

```bash
cd server
npm install
cp .env.example .env
```

Before `npm start` will work, `server/.env` needs a `DATABASE_URL` — a connection
string for a Postgres database. The free, no-credit-card-required option this
project is set up for is [Neon](https://neon.tech): sign up, create a project, and
copy the connection string it gives you into `DATABASE_URL` in `server/.env`. (If
you have Postgres installed locally, any Postgres connection string works too.)

Then:

```bash
npm start
```

You should see `TaskQuest API listening on http://localhost:4000`. Leave this
terminal running. The database tables are created automatically the first time it
starts.

## 2. Run the web app

In a **new** terminal:

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Create an account and
start adding tasks. Because it's a normal web app, anyone can use it from their own
browser — you'd deploy `server` and `web` somewhere like Render/Railway (server) and
Vercel/Netlify (web) to let other people use it over the internet instead of just on
your machine.

## 3. Run the mobile app

In another new terminal:

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

This starts the Expo dev server and shows a QR code.

- **Easiest way to try it:** install the free **Expo Go** app on your phone (App
  Store / Play Store), make sure your phone is on the same Wi-Fi as your computer,
  and scan the QR code.
- If you're on a physical phone, open `mobile/.env` and set `EXPO_PUBLIC_API_URL` to
  `http://<your computer's LAN IP>:4000/api` (not `localhost`) — otherwise your
  phone can't reach the server running on your computer. Find your LAN IP with
  `ipconfig` (Windows) or `ifconfig`/`ipconfig getifaddr en0` (Mac).
- Android emulator: use `http://10.0.2.2:4000/api` instead.
- Press `i` in the terminal for the iOS simulator or `a` for the Android emulator,
  if you have them installed.

## Turning on Dev Tools (optional, for testing your own account)

Grinding through real task completions to see what a high level or a full badge
collection looks like is slow, so there's an optional **Dev Tools** panel that
lets you shortcut all of that on your own account: add points, jump straight to
a level, set your streak to any number, award yourself any badge, or reset
everything back to a fresh account. It's hidden by default and only ever
touches the account that's logged in — it can't be used to change anyone
else's points, streak, or badges.

**The easy way — no .env editing, works even on a deployed copy:** while
logged in, create a list named `Manchester2023` with the 🏀 (basketball)
emoji. That's it — a 🛠️ button appears in the header. Delete that same list
later and the button disappears again. Because this check happens on your own
account only, it's safe to leave in place even after you deploy the app for
other people — it just means anyone who knows the trick can unlock the panel
for *their own* account, the same way a cheat code works in a single-player
game.

**The other way — forces it on for every account on a server:** open
`server/.env`, change `ENABLE_DEV_TOOLS=false` to `ENABLE_DEV_TOOLS=true`, and
restart the server (`npm start`). Nobody needs to know the list trick — the
button just shows up for everyone who logs in. Useful for your own local
testing; leave it set to `false` on anything you deploy publicly, since it
removes the "only your own account" boundary the list trick has.

## Deploying so other people can use it

Running it on your own computer (above) only works while your computer is on and
that terminal is open. To give people a link they can open anytime, deploy it:

1. **Database — [Neon](https://neon.tech)** (free, no credit card, just a website).
   Create a project, copy its connection string.
2. **Backend — [Render](https://render.com)** (free). Push this project to a GitHub
   repo, then in Render: New → Web Service → connect the repo → set **Root
   Directory** to `server` → **Build Command** `npm install` → **Start Command**
   `npm start`. Add environment variables `DATABASE_URL` (your Neon connection
   string) and `JWT_SECRET` (any long random string) in Render's dashboard. Render
   gives you a public URL like `https://taskquest-server.onrender.com`.
   - Free tier note: it falls asleep after 15 minutes with no visitors and takes
     about a minute to wake back up on the next request. Fine for casual use among
     friends; upgrade later if that delay becomes annoying.
3. **Web app — [Netlify](https://netlify.com) or [Vercel](https://vercel.com)**
   (free, no sleep delay). Connect the same GitHub repo, set the project's root/base
   directory to `web`, build command `npm run build`, publish/output directory
   `dist`. Set the environment variable `VITE_API_URL` to your Render URL plus
   `/api` (e.g. `https://taskquest-server.onrender.com/api`). You'll get a public
   link like `https://taskquest.netlify.app` — that's what you share with people.

The mobile app follows separately, and is more involved (app stores require a paid
developer account and a review process) — worth tackling once the web version is
live and working for people.

## How the gamification works

- Completing an **Urgent** task earns 15 points, **Important** earns 10, **Someday**
  earns 5.
- Every 100 points = 1 level.
- Completing at least one task keeps your daily streak going; missing a full day
  resets it.

All of this logic lives in `server/src/lib/gamification.js` if you want to tune the
point values or add badges/rewards later.

## Project structure notes

- **Auth:** email + password, hashed with bcrypt, sessions via JWT (30-day expiry).
  Every user only ever sees their own tasks.
- **Database:** Postgres, via the `pg` package — pointed at a free hosted database
  (e.g. [Neon](https://neon.tech)) so your data survives even when the free hosting
  the server runs on restarts or redeploys. All the SQL lives in `server/src/routes`
  and `server/src/db`.
- **Styling:** Tailwind CSS on web, plain `StyleSheet`s on mobile, sharing the same
  color palette and priority scheme (`web/src/lib/priorities.js` and
  `mobile/src/lib/priorities.js`).
- Both apps talk to the API over plain REST (see `server/src/index.js` for routes).

## Next ideas

- Once deployed, point `mobile`'s `.env` at your live backend URL too, so the
  phone app works for anyone without needing your computer running.
- Add push notifications for due dates.
- Add a leaderboard among friends using the existing `points` field.
