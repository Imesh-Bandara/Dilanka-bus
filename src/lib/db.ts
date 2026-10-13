import { randomBytes, createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { buses, routes } from "./seed";
import { sriDate } from "./types";
export type DB = {
  query: <T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: T[] }>;
  exec: (sql: string) => Promise<unknown>;
};
type State = {
  db: DB;
  raw?: DB;
  pool?: import("pg").Pool;
  ready?: Promise<void>;
  queue: Promise<unknown>;
};
const globals = globalThis as typeof globalThis & {
  dilankaState?: Promise<State>;
};
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export const token = () => randomBytes(24).toString("base64url");
async function initialize(): Promise<State> {
  let state: State;
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
    state = {
      db: {
        query: (sql, p) => pool.query(sql, p) as any,
        exec: (sql) => pool.query(sql),
      },
      pool,
      queue: Promise.resolve(),
    };
  } else {
    if (process.env.VERCEL)
      throw new Error("DATABASE_URL is required on Vercel.");
    const { PGlite } = await import("@electric-sql/pglite");
    await fs.mkdir(".data", { recursive: true });
    const pg = new PGlite(
      path.resolve(process.env.DEMO_DB_PATH || ".data/demo-postgres"),
    );
    await pg.waitReady;
    state = { db: pg as unknown as DB, queue: Promise.resolve() };
  }
  await state.db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW())",
  );
  if (
    !(
      await state.db.query(
        "SELECT version FROM schema_migrations WHERE version='001'",
      )
    ).rows.length
  ) {
    await state.db.exec(
      await fs.readFile(
        path.join(process.cwd(), "migrations/001_initial.sql"),
        "utf8",
      ),
    );
    await state.db.query(
      "INSERT INTO schema_migrations(version) VALUES('001') ON CONFLICT DO NOTHING",
    );
  }
  await state.db.query(
    `INSERT INTO settings VALUES ('policy',$1) ON CONFLICT DO NOTHING`,
    [
      JSON.stringify({
        cutoffMinutes: 180,
        cancellationMinutes: 180,
        holdMinutes: 5,
        bagKg: 15,
        arrivalMinutes: 30,
      }),
    ],
  );
  for (const b of buses)
    await state.db.query(
      "INSERT INTO buses VALUES ($1,$2) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data",
      [b.id, JSON.stringify(b)],
    );
  for (const r of routes)
    await state.db.query(
      "INSERT INTO routes VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [r.id, JSON.stringify(r)],
    );
  let password = process.env.STAFF_PASSWORD;
  let checkin = process.env.STAFF_CHECKIN_PASSWORD;
  if (!password) {
    if (process.env.VERCEL)
      throw new Error("STAFF_PASSWORD is required on Vercel.");
    const count = await state.db.query<{ n: number }>(
      "SELECT COUNT(*)::integer AS n FROM staff",
    );
    if (!count.rows[0].n) {
      password = token().slice(0, 20);
      checkin = token().slice(0, 20);
      await fs.writeFile(
        ".data/staff-access.txt",
        `Local demo access\nAdministrator: admin\nPassword: ${password}\nCheck-in staff: conductor\nPassword: ${checkin}\n`,
      );
    }
  }
  if (password)
    await state.db.query(
      `INSERT INTO staff VALUES ('admin',$1,'admin') ON CONFLICT(id) DO UPDATE SET password_hash=EXCLUDED.password_hash`,
      [await bcrypt.hash(password, 12)],
    );
  if (checkin)
    await state.db.query(
      `INSERT INTO staff VALUES ('conductor',$1,'checkin') ON CONFLICT(id) DO UPDATE SET password_hash=EXCLUDED.password_hash`,
      [await bcrypt.hash(checkin, 12)],
    );
  await seedTrips(state.db);
  if (!state.pool) {
    const raw = state.db;
    state.raw = raw;
    const enqueue = <T>(run: () => Promise<T>) => {
      const pending = state.queue.then(run, run);
      state.queue = pending.then(
        () => {},
        () => {},
      );
      return pending;
    };
    state.db = {
      query: (sql, p) => enqueue(() => raw.query(sql, p)) as any,
      exec: (sql) => enqueue(() => raw.exec(sql)),
    };
  }
  return state;
}
export async function seedTrips(db: DB) {
  const today = sriDate();
  for (let day = 0; day < 15; day++) {
    const d = new Date(`${today}T12:00:00+05:30`);
    d.setUTCDate(d.getUTCDate() + day);
    const date = sriDate(d);
    for (const r of routes) {
      const id = `${r.id}-${date}`;
      const dep = new Date(`${date}T${r.departure}:00+05:30`);
      await db.query(
        `INSERT INTO trips VALUES ($1,$2,$3,$4,$5,$6,10000,'open') ON CONFLICT DO NOTHING`,
        [
          id,
          r.id,
          r.busId,
          dep.toISOString(),
          new Date(dep.getTime() + r.duration * 60000).toISOString(),
          r.fare,
        ],
      );
      const bus = buses.find((b) => b.id === r.busId)!;
      await db.query(
        "INSERT INTO inventory(trip_id,seat) SELECT $1,generate_series(1,$2::int) ON CONFLICT DO NOTHING",
        [id, bus.capacity],
      );
    }
  }
}
export const state = () =>
  (globals.dilankaState ??= initialize().catch((e) => {
    globals.dilankaState = undefined;
    throw e;
  }));
export async function db() {
  return (await state()).db;
}
export async function transaction<T>(fn: (db: DB) => Promise<T>): Promise<T> {
  const s = await state();
  if (s.pool) {
    const client = await s.pool.connect();
    try {
      await client.query("BEGIN");
      const value = await fn({
        query: (sql, p) => client.query(sql, p) as any,
        exec: (sql) => client.query(sql),
      });
      await client.query("COMMIT");
      return value;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
  const raw = s.raw!;
  const run = async () => {
    await raw.exec("BEGIN");
    try {
      const value = await fn(raw);
      await raw.exec("COMMIT");
      return value;
    } catch (e) {
      await raw.exec("ROLLBACK");
      throw e;
    }
  };
  const pending = s.queue.then(run, run);
  s.queue = pending.then(
    () => {},
    () => {},
  );
  return pending;
}
