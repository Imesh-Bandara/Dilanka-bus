"use client";
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
          <span className="eyebrow">DILANKA EXPRESS · OPERATIONS</span>
          <h1>
            A smooth journey
            <br />
            starts behind the scenes.
          </h1>
          <p>Sign in to manage demo departures and tickets.</p>
          {error && <Notice type="error">{error}</Notice>}
          <label>
            Username
            <input
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button disabled={busy} className="button button-dark full-width">
            {busy ? "Signing in…" : "Sign in to staff portal"}
            <ArrowRight size={17} />
          </button>
          <small>Access is provided by the prototype administrator.</small>
        </form>
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
      ["Reference", "Passenger", "Seat", "Phone", "Status"],
      ...manifest.flatMap((b) =>
        b.tickets.map((t) => [
          b.reference,
          t.passenger,
          String(t.seat),
          b.phone,
          t.status,
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
        <span className="eyebrow">OPERATIONS</span>
        <h2>The journey desk.</h2>
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
              {label}
            </button>
          ))}
        </nav>
        <div className="staff-user">
          <span className="avatar">{user.id[0].toUpperCase()}</span>
          <div>
            <strong>{user.id}</strong>
            <small>
              {user.role === "admin" ? "Administrator" : "Check-in staff"}
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
          Sign out
        </button>
      </aside>
      <div className="staff-content">
        <div className="staff-title">
          <div>
            <span className="eyebrow">
              DEMO OPERATIONS · NO LIVE TRANSACTIONS
            </span>
            <h1>{tabs.find((t) => t[0] === tab)?.[1]}</h1>
          </div>
          <button
            className="button button-outline"
            onClick={() => load().catch((e) => setError(e.message))}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        {error && <Notice type="error">{error}</Notice>}
        {success && (
          <Notice type="success">
            <CheckCircle2 size={17} />
            {success}
          </Notice>
        )}
        {tab === "overview" && (
          <>
            <div className="stats-grid">
              <div className="panel">
                <span>Confirmed bookings</span>
                <strong>{confirmed.length}</strong>
                <small>Saved in PostgreSQL</small>
              </div>
              <div className="panel">
                <span>Seats reserved</span>
                <strong>
                  {confirmed.reduce((s, b) => s + b.tickets.length, 0)}
                </strong>
                <small>Across demo departures</small>
              </div>
              <div className="panel">
                <span>Checked in</span>
                <strong>
                  {
                    confirmed
                      .flatMap((b) => b.tickets)
                      .filter((t) => t.status === "checked_in").length
                  }
                </strong>
                <small>Individual QR tickets</small>
              </div>
              <div className="panel">
                <span>Simulated booking value</span>
                <strong className="stat-money">
                  {money(confirmed.reduce((s, b) => s + b.total, 0))}
                </strong>
                <small>No money collected</small>
              </div>
            </div>
            <div className="panel">
              <div className="section-heading">
                <h2>Next on the road.</h2>
                <button className="text-link" onClick={() => setTab("trips")}>
                  All departures <ArrowRight size={16} />
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Vehicle</th>
                      <th>Availability</th>
                      <th>Status</th>
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
                              {t.route.origin} → {t.route.destination}
                            </strong>
                            <small>{t.route.via}</small>
                          </td>
                          <td>
                            {dateLabel(t.departure)}
                            <small>{time(t.departure)}</small>
                          </td>
                          <td>{t.bus.registration}</td>
                          <td>
                            {t.available} / {t.bus.capacity}
                          </td>
                          <td>
                            <span className="badge">{t.status}</span>
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
              <h2>Every passenger, accounted for.</h2>
              <div className="search-field">
                <Search size={17} />
                <input
                  aria-label="Search bookings"
                  placeholder="Reference, name or phone"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Passenger</th>
                    <th>Seats</th>
                    <th>Demo value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.reference}</strong>
                        <small>
                          {
                            data.trips.find((t) => t.id === b.trip_id)?.route
                              .origin
                          }{" "}
                          →{" "}
                          {
                            data.trips.find((t) => t.id === b.trip_id)?.route
                              .destination
                          }
                        </small>
                      </td>
                      <td>
                        {b.name}
                        <small>{b.phone}</small>
                      </td>
                      <td>{b.tickets.map((t) => t.seat).join(", ")}</td>
                      <td>{money(b.total)}</td>
                      <td>
                        <span className="badge">{b.status}</span>
                      </td>
                      <td>
                        <Link
                          className="text-link"
                          href={`/ticket/${b.id}`}
                          target="_blank"
                        >
                          View tickets
                        </Link>
                        {admin && b.status === "confirmed" && (
                          <button
                            className="danger-text"
                            onClick={() => setConfirmCancel(b)}
                          >
                            Cancel
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
                  <h3>No bookings yet.</h3>
                  <p>Create a guest booking to see it here.</p>
                  <Link href="/search" className="text-link">
                    Try a booking <ArrowRight size={16} />
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
                <h2>Departures & manifests</h2>
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
                    Add departure
                  </button>
                )}
              </div>
              <label>
                Choose a departure
                <select
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                >
                  {data.trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.route.origin} → {t.route.destination} ·{" "}
                      {dateLabel(t.departure)} {time(t.departure)} ·{" "}
                      {t.bus.registration}
                    </option>
                  ))}
                </select>
              </label>
              {trip && (
                <>
                  <div className="manifest-heading">
                    <div>
                      <h3>
                        {trip.route.origin} → {trip.route.destination}
                      </h3>
                      <p>
                        {dateLabel(trip.departure)} · {time(trip.departure)} ·{" "}
                        {trip.bus.registration} · {trip.status}
                      </p>
                    </div>
                    <div className="button-row">
                      <button className="button button-outline" onClick={csv}>
                        <Download size={16} />
                        Export manifest
                      </button>
                      {admin && (
                        <button
                          className="button button-outline"
                          onClick={() => setEditTrip(trip)}
                        >
                          Edit departure
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Seat</th>
                          <th>Passenger</th>
                          <th>Reference</th>
                          <th>Phone</th>
                          <th>Boarding status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manifest.flatMap((b) =>
                          b.tickets.map((t) => (
                            <tr key={t.id}>
                              <td>
                                <strong>{t.seat}</strong>
                              </td>
                              <td>{t.passenger}</td>
                              <td>{b.reference}</td>
                              <td>{b.phone}</td>
                              <td>
                                <span className="badge">
                                  {t.status.replace("_", " ")}
                                </span>
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                    {!manifest.length && (
                      <p className="muted-text">
                        No confirmed passengers on this departure.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            {admin && trip && (
              <div className="panel seat-control">
                <div>
                  <h2>Keep a seat aside.</h2>
                  <p>
                    Block unsold seats for operational needs. Held or booked
                    seats are protected.
                  </p>
                  <label>
                    Seat number
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
                      Block seat
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
                      Unblock
                    </button>
                  </div>
                  <p>Blocked: {trip.blocked.join(", ") || "None"}</p>
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
              <h2>Vehicles & seat templates</h2>
              <button
                className="button button-dark"
                onClick={() => setShowBus(true)}
              >
                <Plus size={16} />
                Add demo vehicle
              </button>
            </div>
            <div className="fleet-grid">
              {data.buses?.map((b) => (
                <div className="panel" key={b.id}>
                  <BusFront size={25} />
                  <h3>{b.registration}</h3>
                  <p>{b.name}</p>
                  <strong>{b.capacity} seats</strong>
                  <p className="small-note">{b.amenities.join(" · ")}</p>
                </div>
              ))}
            </div>
            <div className="section-heading">
              <h2>Route variants</h2>
              <button
                className="button button-outline"
                onClick={() => setShowRoute(true)}
              >
                <Plus size={16} />
                Add route variant
              </button>
            </div>
            <div className="panel">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Via</th>
                      <th>Stops</th>
                      <th>Source status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.routes?.map((r) => (
                      <tr key={r.id}>
                        <td>
                          {r.origin} → {r.destination}
                        </td>
                        <td>{r.via}</td>
                        <td>{r.stops.length}</td>
                        <td>
                          <small>{r.source}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Notice>
                Assigned routes and layouts are protected. Create a new variant
                when the stop order or seat numbering changes.
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
              <h2>Demo booking policies</h2>
              <p>
                These editable rules are prototype assumptions, pending Dilanka
                approval.
              </p>
              <div className="form-grid">
                {Object.entries(data.policy).map(([key, value]) => (
                  <label key={key}>
                    {
                      (
                        {
                          cutoffMinutes: "Booking cutoff (minutes)",
                          cancellationMinutes: "Cancellation cutoff (minutes)",
                          holdMinutes: "Seat hold duration (minutes)",
                          bagKg: "Bag allowance (kg)",
                          arrivalMinutes: "Arrive before boarding (minutes)",
                        } as Record<string, string>
                      )[key]
                    }
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
                Save policies
              </button>
            </form>
            <div className="panel">
              <h2>Demo maintenance</h2>
              <p>
                Add the next two weeks of sample departures without changing
                existing bookings.
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
                Refresh upcoming demo trips
              </button>
              <hr />
              <h3>Reset all demo bookings</h3>
              <p>
                This removes all demo passenger records and tickets and releases
                their seats. It does not alter routes or vehicle templates.
              </p>
              <label>
                Type RESET DEMO BOOKINGS
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
                Reset demo bookings
              </button>
            </div>
            <div className="panel">
              <h2>Recent activity</h2>
              {data.audit?.map((a) => (
                <div className="audit-row" key={a.id}>
                  <span>
                    {a.action.replaceAll(".", " · ").replaceAll("_", " ")}
                  </span>
                  <small>
                    {a.actor} · {dateLabel(a.created_at)} {time(a.created_at)}
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
          title="Cancel this demo booking?"
          close={() => setConfirmCancel(null)}
        >
          <p>
            {confirmCancel.reference} · {confirmCancel.name}
          </p>
          <p>
            This releases its seats and invalidates all unboarded QR tickets. No
            refund or message is sent.
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
            Cancel booking
          </button>
        </Modal>
      )}
      {editTrip && (
        <Modal
          error={error}
          title={editTrip.id ? "Edit departure" : "Create a demo departure"}
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
              Route
              <select name="routeId" defaultValue={editTrip.route_id}>
                {data.routes?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.origin} → {r.destination} · {r.via}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Vehicle
              <select name="busId" defaultValue={editTrip.bus_id}>
                {data.buses?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.registration} · {b.capacity} seats
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Departure · Sri Lanka time
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
                Arrival · Sri Lanka time
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
                Fare · LKR
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
                Service fee · LKR
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
              Status
              <select name="status" defaultValue={editTrip.status || "open"}>
                <option value="open">Open for booking</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <Notice>
              Departures with confirmed bookings cannot be edited. Cancel
              bookings first to preserve valid tickets and seat mappings.
            </Notice>
            <button disabled={busy} className="button button-dark">
              Save departure
            </button>
          </form>
        </Modal>
      )}
      {showBus && (
        <Modal
          error={error}
          title="Add a demo vehicle"
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
              Coach name
              <input required name="name" placeholder="Luxury express" />
            </label>
            <label>
              Demo registration
              <input required name="registration" placeholder="DEMO-NEW" />
            </label>
            <label>
              Numbered seat template
              <select name="capacity">
                <option>49</option>
                <option>51</option>
                <option>53</option>
              </select>
            </label>
            <label>
              Amenities · comma separated
              <input
                name="amenities"
                defaultValue="Air conditioning, Reclining seats"
              />
            </label>
            <button disabled={busy} className="button button-dark">
              Add vehicle
            </button>
          </form>
        </Modal>
      )}
      {showRoute && (
        <Modal
          error={error}
          title="Add a route variant"
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
              Route name
              <input
                required
                name="name"
                placeholder="The coastal connection"
              />
            </label>
            <label>
              Ordered stops · comma separated
              <textarea
                required
                name="stops"
                placeholder="Ampara, Monaragala, Matara"
              />
            </label>
            <label>
              Total duration · minutes
              <input
                required
                type="number"
                name="duration"
                min="30"
                defaultValue="420"
              />
            </label>
            <label>
              Sample flat fare · LKR
              <input
                required
                type="number"
                name="fare"
                min="0"
                defaultValue="2695"
              />
            </label>
            <Notice>
              Stop times are evenly spaced sample offsets. Create a dated
              departure after adding the route.
            </Notice>
            <button disabled={busy} className="button button-dark">
              Add route
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
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="section-heading">
          <h2>{title}</h2>
          <button
            aria-label="Close dialog"
            className="icon-button"
            onClick={close}
          >
            <X />
          </button>
        </div>
        {error && <Notice type="error">{error}</Notice>}
        {children}
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
        <span className="eyebrow">A WARM WELCOME STARTS HERE</span>
        <h2>Check in a passenger.</h2>
        <label>
          Departure
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
                {t.route.origin} → {t.route.destination} ·{" "}
                {dateLabel(t.departure)} {time(t.departure)} ·{" "}
                {t.bus.registration}
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
              <p>Scan a demo ticket’s QR code.</p>
              <small>Camera scanning requires HTTPS or localhost.</small>
            </>
          )}
        </div>
        <div className="button-row">
          <button
            className="button button-dark"
            onClick={camera ? stop : start}
          >
            <Camera size={17} />
            {camera ? "Stop camera" : "Start camera"}
          </button>
          <label className="button button-outline upload-label">
            <Upload size={17} />
            Upload QR
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
            Ticket link, token or booking reference
            <input
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste a QR link or DE-XXXXXXXXXX"
            />
          </label>
          <button className="button button-outline full-width" disabled={busy}>
            Verify ticket <ArrowRight size={17} />
          </button>
        </form>
      </div>
      <div>
        <div className="panel">
          <h2>Ticket result</h2>
          {error && <Notice type="error">{error}</Notice>}
          {success && <Notice type="success">{success}</Notice>}
          {!result && !found.length && !error && !success && (
            <p>
              Scan or enter a ticket to see its status. Viewing a ticket never
              checks it in automatically.
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
                Seat {t.seat} · {t.passenger}
                <small>{t.status.replace("_", " ")}</small>
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
              <h3>Seat {result.seat}</h3>
              <p>
                {result.route.origin} → {result.route.destination}
              </p>
              <p>
                {dateLabel(result.departure)} · {time(result.departure)}
              </p>
              <span className="badge">{result.status.replace("_", " ")}</span>
              {result.trip_id !== tripId && (
                <Notice type="error">
                  This ticket belongs to a different departure.
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
                Confirm check-in <CheckCircle2 size={17} />
              </button>
            </>
          )}
        </div>
        <Notice>
          Demo validation only. Check-in opens 24 hours before departure and
          detects repeat use. No offline check-in is supported.
        </Notice>
      </div>
    </div>
  );
}
