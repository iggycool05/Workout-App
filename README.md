# FitTrack

A full-stack workout tracker built with React and Supabase — log strength and cardio sessions, track progress over time, and keep going even when you're offline or your phone screen locks mid-set.

## Features

- **Workout logging** — build a session from an exercise library organized by muscle group, log sets with weight/reps or time, and mark them complete as you go.
- **Cardio tracking** — treadmill/bike distance (mi or km, your choice), rowing strokes, stair-master steps, jump-rope count, all paired with a live timer.
- **Background-safe timers** — the workout and rest timers keep running even if you switch apps or your phone screen turns off.
- **Progress charts** — per-exercise history with selectable metrics (max weight, volume, est. 1RM, distance, time) across line/bar/area charts and custom date ranges.
- **Custom charts** — build your own comparisons across exercises and time periods.
- **Body weight tracker** — log weigh-ins separately from workouts.
- **Interactive muscle map** — see which muscles an exercise targets at a glance.
- **Exercise notes & templates** — save per-exercise cues (tempo, seat height, etc.) and reusable workout templates.
- **Offline support** — workouts logged without a connection are queued locally and synced automatically once you're back online.
- **Installable PWA** — add it to your home screen on iOS/Android like a native app.

## Tech stack

- **Frontend:** React 19, React Router 7, Vite, Tailwind CSS 4
- **Backend:** Supabase (Postgres, Auth, Row Level Security)
- **Charts:** Recharts
- **Other:** `vite-plugin-pwa` for offline/installable support, `date-fns`, `lucide-react`

## Getting started

```bash
git clone https://github.com/iggycool05/Workout-App.git
cd Workout-App/workout-app
npm install
```

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run [`workout-app/supabase/schema.sql`](workout-app/supabase/schema.sql) to set up the tables and Row Level Security policies.
3. Copy `workout-app/.env.example` to `workout-app/.env.local` and fill in your project's URL and anon key (Project Settings → API):
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Run it:
   ```bash
   npm run dev
   ```

## Deployment

Configured for [Vercel](https://vercel.com) out of the box (`vercel.json` handles client-side routing rewrites). Set the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment variables in your Vercel project settings.

## License

GPL-3.0 — see [LICENSE](LICENSE).
