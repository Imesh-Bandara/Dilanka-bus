"use client";
import { useTranslation } from "./locale";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Ticket,
  BusFront,
  ScanLine,
  Settings,
  LogOut,
  Plus,
  ArrowRight,
  CheckCircle2,
  Camera,
  Upload,
  Download,
  RefreshCw,
  X,
  Route as RouteIcon,
  ShieldCheck,
  Search,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { api, post, Notice, Loading } from "./site";
import { SeatMap } from "./booking";
import {
  type Trip,
  type Bus,
  type Route,
  money,
  dateLabel,
  time,
  sriDate,
} from "@/lib/types";
import { buses as templates } from "@/lib/seed";
type StaffBooking = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  status: string;
  trip_id: string;
  total: number;
  tickets: { id: string; seat: number; passenger: string; status: string }[];
};
type StaffData = {
  trips: Trip[];
  bookings: StaffBooking[];
  policy: {
    cutoffMinutes: number;
    cancellationMinutes: number;
    holdMinutes: number;
    bagKg: number;
    arrivalMinutes: number;
  };
  buses?: Bus[];
  routes?: Route[];
  audit?: { id: number; action: string; actor: string; created_at: string }[];
  role: string;
};
export function Staff() {
  const tr = useTranslation();
  const [user, setUser] = useState<{ id: string; role: string } | null>(null),
    [ready, setReady] = useState(false),
    [username, setUsername] = useState("admin"),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false),
    [data, setData] = useState<StaffData | null>(null),
    [tab, setTab] = useState("overview"),
    [query, setQuery] = useState(""),
    [selectedTrip, setSelectedTrip] = useState(""),
    [editTrip, setEditTrip] = useState<Partial<Trip> | null>(null),
    [reset, setReset] = useState(""),
    [confirmCancel, setConfirmCancel] = useState<StaffBooking | null>(null),
    [blockSeat, setBlockSeat] = useState(""),
    [showBus, setShowBus] = useState(false),
    [showRoute, setShowRoute] = useState(false);
  const load = async () => {
    const d = await api<StaffData>("staff/data");
    setData(d);
    setSelectedTrip(
      (old) =>
        old ||
        d.trips.find((t) => new Date(t.departure) > new Date())?.id ||
        d.trips[0]?.id ||
        "",
    );
  };
  useEffect(() => {
    api("staff/session")
      .then(async (u) => {
        setUser(u);
        await load();
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  const mutate = async (path: string, body: unknown, message: string) => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await post(`staff/${path}`, body);
      setSuccess(message);
      await load();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  if (!ready) return <Loading />;
  if (!user)
    return (
      <div className="staff-login-wrap">
        <div className="container staff-login-grid">
          <div className="staff-welcome">
            <img
              src="/images/dilanka-lineup.webp"
              alt={tr("Dilanka Express team and fleet")}
            />
            <div>
              <span className="eyebrow">
                {tr("THE PEOPLE BEHIND THE JOURNEY")}
              </span>
              <h2>
                {tr(" Every good journey ")}
                <br />
                <em>{tr("starts with you.")}</em>
              </h2>
              <p>
                {tr(
                  " The Dilanka journey desk. Departures, passengers and a warm welcome, all in one place. ",
                )}
              </p>
            </div>
          </div>
          <form
            className="staff-login panel"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                setUser(await post("staff/login", { username, password }));
                setPassword("");
                await load();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <span className="staff-icon">
              <ShieldCheck size={28} />
            </span>
            <span className="eyebrow">
              {tr("DILANKA EXPRESS · OPERATIONS")}
            </span>
            <h1>
              {tr(" Welcome to ")}
              <br />
              <em>{tr("the journey desk.")}</em>
            </h1>
            <p>{tr("Sign in to manage demo departures and tickets.")}</p>
            {error && <Notice type="error">{tr(error)}</Notice>}
            <label>
              {tr(" Username ")}
              <input
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              {tr(" Password ")}
              <input
                autoComplete="current-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button disabled={busy} className="button button-dark full-width">
              {tr(busy ? "Signing in…" : "Sign in to staff portal")}
              <ArrowRight size={17} />
            </button>
            <small>
              {tr("Access is provided by the prototype administrator.")}
            </small>
          </form>
        </div>
      </div>
    );
  if (!data) return <Loading />;
  const admin = user.role === "admin",
    trip = data.trips.find((t) => t.id === selectedTrip),
    bookings = data.bookings.filter(
      (b) =>
        !query ||
        `${b.reference} ${b.name} ${b.phone}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ),
    manifest = data.bookings.filter(
      (b) => b.trip_id === selectedTrip && b.status === "confirmed",
    );
  const confirmed = data.bookings.filter((b) => b.status === "confirmed");
  const tabs: [string, string, LucideIcon][] = [
    ["overview", "Overview", LayoutDashboard],
    ["bookings", "Bookings", Ticket],
    ["trips", "Departures", BusFront],
    ["scanner", "Check-in", ScanLine],
    ...(admin
      ? ([
          ["fleet", "Fleet & routes", RouteIcon],
          ["settings", "Settings", Settings],
        ] as [string, string, LucideIcon][])
      : []),
  ];
  function csv() {
    if (!trip) return;
    const lines = [
      ["Reference", "Passenger", "Seat", "Phone", "Status"].map((label) =>
        tr(label),
      ),
      ...manifest.flatMap((b) =>
        b.tickets.map((t) => [
          b.reference,
          t.passenger,
          String(t.seat),
          b.phone,
          tr(t.status),
        ]),
      ),
    ];
    const safe = (v: string) =>
      `"${(/^[=+@-]/.test(v) ? "'" : "") + v.replaceAll('"', '""')}"`;
    const blob = new Blob(
      ["\uFEFF" + lines.map((row) => row.map(safe).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `manifest-${trip.id}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  return (
    <div className="staff-shell">
      <aside className="staff-sidebar">
        <span className="eyebrow">{tr("OPERATIONS")}</span>
        <h2>{tr("The journey desk.")}</h2>
        <nav>
          {tabs.map(([key, label, Icon]) => (
            <button
              className={tab === key ? "active" : ""}
              key={key}
              onClick={() => {
                setTab(key);
                setError("");
                setSuccess("");
              }}
            >
              <Icon size={19} />
              {tr(label)}
            </button>
          ))}
        </nav>
        <div className="staff-user">
          <span className="avatar">{tr(user.id[0].toUpperCase())}</span>
          <div>
            <strong>{tr(user.id)}</strong>
            <small>
              {tr(user.role === "admin" ? "Administrator" : "Check-in staff")}
            </small>
          </div>
        </div>
        <button
          className="text-link"
          onClick={async () => {
            await post("staff/logout", {});
            setUser(null);
            setData(null);
          }}
        >
          <LogOut size={16} />
          {tr(" Sign out ")}
        </button>
      </aside>
      <div className="staff-content">
        <div className="staff-title">
          <div>
            <span className="eyebrow">
              {tr(" DEMO OPERATIONS · NO LIVE TRANSACTIONS ")}
            </span>
            <h1>{tr(tabs.find((t) => t[0] === tab)?.[1])}</h1>
          </div>
          <button
            className="button button-outline"
            onClick={() => load().catch((e) => setError(e.message))}
          >
            <RefreshCw size={16} />
            {tr(" Refresh ")}
          </button>
        </div>
        {error && <Notice type="error">{tr(error)}</Notice>}
        {success && (
          <Notice type="success">
            <CheckCircle2 size={17} />
            {tr(success)}
          </Notice>
        )}
        {tab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="panel">
                <span>{tr("Confirmed bookings")}</span>
                <strong>{tr(confirmed.length)}</strong>
                <small>{tr("Confirmed in this preview")}</small>
              </div>
              <div className="panel">
                <span>{tr("Seats reserved")}</span>
                <strong>
                  {tr(confirmed.reduce((s, b) => s + b.tickets.length, 0))}
                </strong>
                <small>{tr("Across demo departures")}</small>
              </div>
              <div className="panel">
                <span>{tr("Checked in")}</span>
                <strong>
                  {tr(
                    confirmed
                      .flatMap((b) => b.tickets)
                      .filter((t) => t.status === "checked_in").length,
                  )}
                </strong>
                <small>{tr("Individual QR tickets")}</small>
              </div>
              <div className="panel">
                <span>{tr("Simulated booking value")}</span>
                <strong className="stat-money">
                  {tr(money(confirmed.reduce((s, b) => s + b.total, 0)))}
                </strong>
                <small>{tr("No money collected")}</small>
              </div>
            </div>
            <div className="panel">
              <div className="section-heading">
                <h2>{tr("Next on the road.")}</h2>
                <button className="text-link" onClick={() => setTab("trips")}>
                  {tr(" All departures ")}
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{tr("Route")}</th>
                      <th>{tr("Departure")}</th>
                      <th>{tr("Vehicle")}</th>
                      <th>{tr("Availability")}</th>
                      <th>{tr("Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.trips
                      .filter((t) => new Date(t.departure) > new Date())
                      .slice(0, 8)
                      .map((t) => (
                        <tr key={t.id}>
                          <td>
                            <strong>
                              {tr(t.route.origin)} → {tr(t.route.destination)}
                            </strong>
                            <small>{tr(t.route.via)}</small>
                          </td>
                          <td>
                            {tr(dateLabel(t.departure))}
                            <small>{tr(time(t.departure))}</small>
                          </td>
                          <td>{tr(t.bus.registration)}</td>
                          <td>
                            {tr(t.available)} / {tr(t.bus.capacity)}
                          </td>
                          <td>
                            <span className="badge">{tr(t.status)}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {tab === "bookings" && (
          <div className="panel">
            <div className="section-heading">
              <h2>{tr("Every passenger, accounted for.")}</h2>
              <div className="search-field">
                <Search size={17} />
                <input
                  aria-label={tr("Search bookings")}
                  placeholder={tr("Reference, name or phone")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{tr("Booking")}</th>
                    <th>{tr("Passenger")}</th>
                    <th>{tr("Seats")}</th>
                    <th>{tr("Demo value")}</th>
                    <th>{tr("Status")}</th>
                    <th>{tr("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.reference}</strong>
                        <small>
                          {tr(
                            data.trips.find((t) => t.id === b.trip_id)?.route
                              .origin,
                          )}
                          {tr(" ")}→{tr(" ")}
                          {tr(
                            data.trips.find((t) => t.id === b.trip_id)?.route
                              .destination,
                          )}
                        </small>
                      </td>
                      <td>
                        {b.name}
                        <small>{b.phone}</small>
                      </td>
                      <td>{tr(b.tickets.map((t) => t.seat).join(", "))}</td>
                      <td>{tr(money(b.total))}</td>
                      <td>
                        <span className="badge">{tr(b.status)}</span>
                      </td>
                      <td>
                        <Link
                          className="text-link"
                          href={`/ticket/${b.id}`}
                          target="_blank"
                        >
                          {tr(" View tickets ")}
                        </Link>
                        {admin && b.status === "confirmed" && (
                          <button
                            className="danger-text"
                            onClick={() => setConfirmCancel(b)}
                          >
                            {tr(" Cancel ")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!bookings.length && (
                <div className="empty-state">
                  <Ticket />
                  <h3>{tr("No bookings yet.")}</h3>
                  <p>{tr("Create a guest booking to see it here.")}</p>
                  <Link href="/search" className="text-link">
                    {tr(" Try a booking ")}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        {tab === "trips" && (
          <>
            <div className="panel">
              <div className="section-heading">
                <h2>{tr("Departures & manifests")}</h2>
                {admin && (
                  <button
                    className="button button-dark"
                    onClick={() =>
                      setEditTrip({
                        route_id: data.routes?.[0].id,
                        bus_id: data.buses?.[0].id,
                        fare: 269500,
                        fee: 10000,
                        status: "open",
                      })
                    }
                  >
                    <Plus size={16} />
                    {tr(" Add departure ")}
                  </button>
                )}
              </div>
              <label>
                {tr(" Choose a departure ")}
                <select
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                >
                  {data.trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {tr(t.route.origin)} → {tr(t.route.destination)} ·
                      {tr(" ")}
                      {tr(dateLabel(t.departure))} {tr(time(t.departure))} ·
                      {tr(" ")}
                      {tr(t.bus.registration)}
                    </option>
                  ))}
                </select>
              </label>
              {trip && (
                <>
                  <div className="manifest-heading">
                    <div>
                      <h3>
                        {tr(trip.route.origin)} → {tr(trip.route.destination)}
                      </h3>
                      <p>
                        {tr(dateLabel(trip.departure))} ·{" "}
                        {tr(time(trip.departure))} ·{tr(" ")}
                        {tr(trip.bus.registration)} · {tr(trip.status)}
                      </p>
                    </div>
                    <div className="button-row">
                      <button className="button button-outline" onClick={csv}>
                        <Download size={16} />
                        {tr(" Export manifest ")}
                      </button>
                      {admin && (
                        <button
                          className="button button-outline"
                          onClick={() => setEditTrip(trip)}
                        >
                          {tr(" Edit departure ")}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>{tr("Seat")}</th>
                          <th>{tr("Passenger")}</th>
                          <th>{tr("Reference")}</th>
                          <th>{tr("Phone")}</th>
                          <th>{tr("Boarding status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manifest.flatMap((b) =>
                          b.tickets.map((t) => (
                            <tr key={t.id}>
                              <td>
                                <strong>{tr(t.seat)}</strong>
                              </td>
                              <td>{t.passenger}</td>
                              <td>{b.reference}</td>
                              <td>{b.phone}</td>
                              <td>
                                <span className="badge">
                                  {tr(t.status.replace("_", " "))}
                                </span>
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                    {!manifest.length && (
                      <p className="muted-text">
                        {tr(" No confirmed passengers on this departure. ")}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            {admin && trip && (
              <div className="panel seat-control">
                <div>
                  <h2>{tr("Keep a seat aside.")}</h2>
                  <p>
                    {tr(
                      " Block unsold seats for operational needs. Held or booked seats are protected. ",
                    )}
                  </p>
                  <label>
                    {tr(" Seat number ")}
                    <input
                      type="number"
                      min="1"
                      max={trip.bus.capacity}
                      value={blockSeat}
                      onChange={(e) => setBlockSeat(e.target.value)}
                    />
                  </label>
                  <div className="button-row">
                    <button
                      disabled={busy || !blockSeat}
                      className="button button-dark"
                      onClick={() =>
                        mutate(
                          "block",
                          {
                            tripId: trip.id,
                            seat: Number(blockSeat),
                            blocked: true,
                          },
                          "Seat blocked.",
                        )
                      }
                    >
                      {tr(" Block seat ")}
                    </button>
                    <button
                      disabled={busy || !blockSeat}
                      className="button button-outline"
                      onClick={() =>
                        mutate(
                          "block",
                          {
                            tripId: trip.id,
                            seat: Number(blockSeat),
                            blocked: false,
                          },
                          "Seat released.",
                        )
                      }
                    >
                      {tr(" Unblock ")}
                    </button>
                  </div>
                  <p>
                    {tr("Blocked: ")}
                    {tr(trip.blocked.join(", ") || "None")}
                  </p>
                </div>
                <SeatMap
                  trip={trip}
                  selected={[]}
                  onSelect={(n) => setBlockSeat(String(n))}
                />
              </div>
            )}
          </>
        )}
        {tab === "scanner" && <Scanner trips={data.trips} onChange={load} />}
        {tab === "fleet" && admin && (
          <>
            <div className="section-heading">
              <h2>{tr("Vehicles & seat templates")}</h2>
              <button
                className="button button-dark"
                onClick={() => setShowBus(true)}
              >
                <Plus size={16} />
                {tr(" Add demo vehicle ")}
              </button>
            </div>
            <div className="fleet-grid">
              {data.buses?.map((b) => (
                <div className="panel" key={b.id}>
                  <BusFront size={25} />
                  <h3>{tr(b.registration)}</h3>
                  <p>{tr(b.name)}</p>
                  <strong>
                    {tr(b.capacity)} {tr(" seats")}
                  </strong>
                  <p className="small-note">{tr(b.amenities.join(" · "))}</p>
                </div>
              ))}
            </div>
            <div className="section-heading">
              <h2>{tr("Route variants")}</h2>
              <button
                className="button button-outline"
                onClick={() => setShowRoute(true)}
              >
                <Plus size={16} />
                {tr(" Add route variant ")}
              </button>
            </div>
            <div className="panel">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{tr("Route")}</th>
                      <th>{tr("Via")}</th>
                      <th>{tr("Stops")}</th>
                      <th>{tr("Source status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.routes?.map((r) => (
                      <tr key={r.id}>
                        <td>
                          {tr(r.origin)} → {tr(r.destination)}
                        </td>
                        <td>{tr(r.via)}</td>
                        <td>{tr(r.stops.length)}</td>
                        <td>
                          <small>{tr(r.source)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Notice>
                {tr(
                  " Assigned routes and layouts are protected. Create a new variant when the stop order or seat numbering changes. ",
                )}
              </Notice>
            </div>
          </>
        )}
        {tab === "settings" && admin && (
          <>
            <form
              className="panel"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                mutate(
                  "policy",
                  Object.fromEntries(
                    Object.keys(data.policy).map((k) => [k, Number(f.get(k))]),
                  ),
                  "Demo policies updated.",
                );
              }}
            >
              <h2>{tr("Demo booking policies")}</h2>
              <p>
                {tr(
                  " These editable rules are prototype assumptions, pending Dilanka approval. ",
                )}
              </p>
              <div className="form-grid">
                {Object.entries(data.policy).map(([key, value]) => (
                  <label key={key}>
                    {tr(
                      (
                        {
                          cutoffMinutes: "Booking cutoff (minutes)",
                          cancellationMinutes: "Cancellation cutoff (minutes)",
                          holdMinutes: "Seat hold duration (minutes)",
                          bagKg: "Bag allowance (kg)",
                          arrivalMinutes: "Arrive before boarding (minutes)",
                        } as Record<string, string>
                      )[key],
                    )}
                    <input
                      key={`${key}-${value}`}
                      type="number"
                      name={key}
                      min={key === "holdMinutes" ? 1 : 0}
                      max={
                        key === "holdMinutes"
                          ? 15
                          : key === "bagKg"
                            ? 50
                            : key === "arrivalMinutes"
                              ? 180
                              : 1440
                      }
                      defaultValue={value}
                      required
                    />
                  </label>
                ))}
              </div>
              <button className="button button-dark" disabled={busy}>
                {tr(" Save policies ")}
              </button>
            </form>
            <div className="panel">
              <h2>{tr("Demo maintenance")}</h2>
              <p>
                {tr(
                  " Add the next two weeks of sample departures without changing existing bookings. ",
                )}
              </p>
              <button
                className="button button-outline"
                disabled={busy}
                onClick={() =>
                  mutate(
                    "seed",
                    {},
                    "Upcoming demonstration departures are ready.",
                  )
                }
              >
                <RefreshCw size={16} />
                {tr(" Refresh upcoming demo trips ")}
              </button>
              <hr />
              <h3>{tr("Reset all demo bookings")}</h3>
              <p>
                {tr(
                  " This removes all demo passenger records and tickets and releases their seats. It does not alter routes or vehicle templates. ",
                )}
              </p>
              <label>
                {tr(" Type RESET DEMO BOOKINGS ")}
                <input
                  value={reset}
                  onChange={(e) => setReset(e.target.value)}
                />
              </label>
              <button
                className="button button-danger"
                disabled={busy || reset !== "RESET DEMO BOOKINGS"}
                onClick={async () => {
                  if (
                    await mutate(
                      "reset",
                      { confirm: reset },
                      "Demo bookings reset.",
                    )
                  )
                    setReset("");
                }}
              >
                {tr(" Reset demo bookings ")}
              </button>
            </div>
            <div className="panel">
              <h2>{tr("Recent activity")}</h2>
              {data.audit?.map((a) => (
                <div className="audit-row" key={a.id}>
                  <span>
                    {tr(a.action).replaceAll(".", " · ").replaceAll("_", " ")}
                  </span>
                  <small>
                    {tr(a.actor)} · {tr(dateLabel(a.created_at))}{" "}
                    {tr(time(a.created_at))}
                  </small>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {confirmCancel && (
        <Modal
          error={error}
          title={tr("Cancel this demo booking?")}
          close={() => setConfirmCancel(null)}
        >
          <p>
            {confirmCancel.reference} · {confirmCancel.name}
          </p>
          <p>
            {tr(
              " This releases its seats and invalidates all unboarded QR tickets. No refund or message is sent. ",
            )}
          </p>
          <button
            className="button button-danger"
            disabled={busy}
            onClick={async () => {
              if (
                await mutate(
                  "cancel",
                  { id: confirmCancel.id },
                  "Booking cancelled and seats released.",
                )
              )
                setConfirmCancel(null);
            }}
          >
            {tr(" Cancel booking ")}
          </button>
        </Modal>
      )}
      {editTrip && (
        <Modal
          error={error}
          title={tr(editTrip.id ? "Edit departure" : "Create a demo departure")}
          close={() => setEditTrip(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const body = {
                id: editTrip.id,
                routeId: f.get("routeId"),
                busId: f.get("busId"),
                departure: new Date(
                  `${f.get("departure")}:00+05:30`,
                ).toISOString(),
                arrival: new Date(`${f.get("arrival")}:00+05:30`).toISOString(),
                fare: Math.round(Number(f.get("fare")) * 100),
                fee: Math.round(Number(f.get("fee")) * 100),
                status: f.get("status"),
              };
              if (await mutate("trip", body, "Departure saved."))
                setEditTrip(null);
            }}
          >
            <label>
              {tr(" Route ")}
              <select name="routeId" defaultValue={editTrip.route_id}>
                {data.routes?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {tr(r.origin)} → {tr(r.destination)} · {tr(r.via)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {tr(" Vehicle ")}
              <select name="busId" defaultValue={editTrip.bus_id}>
                {data.buses?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {tr(b.registration)} · {tr(b.capacity)} {tr(" seats ")}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                {tr(" Departure · Sri Lanka time ")}
                <input
                  required
                  type="datetime-local"
                  name="departure"
                  defaultValue={
                    editTrip.departure ? localInput(editTrip.departure) : ""
                  }
                />
              </label>
              <label>
                {tr(" Arrival · Sri Lanka time ")}
                <input
                  required
                  type="datetime-local"
                  name="arrival"
                  defaultValue={
                    editTrip.arrival ? localInput(editTrip.arrival) : ""
                  }
                />
              </label>
              <label>
                {tr(" Fare · LKR ")}
                <input
                  required
                  type="number"
                  min="0"
                  step=".01"
                  name="fare"
                  defaultValue={(editTrip.fare || 0) / 100}
                />
              </label>
              <label>
                {tr(" Service fee · LKR ")}
                <input
                  required
                  type="number"
                  min="0"
                  step=".01"
                  name="fee"
                  defaultValue={(editTrip.fee || 0) / 100}
                />
              </label>
            </div>
            <label>
              {tr(" Status ")}
              <select name="status" defaultValue={editTrip.status || "open"}>
                <option value="open">{tr("Open for booking")}</option>
                <option value="closed">{tr("Closed")}</option>
                <option value="cancelled">{tr("Cancelled")}</option>
              </select>
            </label>
            <Notice>
              {tr(
                " Departures with confirmed bookings cannot be edited. Cancel bookings first to preserve valid tickets and seat mappings. ",
              )}
            </Notice>
            <button disabled={busy} className="button button-dark">
              {tr(" Save departure ")}
            </button>
          </form>
        </Modal>
      )}
      {showBus && (
        <Modal
          error={error}
          title={tr("Add a demo vehicle")}
          close={() => setShowBus(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                capacity = Number(f.get("capacity"));
              const template = templates.find((b) => b.capacity === capacity)!;
              if (
                await mutate(
                  "bus",
                  {
                    id: `demo-${crypto.randomUUID()}`,
                    name: f.get("name"),
                    registration: f.get("registration"),
                    capacity,
                    layout: template.layout,
                    amenities: String(f.get("amenities"))
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                  "Vehicle template added.",
                )
              )
                setShowBus(false);
            }}
          >
            <label>
              {tr(" Coach name ")}
              <input required name="name" placeholder={tr("Luxury express")} />
            </label>
            <label>
              {tr(" Demo registration ")}
              <input
                required
                name="registration"
                placeholder={tr("DEMO-NEW")}
              />
            </label>
            <label>
              {tr(" Numbered seat template ")}
              <select name="capacity">
                <option>49</option>
                <option>51</option>
                <option>53</option>
              </select>
            </label>
            <label>
              {tr(" Amenities · comma separated ")}
              <input
                name="amenities"
                defaultValue="Air conditioning, Reclining seats"
              />
            </label>
            <button disabled={busy} className="button button-dark">
              {tr(" Add vehicle ")}
            </button>
          </form>
        </Modal>
      )}
      {showRoute && (
        <Modal
          error={error}
          title={tr("Add a route variant")}
          close={() => setShowRoute(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                names = String(f.get("stops"))
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                duration = Number(f.get("duration"));
              if (names.length < 2) {
                setError("Add at least two stops.");
                return;
              }
              if (
                await mutate(
                  "route",
                  {
                    id: `route-${crypto.randomUUID()}`,
                    name: f.get("name"),
                    origin: names[0],
                    destination: names.at(-1),
                    via: names.slice(1, -1).join(" · ") || "Direct",
                    stops: names.map((name, i) => ({
                      name,
                      offset: Math.round((i * duration) / (names.length - 1)),
                      location: `${name} bus stand · demo location`,
                    })),
                    duration,
                    departure: "09:00",
                    fare: Math.round(Number(f.get("fare")) * 100),
                    busId: data.buses?.[0].id,
                    source:
                      "Staff-created demo variant; intermediate times are illustrative",
                  },
                  "Route variant added.",
                )
              )
                setShowRoute(false);
            }}
          >
            <label>
              {tr(" Route name ")}
              <input
                required
                name="name"
                placeholder={tr("The coastal connection")}
              />
            </label>
            <label>
              {tr(" Ordered stops · comma separated ")}
              <textarea
                required
                name="stops"
                placeholder={tr("Ampara, Monaragala, Matara")}
              />
            </label>
            <label>
              {tr(" Total duration · minutes ")}
              <input
                required
                type="number"
                name="duration"
                min="30"
                defaultValue="420"
              />
            </label>
            <label>
              {tr(" Sample flat fare · LKR ")}
              <input
                required
                type="number"
                name="fare"
                min="0"
                defaultValue="2695"
              />
            </label>
            <Notice>
              {tr(
                " Stop times are evenly spaced sample offsets. Create a dated departure after adding the route. ",
              )}
            </Notice>
            <button disabled={busy} className="button button-dark">
              {tr(" Add route ")}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function localInput(value: string) {
  return new Date(new Date(value).getTime() + 330 * 60000)
    .toISOString()
    .slice(0, 16);
}
function Modal({
  title,
  close,
  children,
  error,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  error?: string;
}) {
  const tr = useTranslation();
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current
      ?.querySelector<HTMLElement>("button,input,select,textarea")
      ?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = Array.from(
          dialog.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]),input,select,textarea,a[href]",
          ) || [],
        );
        const first = nodes[0],
          last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        ref={dialog}
        className="modal panel"
        role="dialog"
        aria-modal="true"
        aria-label={tr(title)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="section-heading">
          <h2>{tr(title)}</h2>
          <button
            aria-label={tr("Close dialog")}
            className="icon-button"
            onClick={close}
          >
            <X />
          </button>
        </div>
        {error && <Notice type="error">{tr(error)}</Notice>}
        {tr(children)}
      </section>
    </div>
  );
}
function Scanner({
  trips,
  onChange,
}: {
  trips: Trip[];
  onChange: () => Promise<void>;
}) {
  const tr = useTranslation();
  const [tripId, setTripId] = useState(
      trips.find((t) => new Date(t.departure) > new Date())?.id || "",
    ),
    [value, setValue] = useState(""),
    [result, setResult] = useState<any>(null),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false),
    [camera, setCamera] = useState(false),
    [found, setFound] = useState<any[]>([]);
  const video = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    frame = useRef<number>(0),
    tokenRef = useRef("");
  const stop = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    cancelAnimationFrame(frame.current);
    setCamera(false);
  };
  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(frame.current);
    },
    [],
  );
  function extract(s: string) {
    try {
      return new URL(s).pathname.split("/verify/")[1] || s;
    } catch {
      return s;
    }
  }
  async function verify(raw = value) {
    setBusy(true);
    setError("");
    setSuccess("");
    setResult(null);
    setFound([]);
    const parsed = extract(raw.trim());
    tokenRef.current = parsed;
    try {
      if (parsed.startsWith("DE-")) {
        const b = await api(`staff/booking/${parsed}`);
        setFound(b.tickets);
        return;
      }
      setResult(await api(`verify/${encodeURIComponent(parsed)}`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function start() {
    setError("");
    setCamera(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      stream.current = media;
      setTimeout(async () => {
        if (!video.current) {
          stop();
          return;
        }
        video.current.srcObject = media;
        await video.current.play();
        const { default: jsQR } = await import("jsqr"),
          canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        const tick = () => {
          const v = video.current;
          if (v && v.readyState >= 2) {
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height),
              qr = jsQR(image.data, image.width, image.height);
            if (qr) {
              stop();
              setValue(qr.data);
              verify(qr.data);
              return;
            }
          }
          frame.current = requestAnimationFrame(tick);
        };
        tick();
      }, 100);
    } catch {
      stop();
      setError(
        "Camera access is unavailable. Upload a QR image or enter the ticket link/reference instead.",
      );
    }
  }
  async function upload(file: File) {
    setError("");
    try {
      const bitmap = await createImageBitmap(file),
        canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height),
        { default: jsQR } = await import("jsqr"),
        qr = jsQR(image.data, image.width, image.height);
      bitmap.close();
      if (!qr)
        throw new Error(
          "No QR found. Upload a sharp image of the full QR code.",
        );
      setValue(qr.data);
      await verify(qr.data);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="scanner-layout">
      <div className="panel">
        <span className="eyebrow">{tr("A WARM WELCOME STARTS HERE")}</span>
        <h2>{tr("Check in a passenger.")}</h2>
        <label>
          {tr(" Departure ")}
          <select
            value={tripId}
            onChange={(e) => {
              setTripId(e.target.value);
              setResult(null);
              setSuccess("");
            }}
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {tr(t.route.origin)} → {tr(t.route.destination)} ·{tr(" ")}
                {tr(dateLabel(t.departure))} {tr(time(t.departure))} ·{tr(" ")}
                {tr(t.bus.registration)}
              </option>
            ))}
          </select>
        </label>
        <div className="scanner-view">
          {camera ? (
            <video ref={video} playsInline muted />
          ) : (
            <>
              <ScanLine size={66} />
              <p>{tr("Scan a demo ticket’s QR code.")}</p>
              <small>
                {tr("Camera scanning requires HTTPS or localhost.")}
              </small>
            </>
          )}
        </div>
        <div className="button-row">
          <button
            className="button button-dark"
            onClick={camera ? stop : start}
          >
            <Camera size={17} />
            {tr(camera ? "Stop camera" : "Start camera")}
          </button>
          <label className="button button-outline upload-label">
            <Upload size={17} />
            {tr(" Upload QR ")}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) upload(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
        >
          <label>
            {tr(" Ticket link, token or booking reference ")}
            <input
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={tr("Paste a QR link or DE-XXXXXXXXXX")}
            />
          </label>
          <button className="button button-outline full-width" disabled={busy}>
            {tr(" Verify ticket ")}
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
      <div>
        <div className="panel">
          <h2>{tr("Ticket result")}</h2>
          {error && <Notice type="error">{tr(error)}</Notice>}
          {success && <Notice type="success">{tr(success)}</Notice>}
          {!result && !found.length && !error && !success && (
            <p>
              {tr(
                " Scan or enter a ticket to see its status. Viewing a ticket never checks it in automatically. ",
              )}
            </p>
          )}
          {found.map((t) => (
            <button
              className="ticket-picker"
              key={t.id}
              onClick={() => {
                setValue(t.qr_token);
                verify(t.qr_token);
              }}
            >
              <span>
                {tr(" Seat ")}
                {tr(t.seat)} · {t.passenger}
                <small>{tr(t.status.replace("_", " "))}</small>
              </span>
              <ArrowRight size={18} />
            </button>
          ))}
          {result && (
            <>
              <span
                className={`success-icon ${result.valid ? "" : "cancelled"}`}
              >
                {result.valid ? <CheckCircle2 /> : <X />}
              </span>
              <h3>
                {tr("Seat ")}
                {tr(result.seat)}
              </h3>
              <p>
                {tr(result.route.origin)} → {tr(result.route.destination)}
              </p>
              <p>
                {tr(dateLabel(result.departure))} · {tr(time(result.departure))}
              </p>
              <span className="badge">
                {tr(result.status.replace("_", " "))}
              </span>
              {result.trip_id !== tripId && (
                <Notice type="error">
                  {tr(" This ticket belongs to a different departure. ")}
                </Notice>
              )}
              <button
                className="button button-dark full-width"
                disabled={busy || !result.valid || result.trip_id !== tripId}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await post("staff/checkin", {
                      token: tokenRef.current,
                      tripId,
                    });
                    setSuccess(`Seat ${result.seat} checked in successfully.`);
                    setResult(null);
                    await onChange();
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {tr(" Confirm check-in ")}
                <CheckCircle2 size={17} />
              </button>
            </>
          )}
        </div>
        <Notice>
          {tr(
            " Demo validation only. Check-in opens 24 hours before departure and detects repeat use. No offline check-in is supported. ",
          )}
        </Notice>
      </div>
    </div>
  );
}
