"use client";
import { useTranslation } from "./locale";
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
  const tr = useTranslation();
  return (
    <div className="seat-plan">
      <div className="seat-legend">
        <span>
          <i className="available" />
          {tr(" Available ")}
        </span>
        <span>
          <i className="selected" />
          {tr(" Selected ")}
        </span>
        <span>
          <i className="booked" />
          {tr(" Unavailable ")}
        </span>
        <span>
          <i className="held" />
          {tr(" Held ")}
        </span>
      </div>
      <div className="bus-outline">
        <div className="bus-front">
          <span>
            <SteeringWheel size={25} /> {tr(" Driver ")}
          </span>
          <small>{tr("FRONT OF BUS")}</small>
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
                    aria-label={tr(
                      `Seat ${seat}, ${chosen ? "selected" : unavailable ? "unavailable" : held ? "temporarily held" : "available"}`,
                    )}
                    aria-pressed={chosen}
                    onClick={() => onSelect(seat)}
                    className={`seat ${chosen ? "selected" : unavailable ? "booked" : held ? "held" : "available"}`}
                  >
                    <Armchair size={21} />
                    <span>{tr(String(seat).padStart(2, "0"))}</span>
                  </button>
                ) : (
                  <span key={j} style={{ gridColumn: j < 2 ? j + 1 : j + 2 }} />
                );
              })}
            </div>
          ))}
        </div>
        <div className="bus-rear">{tr("REAR")}</div>
      </div>
      <p className="seat-note">
        {tr(trip.bus.capacity)} {tr(" seats · ")}
        {tr(trip.bus.registration)}
        <br />
        {tr(" The diagram shows the numbering of this demo coach. ")}
      </p>
    </div>
  );
}
export function BookPage({ id }: { id: string }) {
  const tr = useTranslation();
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
        <Notice type="error">{tr(error)}</Notice>
        <Link href="/search" className="text-link">
          {tr(" Choose another departure ")}
          <ArrowRight size={16} />
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
          <ArrowLeft size={16} /> {tr(" Back to departures ")}
        </Link>
        <span className="badge">{tr("GUEST BOOKING")}</span>
      </div>
      <div className="container booking-heading">
        <span className="eyebrow">{tr("YOUR JOURNEY. YOUR SEAT.")}</span>
        <h1>
          {tr(trip.route.origin)}
          <span className="heading-arrow">→</span>
          {tr(trip.route.destination)}
        </h1>
        <p>
          {tr(dateLabel(trip.departure))} · {tr(time(trip.departure))} ·
          {tr(" ")}
          {tr(trip.bus.registration)}
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
            {tr(label)}
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
          {error && <Notice type="error">{tr(error)}</Notice>}
          {closed && (
            <Notice type="error">
              {tr(" Booking is closed for this departure.")}
              {tr(" ")}
              <Link href="/search">{tr("Find another journey.")}</Link>
            </Notice>
          )}
          {hold && step > 1 && (
            <Notice type={expired ? "error" : "info"}>
              <Clock size={17} />
              {tr(
                expired
                  ? "Your seat hold expired. Choose seats again to continue."
                  : `Seats held for ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
              )}
              {expired && (
                <button
                  className="text-link"
                  onClick={() => {
                    setStep(1);
                    setHold(null);
                    setSelected([]);
                  }}
                >
                  {tr(" Reselect seats ")}
                  <RefreshCw size={15} />
                </button>
              )}
            </Notice>
          )}
          {step === 1 && (
            <div className="panel booking-panel">
              <div className="panel-heading">
                <span className="step-tag">01</span>
                <div>
                  <h2>{tr(t.seats)}</h2>
                  <p>{tr("Find your favourite spot for the road ahead.")}</p>
                </div>
              </div>
              <div className="stop-selectors">
                <label>
                  {tr(" Boarding point ")}
                  <select
                    aria-label={tr("Boarding point")}
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  >
                    {trip.route.stops.slice(0, -1).map((s) => (
                      <option key={s.name} value={s.name}>
                        {tr(s.name)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {tr(" Drop-off point ")}
                  <select
                    aria-label={tr("Drop-off point")}
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
                        <option key={s.name} value={s.name}>
                          {tr(s.name)}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <p className="small-note">
                <MapPin size={14} />
                {tr(boarding?.location)} · {tr(time(boardingTime))}
                <br />
                {tr(
                  " Flat demo fare applies to all listed stop pairs. Intermediate times are illustrative. ",
                )}
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
                {tr(
                  busy
                    ? "Holding your seats…"
                    : `Continue with ${selected.length || "your"} seat${selected.length === 1 ? "" : "s"}`,
                )}
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
                  <p>
                    {tr(
                      "No account needed. Just the details for your journey.",
                    )}
                  </p>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  {tr(" Lead passenger name ")}
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tr("Full name")}
                  />
                </label>
                <label>
                  {tr(" Phone number ")}
                  <input
                    required
                    type="tel"
                    pattern="\+?[0-9\s()-]{9,20}"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={tr("077 123 4567")}
                  />
                </label>
                <label className="wide">
                  {tr(" Email ")}
                  <span className="optional">{tr("optional")}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder={tr("you@example.com")}
                  />
                  <small>
                    {tr(
                      " Your ticket is available here immediately. Email delivery is not enabled. ",
                    )}
                  </small>
                </label>
              </div>
              <h3 className="subheading">{tr("Who’s travelling?")}</h3>
              {selected.map((seat, i) => (
                <label className="passenger-row" key={seat}>
                  <span>
                    <Armchair size={19} />
                    {tr(" Seat ")}
                    {tr(seat)}
                  </span>
                  <input
                    aria-label={tr(`Passenger for seat ${seat}`)}
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder={tr(`Passenger ${i + 1} name`)}
                    value={names[seat] ?? name}
                    onChange={(e) =>
                      setNames({ ...names, [seat]: e.target.value })
                    }
                  />
                </label>
              ))}
              <p className="privacy-note">
                <ShieldCheck size={16} />{" "}
                {tr(
                  " Contact details are visible only through your private booking link and authorised staff. ",
                )}
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
                  {tr(" Back ")}
                </button>
                <button className="button button-dark" disabled={expired}>
                  {tr(t.review)}
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
                  <h2>{tr("One last look.")}</h2>
                  <p>
                    {tr("Make sure everything feels right before you confirm.")}
                  </p>
                </div>
              </div>
              <dl className="review-list">
                <div>
                  <dt>{tr("Journey")}</dt>
                  <dd>
                    {tr(pickup)} → {tr(dropoff)}
                  </dd>
                </div>
                <div>
                  <dt>{tr("Travel date")}</dt>
                  <dd>{tr(dateLabel(boardingTime))}</dd>
                </div>
                <div>
                  <dt>{tr("Boarding time")}</dt>
                  <dd>{tr(time(boardingTime))}</dd>
                </div>
                <div>
                  <dt>{tr("Boarding point")}</dt>
                  <dd>{tr(boarding?.location)}</dd>
                </div>
                <div>
                  <dt>{tr("Lead passenger")}</dt>
                  <dd>
                    {name} · {phone}
                  </dd>
                </div>
                <div>
                  <dt>{tr("Passengers")}</dt>
                  <dd>
                    {selected.map((s) => (
                      <span className="review-passenger" key={s}>
                        {tr(" Seat ")}
                        {s} — {names[s] || name}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <Notice>
                <ShieldCheck size={18} />
                <div>
                  <strong>{tr("This is a demonstration booking.")}</strong>
                  <br />
                  {tr(
                    " No payment will be collected. Your QR tickets work for demo validation and are not valid for travel. ",
                  )}
                </div>
              </Notice>
              <p className="small-note">
                {tr(" By confirming, you acknowledge the")}
                {tr(" ")}
                <Link href="/help" target="_blank">
                  {tr(" demo booking and privacy information ")}
                </Link>
                .
              </p>
              <div className="button-row">
                <button
                  className="button button-outline"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft size={16} />
                  {tr(" Edit details ")}
                </button>
                <button
                  className="button button-gold"
                  onClick={submit}
                  disabled={busy || expired || closed}
                >
                  {tr(busy ? "Creating your tickets…" : t.confirm)}
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
              alt={tr("Dilanka fleet reference photograph")}
            />
            <span className="eyebrow">{tr("YOUR JOURNEY AT A GLANCE")}</span>
            <h3>
              {tr(trip.route.origin)} → {tr(trip.route.destination)}
            </h3>
            <p className="summary-date">
              <CalendarIcon />
              {tr(dateLabel(trip.departure))}
            </p>
            <div className="summary-timeline">
              <div>
                <i />
                <span>
                  <strong>{tr(time(boardingTime))}</strong>
                  {tr(pickup)}
                </span>
              </div>
              <div>
                <i />
                <span>
                  <strong>{tr(time(dropTime))}</strong>
                  {tr(dropoff)}
                  <small>
                    {tr(dateLabel(dropTime))} {tr(" · sample stop time")}
                  </small>
                </span>
              </div>
            </div>
            <div className="summary-seats">
              <span>{tr("Your seats")}</span>
              <strong>
                {tr(
                  selected.length
                    ? selected.map((s) => String(s).padStart(2, "0")).join(", ")
                    : "Choose your seats",
                )}
              </strong>
            </div>
            <div className="price-lines">
              <p>
                <span>
                  {tr("Fare × ")}
                  {tr(selected.length)}
                </span>
                <strong>{tr(money(trip.fare * selected.length))}</strong>
              </p>
              <p>
                <span>
                  {tr("Service fee × ")}
                  {tr(selected.length)}
                </span>
                <strong>{tr(money(trip.fee * selected.length))}</strong>
              </p>
              <div>
                <span>{tr("Total")}</span>
                <strong>
                  {tr(money((trip.fare + trip.fee) * selected.length))}
                </strong>
              </div>
            </div>
            <p className="summary-demo">
              {tr("DEMO FARE · NO PAYMENT COLLECTED")}
            </p>
          </div>
          <div className="summary-help">
            <PhoneIcon />
            <div>
              {tr(" Need a little help?")}
              <a href="tel:+94777914680">0777 914680</a>
            </div>
          </div>
        </aside>
      </div>
      <div className="spacer" />
      {step === 1 && selected.length > 0 && (
        <div className="mobile-booking-bar">
          <div>
            <small>
              {tr(selected.length)} {tr(" seats · demo total")}
            </small>
            <strong>
              {tr(money((trip.fare + trip.fee) * selected.length))}
            </strong>
          </div>
          <button
            className="button button-dark"
            disabled={busy || closed}
            onClick={acquire}
          >
            {tr(busy ? "Holding…" : t.continue)}
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
  const tr = useTranslation();
  const { lang } = useLocale();
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
      const r = await fetch(`/api/bookings/${id}/pdf?lang=${lang}`, {
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
        <Notice type="error">{tr(error)}</Notice>
        <Link href="/find-ticket" className="button button-dark">
          {tr(" Find my ticket ")}
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
          {tr(
            booking.status === "cancelled"
              ? "BOOKING CANCELLED"
              : "YOU’RE ALL SET FOR THE DEMO",
          )}
        </span>
        <h1>
          {tr(
            booking.status === "cancelled"
              ? "This journey is cancelled."
              : "A good journey awaits.",
          )}
        </h1>
        <p>
          {tr(
            " Your tickets are saved. Keep your private link or download a copy. ",
          )}
        </p>
        <div className="ticket-actions">
          <button
            className="button button-dark"
            disabled={busy === "download"}
            onClick={download}
          >
            <Download size={17} />
            {tr(busy === "download" ? "Preparing…" : "Download tickets")}
          </button>
          <button
            className="button button-outline"
            onClick={() => window.print()}
          >
            <Printer size={17} />
            {tr(" Print ")}
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
            {tr(copied ? "Private link copied" : "Copy private link")}
          </button>
        </div>
      </div>
      <div className="container ticket-layout">
        <div>
          {error && <Notice type="error">{tr(error)}</Notice>}
          {booking.tickets.map((ticket, i) => (
            <article className="boarding-pass" key={ticket.id}>
              <div className="pass-header">
                <div className="brand">
                  <img src="/images/logo.jpg" alt={tr("DE")} />
                  <span>
                    {tr(" DILANKA")}
                    <span className="brand-sub">{tr("EXPRESS")}</span>
                  </span>
                </div>
                <span>{tr("DEMO TICKET · NOT VALID FOR TRAVEL")}</span>
              </div>
              <div className="pass-content">
                <div className="pass-details">
                  <span className="eyebrow">{tr(booking.reference)}</span>
                  <h2>
                    {tr(booking.pickup)}
                    <ArrowRight size={24} />
                    {tr(booking.dropoff)}
                  </h2>
                  <div className="pass-fields">
                    <div>
                      <span>{tr("PASSENGER")}</span>
                      <strong>{ticket.passenger}</strong>
                    </div>
                    <div>
                      <span>{tr("SEAT NUMBER")}</span>
                      <strong className="seat-number">
                        {tr(String(ticket.seat).padStart(2, "0"))}
                      </strong>
                    </div>
                    <div>
                      <span>{tr("TRAVEL DATE")}</span>
                      <strong>{tr(dateLabel(ticketDeparture))}</strong>
                    </div>
                    <div>
                      <span>{tr("BOARDING TIME")}</span>
                      <strong>{tr(time(ticketDeparture))}</strong>
                    </div>
                    <div>
                      <span>{tr("VEHICLE")}</span>
                      <strong>{tr(booking.trip.bus.registration)}</strong>
                    </div>
                    <div>
                      <span>{tr("TICKET STATUS")}</span>
                      <strong>{tr(ticket.status.replace("_", " "))}</strong>
                    </div>
                  </div>
                </div>
                <div className="pass-qr">
                  <img
                    src={booking.qrImages[i]}
                    alt={tr(`Scannable QR for seat ${ticket.seat}`)}
                  />
                  <span>{tr("SCAN TO VERIFY")}</span>
                  <Link
                    className="qr-verify-link"
                    href={`/verify/${ticket.qr_token}`}
                    target="_blank"
                  >
                    {tr(" Open verification ↗ ")}
                  </Link>
                  <small>
                    {tr(" Verification requires internet. ")}
                    <br />
                    {tr(" No payment collected. ")}
                  </small>
                </div>
              </div>
              <div className="pass-footer">
                <span>
                  <MapPin size={14} />
                  {tr(
                    booking.trip.route.stops.find(
                      (s) => s.name === booking.pickup,
                    )?.location,
                  )}
                </span>
                <span>0777 914680</span>
              </div>
            </article>
          ))}
        </div>
        <aside>
          <div className="panel">
            <span className="eyebrow">{tr("KEEP THESE SOMEWHERE SAFE")}</span>
            <h3>{tr("Find this booking again.")}</h3>
            <label>
              {tr(" Booking reference ")}
              <div className="access-value">{tr(booking.reference)}</div>
            </label>
            <label>
              {tr(" Private access code")}
              <div className="access-value">{access}</div>
            </label>
            <p className="small-note">
              {tr(
                " Anyone with your private link or reference and code can view your booking. Share them only with your travel companions. ",
              )}
            </p>
            <div className="price-lines">
              <div>
                <span>{tr("Total demo value")}</span>
                <strong>{tr(money(booking.total))}</strong>
              </div>
            </div>
            <p className="summary-demo">{tr("PAYMENT STATUS: DEMO")}</p>
          </div>
          {booking.status === "confirmed" && (
            <div className="panel no-print">
              <h3>{tr("Plans changed?")}</h3>
              <p>
                {tr(
                  " You can cancel unboarded demo bookings within the configured cancellation window. ",
                )}
              </p>
              {askCancel ? (
                <>
                  <Notice>
                    {tr(" Cancel this booking and release all its seats? ")}
                  </Notice>
                  <button
                    className="button button-outline"
                    disabled={busy === "cancel"}
                    onClick={cancel}
                  >
                    {tr(" Yes, cancel demo booking ")}
                  </button>
                  <button
                    className="text-link"
                    onClick={() => setAskCancel(false)}
                  >
                    {tr(" Keep booking ")}
                  </button>
                </>
              ) : (
                <button
                  className="text-link"
                  onClick={() => setAskCancel(true)}
                >
                  {tr(" Cancel demo booking ")}
                  <ArrowRight size={16} />
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
  const tr = useTranslation();
  const [reference, setReference] = useState(""),
    [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <PageTitle
        eyebrow={tr("YOUR JOURNEY, CLOSE AT HAND")}
        title={tr("Find your ticket.")}
        description={tr(
          "No account needed. Use the details saved when you booked.",
        )}
      />
      <section className="container recovery-layout">
        <div className="recovery-story">
          <img
            src="/images/dilanka-hills.webp"
            alt={tr("Dilanka coach travelling through the hills")}
          />
          <div>
            <Ticket size={28} />
            <h2>
              {tr(" Your next chapter. ")}
              <br />
              <em>{tr("Saved right here.")}</em>
            </h2>
            <p>
              {tr(
                " A seat, a journey, and a ticket to keep close. Return to your booking whenever you need it. ",
              )}
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
          <span className="eyebrow">{tr("WELCOME BACK")}</span>
          <h2>{tr("Let’s find your journey.")}</h2>
          <p className="recovery-intro">
            {tr(
              " Enter both details from your booking confirmation. Your private code protects your passenger information. ",
            )}
          </p>
          {error && <Notice type="error">{tr(error)}</Notice>}
          <label>
            {tr(" Booking reference ")}
            <input
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={tr("DE-XXXXXXXXXX")}
            />
          </label>
          <label>
            {tr(" Private access code ")}
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={tr("The code shown on confirmation")}
            />
          </label>
          <button className="button button-dark full-width" disabled={busy}>
            {tr(busy ? "Finding your tickets…" : "Find my tickets")}
            <ArrowRight size={17} />
          </button>
          <p className="small-note">
            {tr(
              " Lost your code? This prototype does not send recovery emails. Keep your original private ticket link, or ask the demo administrator for help. ",
            )}
          </p>
          <Link href="/help" className="text-link">
            {tr(" Need a little guidance? ")}
            <ArrowRight size={16} />
          </Link>
        </form>
      </section>
      <div className="spacer" />
    </>
  );
}
export function VerifyPage({ token }: { token: string }) {
  const tr = useTranslation();
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
          <img src="/images/logo.jpg" alt={tr("Dilanka Express")} />
          <span>
            {tr(" DILANKA EXPRESS")}
            <small>{tr("YOUR JOURNEY · VERIFIED")}</small>
          </span>
        </div>
        <span className={`success-icon ${!valid ? "cancelled" : ""}`}>
          {valid ? <CheckCircle2 size={35} /> : <XCircle size={35} />}
        </span>
        <span className="eyebrow">
          {tr("DILANKA EXPRESS · QR VERIFICATION")}
        </span>
        <h1>
          {tr(
            error
              ? "Ticket not found"
              : result.status === "checked_in"
                ? "Already checked in"
                : result.booking_status === "cancelled"
                  ? "Ticket cancelled"
                  : valid
                    ? "Demo ticket verified"
                    : "Ticket unavailable",
          )}
        </h1>
        <Notice>
          {tr(
            " This is a demonstration ticket. It is not valid for travel and no payment was collected. ",
          )}
        </Notice>
        {error ? (
          <p>{tr(error)}</p>
        ) : (
          <>
            <h2>
              {tr(result.route.origin)} → {tr(result.route.destination)}
            </h2>
            <dl className="review-list">
              <div>
                <dt>{tr("Travel date")}</dt>
                <dd>{tr(dateLabel(result.departure))}</dd>
              </div>
              <div>
                <dt>{tr("Departure")}</dt>
                <dd>{tr(time(result.departure))}</dd>
              </div>
              <div>
                <dt>{tr("Seat")}</dt>
                <dd>{tr(result.seat)}</dd>
              </div>
              <div>
                <dt>{tr("Status")}</dt>
                <dd>{tr(result.status.replace("_", " "))}</dd>
              </div>
            </dl>
            <p className="small-note">
              {tr(
                " Opening this page does not check in a passenger. Only authorised staff can check tickets in. ",
              )}
            </p>
          </>
        )}
        <Link className="text-link" href="/">
          {tr(" Back to Dilanka Express ")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
