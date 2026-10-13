import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db, hash, token } from "./db";
import { Fault, limit } from "./service";
export async function staffSession(admin = false) {
  const c = await cookies();
  const s = c.get("de_staff")?.value;
  if (!s) throw new Fault("Please sign in to the staff portal.", 401);
  const result = (
    await (
      await db()
    ).query<{ id: string; role: string }>(
      `SELECT u.id,u.role FROM sessions s JOIN staff u ON u.id=s.staff_id WHERE s.token_hash=$1 AND s.expires>NOW()`,
      [hash(s)],
    )
  ).rows[0];
  if (!result)
    throw new Fault("Your staff session expired. Please sign in again.", 401);
  if (admin && result.role !== "admin")
    throw new Fault("Administrator access is required.", 403);
  return result;
}
export async function login(username: string, password: string, ip: string) {
  await limit(`login:${ip}`, 10);
  const user = (
    await (
      await db()
    ).query<{ id: string; password_hash: string; role: string }>(
      "SELECT * FROM staff WHERE id=$1",
      [username],
    )
  ).rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    throw new Fault("Incorrect username or password.", 401);
  const value = token();
  await (
    await db()
  ).query(`INSERT INTO sessions VALUES($1,$2,NOW()+INTERVAL '8 hours')`, [
    hash(value),
    user.id,
  ]);
  (await cookies()).set("de_staff", value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 3600,
  });
  return { id: user.id, role: user.role };
}
export async function logout() {
  const c = await cookies();
  const value = c.get("de_staff")?.value;
  if (value)
    await (
      await db()
    ).query("DELETE FROM sessions WHERE token_hash=$1", [hash(value)]);
  c.delete("de_staff");
}
