"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Armchair,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  CircleGauge as SteeringWheel,
  Ticket,
  User,
  Download,
  Copy,
  Printer,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { api, post, Loading, Notice, PageTitle, useLocale } from "./site";
import { JourneyMap } from "./journey-map";
import {
  type Trip,
  type Booking,
  money,
  time,
  dateLabel,
  sriDate,
} from "@/lib/types";
export function SeatMap({
  trip,
  selected,
  onSelect,
  disabled = false,
}: {
  trip: Trip;
  selected: number[];
  onSelect: (seat: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="seat-plan">
      <div className="seat-legend">
        <span>
          <i className="available" />
          Available
        </span>
        <span>
          <i className="selected" />
          Selected
        </span>
        <span>
          <i className="booked" />
          Unavailable
        </span>
        <span>
          <i className="held" />
          Held
        </span>
      </div>
      <div className="bus-outline">
        <div className="bus-front">
          <span>
            <SteeringWheel size={25} /> Driver
          </span>
          <small>FRONT OF BUS</small>
        </div>
        <div className="bus-rows">
          {trip.bus.layout.map((row, i) => (
            <div
              className={`seat-row ${row.length === 5 ? "rear-row" : ""}`}
              key={i}
            >
              {row.map((seat, j) => {
                const unavailable =
                    trip.booked.includes(seat) || trip.blocked.includes(seat),
                  held = trip.held.includes(seat) && !selected.includes(seat),
                  chosen = selected.includes(seat);
                return seat ? (
                  <button
                    type="button"
                    style={
                      row.length === 4
                        ? { gridColumn: j < 2 ? j + 1 : j + 2 }
                        : undefined
                    }
                    key={j}
                    disabled={disabled || unavailable || held}
                    aria-label={`Seat ${seat}, ${chosen ? "selected" : unavailable ? "unavailable" : held ? "temporarily held" : "available"}`}
                    aria-pressed={chosen}
                    onClick={() => onSelect(seat)}
                    className={`seat ${chosen ? "selected" : unavailable ? "booked" : held ? "held" : "available"}`}
                  >
                    <Armchair size={21} />
                    <span>{String(seat).padStart(2, "0")}</span>
                  </button>
                ) : (
                  <span key={j} style={{ gridColumn: j < 2 ? j + 1 : j + 2 }} />
                );
              })}
            </div>
          ))}
        </div>
        <div className="bus-rear">REAR</div>
      </div>
      <p className="seat-note">
        {trip.bus.capacity} seats · {trip.bus.registration}
        <br />
        The diagram shows the numbering of this demo coach.
      </p>
    </div>
  );
}
export function BookPage({ id }: { id: string }) {
  const sp = useSearchParams(),
    { t } = useLocale();
  const [trip, setTrip] = useState<Trip | null>(null),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<number[]>([]),
    [step, setStep] = useState(1),
    [busy, setBusy] = useState(false),
    [pickup, setPickup] = useState(""),
    [dropoff, setDropoff] = useState(""),
    [owner, setOwner] = useState(""),
    [hold, setHold] = useState<{ id: string; expires: string } | null>(null),
    [seconds, setSeconds] = useState(0),
    [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [email, setEmail] = useState(""),
    [names, setNames] = useState<Record<number, string>>({}),
    [idem] = useState(() => crypto.randomUUID()),
    [cutoff, setCutoff] = useState(180);
  useEffect(() => {
    let alive = true;
    let key = sessionStorage.getItem("de-owner");
    if (!key) {
      key = crypto.randomUUID();
      sessionStorage.setItem("de-owner", key);
    }
    setOwner(key);
    const load = () =>
      api<Trip>(`trips/${id}`).then((d) => {
        if (alive) setTrip(d);
        return d;
      });
    load()
      .then((d) => {
        if (alive) {
          setPickup(
            sp.get("pickup") &&
              d.route.stops.some((s) => s.name === sp.get("pickup"))
              ? sp.get("pickup")!
              : d.route.origin,
          );
          setDropoff(
            sp.get("dropoff") &&
              d.route.stops.some((s) => s.name === sp.get("dropoff"))
              ? sp.get("dropoff")!
              : d.route.destination,
          );
        }
      })
      .catch((e) => setError(e.message));
    api("catalog")
      .then((c) => setCutoff(c.policy.cutoffMinutes))
      .catch(() => {});
    const timer = setInterval(() => load().catch(() => {}), 12000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id]);
  useEffect(() => {
    if (!hold) return;
    const update = () =>
      setSeconds(
        Math.max(
          0,
          Math.ceil((new Date(hold.expires).getTime() - Date.now()) / 1000),
        ),
      );
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [hold]);
  async function acquire() {
    if (!trip) return;
    setBusy(true);
    setError("");
    try {
      if (
        trip.route.stops.findIndex((s) => s.name === pickup) >=
        trip.route.stops.findIndex((s) => s.name === dropoff)
      )
        throw new Error("Choose boarding and drop-off points in travel order.");
      const result = await post("holds", {
        tripId: id,
        seats: selected,
        owner,
      });
      setHold(result);
      setSeconds(
        Math.ceil((new Date(result.expires).getTime() - Date.now()) / 1000),
      );
      setStep(2);
    } catch (e) {
      setError((e as Error).message);
      setTrip(await api(`trips/${id}`));
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!trip || !hold) return;
    setBusy(true);
    setError("");
    try {
      const result = await post("bookings", {
        holdId: hold.id,
        owner,
        idempotency: idem,
        name,
        phone,
        email,
        pickup,
        dropoff,
        passengers: selected.map((seat) => ({
          seat,
          name: names[seat] || name,
        })),
        expectedTotal: selected.length * (trip.fare + trip.fee),
      });
      sessionStorage.setItem(`de-booking-${result.id}`, result.accessCode);
      location.assign(`/ticket/${result.id}#access=${result.accessCode}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!trip)
    return error ? (
      <div className="container section">
        <Notice type="error">{error}</Notice>
        <Link href="/search" className="text-link">
          Choose another departure <ArrowRight size={16} />
        </Link>
      </div>
    ) : (
      <Loading />
    );
  const expired = !!hold && seconds === 0,
    closed =
      trip.status !== "open" ||
      new Date(trip.departure).getTime() - Date.now() < cutoff * 60000;
  const boarding = trip.route.stops.find((s) => s.name === pickup)!;
  const dropStop = trip.route.stops.find((s) => s.name === dropoff);
  const dropTime = new Date(
    new Date(trip.departure).getTime() +
      (dropStop?.offset || trip.route.duration) * 60000,
  ).toISOString();
  const boardingTime = new Date(
    new Date(trip.departure).getTime() + (boarding?.offset || 0) * 60000,
  ).toISOString();
  return (
    <>
      <div className="container booking-top">
        <Link
          href={`/search?from=${trip.route.origin}&to=${trip.route.destination}&date=${sriDate(new Date(trip.departure))}`}
          className="back-link"
        >
          <ArrowLeft size={16} /> Back to departures
        </Link>
        <span className="badge">GUEST BOOKING</span>
      </div>
      <div className="container booking-heading">
        <span className="eyebrow">YOUR JOURNEY. YOUR SEAT.</span>
        <h1>
          {trip.route.origin}
          <span className="heading-arrow">→</span>
          {trip.route.destination}
        </h1>
        <p>
          {dateLabel(trip.departure)} · {time(trip.departure)} ·{" "}
          {trip.bus.registration}
        </p>
      </div>
      <div className="container booking-progress">
        {[t.seats, t.passenger, t.review].map((label, i) => (
          <div
            className={
              step === i + 1 ? "current" : step > i + 1 ? "complete" : ""
            }
            key={label}
            aria-current={step === i + 1 ? "step" : undefined}
          >
            <span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>
            {label}
          </div>
        ))}
      </div>
      <div className="container booking-map">
        <JourneyMap
          route={trip.route}
          departure={trip.departure}
          pickup={pickup}
          dropoff={dropoff}
        />
      </div>
      <div className="container booking-layout">
        <div>
          {error && <Notice type="error">{error}</Notice>}
          {closed && (
            <Notice type="error">
              Booking is closed for this departure.{" "}
              <Link href="/search">Find another journey.</Link>
            </Notice>
          )}
          {hold && step > 1 && (
            <Notice type={expired ? "error" : "info"}>
              <Clock size={17} />
              {expired
                ? "Your seat hold expired. Choose seats again to continue."
                : `Seats held for ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}
              {expired && (
                <button
                  className="text-link"
                  onClick={() => {
                    setStep(1);
                    setHold(null);
                    setSelected([]);
                  }}
                >
                  Reselect seats <RefreshCw size={15} />
                </button>
              )}
            </Notice>
          )}
          {step === 1 && (
            <div className="panel booking-panel">
              <div className="panel-heading">
                <span className="step-tag">01</span>
                <div>
                  <h2>{t.seats}</h2>
                  <p>Find your favourite spot for the road ahead.</p>
                </div>
              </div>
              <div className="stop-selectors">
                <label>
                  Boarding point
                  <select
                    aria-label="Boarding point"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  >
                    {trip.route.stops.slice(0, -1).map((s) => (
                      <option key={s.name}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Drop-off point
                  <select
                    aria-label="Drop-off point"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                  >
                    {trip.route.stops
                      .filter(
                        (s, i) =>
                          i >
                          trip.route.stops.findIndex((p) => p.name === pickup),
                      )
                      .map((s) => (
                        <option key={s.name}>{s.name}</option>
                      ))}
                  </select>
                </label>
              </div>
              <p className="small-note">
                <MapPin size={14} />
                {boarding?.location} · {time(boardingTime)}
                <br />
                Flat demo fare applies to all listed stop pairs. Intermediate
                times are illustrative.
              </p>
              <SeatMap
                trip={trip}
                selected={selected}
                disabled={closed}
                onSelect={(seat) => {
                  setError("");
                  if (selected.includes(seat))
                    setSelected(selected.filter((s) => s !== seat));
                  else if (selected.length < 6)
                    setSelected([...selected, seat].sort((a, b) => a - b));
                  else setError("You can book up to six seats at once.");
                }}
              />
              <button
                className="button button-dark full-width"
                disabled={!selected.length || busy || closed}
                onClick={acquire}
              >
                {busy
                  ? "Holding your seats…"
                  : `Continue with ${selected.length || "your"} seat${selected.length === 1 ? "" : "s"}`}
                <ArrowRight size={17} />
              </button>
            </div>
          )}
          {step === 2 && (
            <form
              className="panel booking-panel"
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                setStep(3);
              }}
            >
              <div className="panel-heading">
                <span className="step-tag">02</span>
                <div>
                  <h2>{t.passenger}</h2>
                  <p>No account needed. Just the details for your journey.</p>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Lead passenger name
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </label>
                <label>
                  Phone number
                  <input
                    required
                    type="tel"
                    pattern="\+?[0-9\s()-]{9,20}"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="077 123 4567"
                  />
                </label>
                <label className="wide">
                  Email <span className="optional">optional</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  <small>
                    Your ticket is available here immediately. Email delivery is
                    not enabled.
                  </small>
                </label>
              </div>
              <h3 className="subheading">Who’s travelling?</h3>
              {selected.map((seat, i) => (
                <label className="passenger-row" key={seat}>
                  <span>
                    <Armchair size={19} />
                    Seat {seat}
                  </span>
                  <input
                    aria-label={`Passenger for seat ${seat}`}
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder={`Passenger ${i + 1} name`}
                    value={names[seat] ?? name}
                    onChange={(e) =>
                      setNames({ ...names, [seat]: e.target.value })
                    }
                  />
                </label>
              ))}
              <p className="privacy-note">
                <ShieldCheck size={16} /> Contact details are visible only
                through your private booking link and authorised staff.
              </p>
              <div className="button-row">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={async () => {
                    if (hold)
                      await api("holds", {
                        method: "DELETE",
                        body: JSON.stringify({ id: hold.id, owner }),
                      });
                    setHold(null);
                    setStep(1);
                    setTrip(await api(`trips/${id}`));
                  }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button className="button button-dark" disabled={expired}>
                  {t.review}
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}
          {step === 3 && (
            <div className="panel booking-panel">
              <div className="panel-heading">
                <span className="step-tag">03</span>
                <div>
                  <h2>One last look.</h2>
                  <p>Make sure everything feels right before you confirm.</p>
                </div>
              </div>
              <dl className="review-list">
                <div>
                  <dt>Journey</dt>
                  <dd>
                    {pickup} → {dropoff}
                  </dd>
                </div>
                <div>
                  <dt>Travel date</dt>
                  <dd>{dateLabel(boardingTime)}</dd>
                </div>
                <div>
                  <dt>Boarding time</dt>
                  <dd>{time(boardingTime)}</dd>
                </div>
                <div>
                  <dt>Boarding point</dt>
                  <dd>{boarding?.location}</dd>
                </div>
                <div>
                  <dt>Lead passenger</dt>
                  <dd>
                    {name} · {phone}
                  </dd>
                </div>
                <div>
                  <dt>Passengers</dt>
                  <dd>
                    {selected.map((s) => (
                      <span className="review-passenger" key={s}>
                        Seat {s} — {names[s] || name}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <Notice>
                <ShieldCheck size={18} />
                <div>
                  <strong>This is a demonstration booking.</strong>
                  <br />
                  No payment will be collected. Your QR tickets work for demo
                  validation and are not valid for travel.
                </div>
              </Notice>
              <p className="small-note">
                By confirming, you acknowledge the{" "}
                <Link href="/help" target="_blank">
                  demo booking and privacy information
                </Link>
                .
              </p>
              <div className="button-row">
                <button
                  className="button button-outline"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft size={16} />
                  Edit details
                </button>
                <button
                  className="button button-gold"
                  onClick={submit}
                  disabled={busy || expired || closed}
                >
                  {busy ? "Creating your tickets…" : t.confirm}
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
        <aside className="booking-summary">
          <div className="panel">
            <img
              className="summary-coach-photo"
              src="/images/dilanka-fleet-original.webp"
              alt="Dilanka fleet reference photograph"
            />
            <span className="eyebrow">YOUR JOURNEY AT A GLANCE</span>
            <h3>
              {trip.route.origin} → {trip.route.destination}
            </h3>
            <p className="summary-date">
              <CalendarIcon />
              {dateLabel(trip.departure)}
            </p>
            <div className="summary-timeline">
              <div>
                <i />
                <span>
                  <strong>{time(boardingTime)}</strong>
                  {pickup}
                </span>
              </div>
              <div>
                <i />
                <span>
                  <strong>{time(dropTime)}</strong>
                  {dropoff}
                  <small>{dateLabel(dropTime)} · sample stop time</small>
                </span>
              </div>
            </div>
            <div className="summary-seats">
              <span>Your seats</span>
              <strong>
                {selected.length
                  ? selected.map((s) => String(s).padStart(2, "0")).join(", ")
                  : "Choose your seats"}
              </strong>
            </div>
            <div className="price-lines">
              <p>
                <span>Fare × {selected.length}</span>
                <strong>{money(trip.fare * selected.length)}</strong>
              </p>
              <p>
                <span>Service fee × {selected.length}</span>
                <strong>{money(trip.fee * selected.length)}</strong>
              </p>
              <div>
                <span>Total</span>
                <strong>
                  {money((trip.fare + trip.fee) * selected.length)}
                </strong>
              </div>
            </div>
            <p className="summary-demo">DEMO FARE · NO PAYMENT COLLECTED</p>
          </div>
          <div className="summary-help">
            <PhoneIcon />
            <div>
              Need a little help?<a href="tel:+94777914680">0777 914680</a>
            </div>
          </div>
        </aside>
      </div>
      <div className="spacer" />
      {step === 1 && selected.length > 0 && (
        <div className="mobile-booking-bar">
          <div>
            <small>{selected.length} seats · demo total</small>
            <strong>{money((trip.fare + trip.fee) * selected.length)}</strong>
          </div>
          <button
            className="button button-dark"
            disabled={busy || closed}
            onClick={acquire}
          >
            {busy ? "Holding…" : t.continue}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
function CalendarIcon() {
  return <Clock size={16} />;
}
function PhoneIcon() {
  return <User size={20} />;
}
export function TicketPage({ id }: { id: string }) {
  const [booking, setBooking] = useState<
      (Booking & { qrImages: string[] }) | null
    >(null),
    [access, setAccess] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [copied, setCopied] = useState(false),
    [askCancel, setAskCancel] = useState(false);
  useEffect(() => {
    const code =
      new URLSearchParams(location.hash.slice(1)).get("access") ||
      sessionStorage.getItem(`de-booking-${id}`) ||
      "";
    setAccess(code);
    if (code) sessionStorage.setItem(`de-booking-${id}`, code);
    api(`bookings/${id}`, { headers: { "x-booking-access": code } })
      .then(setBooking)
      .catch((e) => setError(e.message));
  }, [id]);
  async function download() {
    setBusy("download");
    setError("");
    try {
      const r = await fetch(`/api/bookings/${id}/pdf`, {
        headers: { "x-booking-access": access },
      });
      if (!r.ok)
        throw new Error(
          "Could not create your PDF. Please try again or print the ticket.",
        );
      const url = URL.createObjectURL(await r.blob()),
        a = document.createElement("a");
      a.href = url;
      a.download = `${booking?.reference}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function cancel() {
    setBusy("cancel");
    setError("");
    try {
      await api(`bookings/${id}/cancel`, {
        method: "POST",
        headers: { "x-booking-access": access },
        body: "{}",
      });
      setBooking(
        await api(`bookings/${id}`, {
          headers: { "x-booking-access": access },
        }),
      );
      setAskCancel(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  const ticketBoarding = booking?.trip.route.stops.find(
    (s) => s.name === booking.pickup,
  );
  const ticketDeparture = booking
    ? new Date(
        new Date(booking.trip.departure).getTime() +
          (ticketBoarding?.offset || 0) * 60000,
      ).toISOString()
    : "";
  if (!booking)
    return error ? (
      <div className="container section">
        <Notice type="error">{error}</Notice>
        <Link href="/find-ticket" className="button button-dark">
          Find my ticket
        </Link>
      </div>
    ) : (
      <Loading />
    );
  return (
    <>
      <div className="container confirmation-heading">
        <span
          className={`success-icon ${booking.status === "cancelled" ? "cancelled" : ""}`}
        >
          {booking.status === "cancelled" ? (
            <XCircle size={30} />
          ) : (
            <CheckCircle2 size={30} />
          )}
        </span>
        <span className="eyebrow">
          {booking.status === "cancelled"
            ? "BOOKING CANCELLED"
            : "YOU’RE ALL SET FOR THE DEMO"}
        </span>
        <h1>
          {booking.status === "cancelled"
            ? "This journey is cancelled."
            : "A good journey awaits."}
        </h1>
        <p>
          Your tickets are saved. Keep your private link or download a copy.
        </p>
        <div className="ticket-actions">
          <button
            className="button button-dark"
            disabled={busy === "download"}
            onClick={download}
          >
            <Download size={17} />
            {busy === "download" ? "Preparing…" : "Download tickets"}
          </button>
          <button
            className="button button-outline"
            onClick={() => window.print()}
          >
            <Printer size={17} />
            Print
          </button>
          <button
            className="button button-outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `${location.origin}/ticket/${id}#access=${access}`,
                );
                setCopied(true);
              } catch {
                setError("Copy the private link from your address bar.");
              }
            }}
          >
            <Copy size={17} />
            {copied ? "Private link copied" : "Copy private link"}
          </button>
        </div>
      </div>
      <div className="container ticket-layout">
        <div>
          {error && <Notice type="error">{error}</Notice>}
          {booking.tickets.map((ticket, i) => (
            <article className="boarding-pass" key={ticket.id}>
              <div className="pass-header">
                <div className="brand">
                  <img src="/images/logo.jpg" alt="DE" />
                  <span>
                    DILANKA<span className="brand-sub">EXPRESS</span>
                  </span>
                </div>
                <span>DEMO TICKET · NOT VALID FOR TRAVEL</span>
              </div>
              <div className="pass-content">
                <div className="pass-details">
                  <span className="eyebrow">{booking.reference}</span>
                  <h2>
                    {booking.pickup}
                    <ArrowRight size={24} />
                    {booking.dropoff}
                  </h2>
                  <div className="pass-fields">
                    <div>
                      <span>PASSENGER</span>
                      <strong>{ticket.passenger}</strong>
                    </div>
                    <div>
                      <span>SEAT NUMBER</span>
                      <strong className="seat-number">
                        {String(ticket.seat).padStart(2, "0")}
                      </strong>
                    </div>
                    <div>
                      <span>TRAVEL DATE</span>
                      <strong>{dateLabel(ticketDeparture)}</strong>
                    </div>
                    <div>
                      <span>BOARDING TIME</span>
                      <strong>{time(ticketDeparture)}</strong>
                    </div>
                    <div>
                      <span>VEHICLE</span>
                      <strong>{booking.trip.bus.registration}</strong>
                    </div>
                    <div>
                      <span>TICKET STATUS</span>
                      <strong>{ticket.status.replace("_", " ")}</strong>
                    </div>
                  </div>
                </div>
                <div className="pass-qr">
                  <img
                    src={booking.qrImages[i]}
                    alt={`Scannable QR for seat ${ticket.seat}`}
                  />
                  <span>SCAN TO VERIFY</span>
                  <Link
                    className="qr-verify-link"
                    href={`/verify/${ticket.qr_token}`}
                    target="_blank"
                  >
                    Open verification ↗
                  </Link>
                  <small>
                    Verification requires internet.
                    <br />
                    No payment collected.
                  </small>
                </div>
              </div>
              <div className="pass-footer">
                <span>
                  <MapPin size={14} />
                  {
                    booking.trip.route.stops.find(
                      (s) => s.name === booking.pickup,
                    )?.location
                  }
                </span>
                <span>0777 914680</span>
              </div>
            </article>
          ))}
        </div>
        <aside>
          <div className="panel">
            <span className="eyebrow">KEEP THESE SOMEWHERE SAFE</span>
            <h3>Find this booking again.</h3>
            <label>
              Booking reference
              <div className="access-value">{booking.reference}</div>
            </label>
            <label>
              Private access code<div className="access-value">{access}</div>
            </label>
            <p className="small-note">
              Anyone with your private link or reference and code can view your
              booking. Share them only with your travel companions.
            </p>
            <div className="price-lines">
              <div>
                <span>Total demo value</span>
                <strong>{money(booking.total)}</strong>
              </div>
            </div>
            <p className="summary-demo">PAYMENT STATUS: DEMO</p>
          </div>
          {booking.status === "confirmed" && (
            <div className="panel no-print">
              <h3>Plans changed?</h3>
              <p>
                You can cancel unboarded demo bookings within the configured
                cancellation window.
              </p>
              {askCancel ? (
                <>
                  <Notice>
                    Cancel this booking and release all its seats?
                  </Notice>
                  <button
                    className="button button-outline"
                    disabled={busy === "cancel"}
                    onClick={cancel}
                  >
                    Yes, cancel demo booking
                  </button>
                  <button
                    className="text-link"
                    onClick={() => setAskCancel(false)}
                  >
                    Keep booking
                  </button>
                </>
              ) : (
                <button
                  className="text-link"
                  onClick={() => setAskCancel(true)}
                >
                  Cancel demo booking <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
      <div className="spacer" />
    </>
  );
}
export function FindTicket() {
  const [reference, setReference] = useState(""),
    [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <PageTitle
        eyebrow="YOUR JOURNEY, CLOSE AT HAND"
        title="Find your ticket."
        description="No account needed. Use the details saved when you booked."
      />
      <section className="container recovery-layout">
        <div className="recovery-story">
          <img
            src="/images/dilanka-hills.webp"
            alt="Dilanka coach travelling through the hills"
          />
          <div>
            <Ticket size={28} />
            <h2>
              Your next chapter.
              <br />
              <em>Saved right here.</em>
            </h2>
            <p>
              A seat, a journey, and a ticket to keep close. Return to your
              booking whenever you need it.
            </p>
          </div>
        </div>
        <form
          className="panel recovery-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const b = await api<Booking>(
                `bookings/${encodeURIComponent(reference.trim().toUpperCase())}`,
                { headers: { "x-booking-access": code.trim() } },
              );
              location.assign(`/ticket/${b.id}#access=${code.trim()}`);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Let’s find your journey.</h2>
          <p className="recovery-intro">
            Enter both details from your booking confirmation. Your private code
            protects your passenger information.
          </p>
          {error && <Notice type="error">{error}</Notice>}
          <label>
            Booking reference
            <input
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="DE-XXXXXXXXXX"
            />
          </label>
          <label>
            Private access code
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="The code shown on confirmation"
            />
          </label>
          <button className="button button-dark full-width" disabled={busy}>
            {busy ? "Finding your tickets…" : "Find my tickets"}
            <ArrowRight size={17} />
          </button>
          <p className="small-note">
            Lost your code? This prototype does not send recovery emails. Keep
            your original private ticket link, or ask the demo administrator for
            help.
          </p>
          <Link href="/help" className="text-link">
            Need a little guidance?
            <ArrowRight size={16} />
          </Link>
        </form>
      </section>
      <div className="spacer" />
    </>
  );
}
export function VerifyPage({ token }: { token: string }) {
  const [result, setResult] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api(`verify/${encodeURIComponent(token)}`)
      .then(setResult)
      .catch((e) => setError(e.message));
  }, [token]);
  if (!result && !error) return <Loading />;
  const valid = result?.valid;
  return (
    <div className="container verification-wrap">
      <div className="panel verification">
        <div className="verification-brand">
          <img src="/images/logo.jpg" alt="Dilanka Express" />
          <span>
            DILANKA EXPRESS<small>YOUR JOURNEY · VERIFIED</small>
          </span>
        </div>
        <span className={`success-icon ${!valid ? "cancelled" : ""}`}>
          {valid ? <CheckCircle2 size={35} /> : <XCircle size={35} />}
        </span>
        <span className="eyebrow">DILANKA EXPRESS · QR VERIFICATION</span>
        <h1>
          {error
            ? "Ticket not found"
            : result.status === "checked_in"
              ? "Already checked in"
              : result.booking_status === "cancelled"
                ? "Ticket cancelled"
                : valid
                  ? "Demo ticket verified"
                  : "Ticket unavailable"}
        </h1>
        <Notice>
          This is a demonstration ticket. It is not valid for travel and no
          payment was collected.
        </Notice>
        {error ? (
          <p>{error}</p>
        ) : (
          <>
            <h2>
              {result.route.origin} → {result.route.destination}
            </h2>
            <dl className="review-list">
              <div>
                <dt>Travel date</dt>
                <dd>{dateLabel(result.departure)}</dd>
              </div>
              <div>
                <dt>Departure</dt>
                <dd>{time(result.departure)}</dd>
              </div>
              <div>
                <dt>Seat</dt>
                <dd>{result.seat}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{result.status.replace("_", " ")}</dd>
              </div>
            </dl>
            <p className="small-note">
              Opening this page does not check in a passenger. Only authorised
              staff can check tickets in.
            </p>
          </>
        )}
        <Link className="text-link" href="/">
          Back to Dilanka Express <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
