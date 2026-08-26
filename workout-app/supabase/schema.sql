-- FitTrack Database Schema
-- Run this in the Supabase SQL Editor to set up your database.

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS workouts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date        DATE        NOT NULL,
  duration    INTEGER,                -- minutes
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id            UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id    UUID  REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id   TEXT  NOT NULL,       -- references static JS exercise data
  exercise_name TEXT  NOT NULL,
  category      TEXT  NOT NULL,
  sort_order    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exercise_sets (
  id                   UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_exercise_id  UUID    REFERENCES workout_exercises(id) ON DELETE CASCADE NOT NULL,
  set_index            INTEGER NOT NULL DEFAULT 1,
  weight               NUMERIC(8,2),  -- lbs or kg
  reps                 INTEGER,       -- also used for cardio counts (steps, strokes, jumps)
  time_seconds         INTEGER,       -- for timed exercises (cardio, plank)
  distance             NUMERIC(6,2),  -- miles (canonical unit; UI converts to km for display)
  completed            BOOLEAN DEFAULT FALSE
);

-- Adds the distance column to a table created before this migration existed.
ALTER TABLE exercise_sets ADD COLUMN IF NOT EXISTS distance NUMERIC(6,2);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS workouts_user_id_idx    ON workouts (user_id);
CREATE INDEX IF NOT EXISTS workouts_date_idx       ON workouts (date DESC);
CREATE INDEX IF NOT EXISTS we_workout_id_idx       ON workout_exercises (workout_id);
CREATE INDEX IF NOT EXISTS sets_we_id_idx          ON exercise_sets (workout_exercise_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE workouts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets     ENABLE ROW LEVEL SECURITY;

-- workouts: users own their rows
DROP POLICY IF EXISTS "workouts_select" ON workouts;
DROP POLICY IF EXISTS "workouts_insert" ON workouts;
DROP POLICY IF EXISTS "workouts_update" ON workouts;
DROP POLICY IF EXISTS "workouts_delete" ON workouts;
CREATE POLICY "workouts_select" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workouts_insert" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workouts_update" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workouts_delete" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- workout_exercises: access through parent workout ownership
DROP POLICY IF EXISTS "workout_exercises_all" ON workout_exercises;
CREATE POLICY "workout_exercises_all" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
        AND workouts.user_id = auth.uid()
    )
  );

-- exercise_sets: access through parent workout_exercise → workout ownership
DROP POLICY IF EXISTS "exercise_sets_all" ON exercise_sets;
CREATE POLICY "exercise_sets_all" ON exercise_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = exercise_sets.workout_exercise_id
        AND w.user_id = auth.uid()
    )
  );

-- ============================================================
-- WORKOUT TEMPLATES
-- ============================================================

CREATE TABLE IF NOT EXISTS workout_templates (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT        NOT NULL,
  exercises  JSONB       NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS templates_user_id_idx ON workout_templates (user_id);

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_select" ON workout_templates;
DROP POLICY IF EXISTS "templates_insert" ON workout_templates;
DROP POLICY IF EXISTS "templates_update" ON workout_templates;
DROP POLICY IF EXISTS "templates_delete" ON workout_templates;
CREATE POLICY "templates_select" ON workout_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "templates_insert" ON workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "templates_update" ON workout_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "templates_delete" ON workout_templates FOR DELETE USING (auth.uid() = user_id);
