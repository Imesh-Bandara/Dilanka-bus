"use client";
import { useTranslation } from "./locale";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeftRight,
  MapPin,
  CalendarDays,
  Armchair,
  BusFront,
  Check,
} from "lucide-react";
import { api, PageTitle, Notice, Loading, useLocale } from "./site";
import { InformationPages } from "./information-pages";
import { routes as initialRoutes } from "@/lib/seed";
import { JourneyMap } from "./journey-map";
import { LandingPage } from "./landing-page";
import { dateLabel, money, sriDate, time, type Trip } from "@/lib/types";
export const tomorrow = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return sriDate(d);
};
export function SearchForm({
  compact = false,
  initialFrom = "",
  initialTo = "",
  initialDate = "",
}: {
  compact?: boolean;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
}) {
  const tr = useTranslation();
  const router = useRouter();
  const { t } = useLocale();
  const [from, setFrom] = useState(initialFrom),
    [to, setTo] = useState(initialTo),
    [date, setDate] = useState(initialDate || tomorrow()),
    [error, setError] = useState(""),
    [catalog, setCatalog] = useState(initialRoutes);
  useEffect(() => {
    api("catalog")
      .then((d) => setCatalog(d.routes))
      .catch(() => {});
  }, []);
  const places = [
    ...new Set(catalog.flatMap((r) => r.stops.map((s) => s.name))),
  ].sort();
  return (
    <form
      className={`search-form ${compact ? "compact" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!from || !to || from === to) {
          setError("Choose two different places for your journey.");
          return;
        }
        setError("");
        router.push(
          `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`,
        );
      }}
    >
      <label>
        <span>
          <MapPin size={15} />
          {tr(t.from)}
        </span>
        <select
          required
          aria-label={tr(t.from)}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          <option value="">{tr("Where from?")}</option>
          {places.map((p) => (
            <option key={p} value={p}>
              {tr(p)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="swap icon-button"
        aria-label={tr("Swap origin and destination")}
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
      >
        <ArrowLeftRight size={18} />
      </button>
      <label>
        <span>
          <MapPin size={15} />
          {tr(t.to)}
        </span>
        <select
          required
          aria-label={tr(t.to)}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          <option value="">{tr("Where to?")}</option>
          {places
            .filter((p) => p !== from)
            .map((p) => (
              <option key={p} value={p}>
                {tr(p)}
              </option>
            ))}
        </select>
      </label>
      <label className="date-input">
        <span>
          <CalendarDays size={15} />
          {tr(t.date)}
        </span>
        <input
          required
          aria-label={tr(t.date)}
          type="date"
          min={sriDate()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <button className="button button-gold search-submit" type="submit">
        {tr(t.search)}
        <ArrowRight size={19} />
      </button>
      {error && <div className="search-error">{tr(error)}</div>}
    </form>
  );
}
export function Home() {
  return <LandingPage search={<SearchForm />} />;
}
export function SearchPage() {
  const tr = useTranslation();
  const sp = useSearchParams();
  const from = sp.get("from") || "",
    to = sp.get("to") || "",
    date = sp.get("date") || tomorrow();
  const [trips, setTrips] = useState<Trip[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [sort, setSort] = useState("time"),
    [type, setType] = useState("all"),
    [period, setPeriod] = useState("all"),
    [cutoff, setCutoff] = useState(180);
  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api<Trip[]>(
        `trips?date=${date}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      ),
      api("catalog"),
    ])
      .then(([ts, c]) => {
        setTrips(ts);
        setCutoff(c.policy.cutoffMinutes);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to, date]);
  const boardingEpoch = (t: Trip) =>
    new Date(t.departure).getTime() +
    (t.route.stops.find((s) => s.name === from)?.offset || 0) * 60000;
  const localHour = (t: Trip) =>
    new Date(boardingEpoch(t) + 330 * 60000).getUTCHours();
  const filtered = trips
    .filter((t) => type === "all" || String(t.bus.capacity) === type)
    .filter(
      (t) =>
        period === "all" ||
        (localHour(t) >= (period === "evening" ? 17 : 0) &&
          localHour(t) < (period === "evening" ? 24 : 17)),
    )
    .sort((a, b) =>
      sort === "price" ? a.fare - b.fare : boardingEpoch(a) - boardingEpoch(b),
    );
  return (
    <>
      <PageTitle
        eyebrow={tr("YOUR JOURNEY STARTS HERE")}
        title={tr(
          from && to ? `${from} to ${to}` : "Where would you like to go?",
        )}
        description={tr(
          "A clear view of your journey. A seat that feels right.",
        )}
      />
      <div className="container">
        <div className="search-card results-search">
          <SearchForm
            key={`${from}${to}${date}`}
            compact
            initialFrom={from}
            initialTo={to}
            initialDate={date}
          />
        </div>
        <Notice>
          {tr(
            " Client preview: upcoming trips, fares and intermediate times are demonstration data. No payment is collected. ",
          )}
        </Notice>
        <div className="results-toolbar">
          <span>
            <strong>{tr(loading ? "…" : filtered.length)}</strong>{" "}
            {tr(" departures ·")}
            {tr(" ")}
            {tr(dateLabel(`${date}T12:00:00+05:30`))}
          </span>
          <div>
            <select
              aria-label={tr("Filter bus layout")}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">{tr("All coaches")}</option>
              <option value="49">{tr("49-seat luxury")}</option>
              <option value="51">{tr("51-seat premium")}</option>
              <option value="53">{tr("53-seat NE-3230")}</option>
            </select>
            <select
              aria-label={tr("Filter departure time")}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="all">{tr("Any time")}</option>
              <option value="day">{tr("Before 5 PM")}</option>
              <option value="evening">{tr("After 5 PM")}</option>
            </select>
            <select
              aria-label={tr("Sort journeys")}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="time">{tr("Earliest departure")}</option>
              <option value="price">{tr("Lowest fare")}</option>
            </select>
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <Notice type="error">
            {tr(error)}{" "}
            <button onClick={() => location.reload()}>{tr("Try again")}</button>
          </Notice>
        ) : filtered.length ? (
          filtered.map((t) => {
            const startStop =
              t.route.stops.find((s) => s.name === from) || t.route.stops[0];
            const endStop =
              t.route.stops.find((s) => s.name === to) || t.route.stops.at(-1)!;
            const boardTime = new Date(
              new Date(t.departure).getTime() + startStop.offset * 60000,
            ).toISOString();
            const endTime = new Date(
              new Date(t.departure).getTime() + endStop.offset * 60000,
            ).toISOString();
            const duration = endStop.offset - startStop.offset;
            const closed =
              new Date(t.departure).getTime() - Date.now() < cutoff * 60000;
            return (
              <article className="trip-card" key={t.id}>
                <div className="trip-brand">
                  <img
                    className="trip-coach-photo"
                    src="/images/fleet.webp"
                    alt={tr("Dilanka Yutong coaches · fleet reference photo")}
                    loading="lazy"
                  />
                  <div>
                    <h3>{tr(t.bus.name)}</h3>
                    <span>
                      {tr(t.bus.registration)} · {tr(t.bus.capacity)}{" "}
                      {tr(" seats ")}
                    </span>
                  </div>
                  <span className="badge">{tr("DEMO SERVICE")}</span>
                  <small className="trip-photo-note">
                    {tr(" Fleet photo · assignment is illustrative ")}
                  </small>
                </div>
                <div className="trip-main">
                  <div className="trip-time">
                    <strong>{tr(time(boardTime))}</strong>
                    <span>{tr(startStop.name)}</span>
                    <small>{tr(dateLabel(boardTime))}</small>
                  </div>
                  <div className="trip-line">
                    <span>
                      {tr(Math.floor(duration / 60))}
                      {tr("h ")}
                      {tr(duration % 60)}
                      {tr("m ")}
                    </span>
                    <div>
                      <i />
                      <span />
                      <i />
                    </div>
                    <small>{tr(t.route.via)}</small>
                  </div>
                  <div className="trip-time">
                    <strong>{tr(time(endTime))}</strong>
                    <span>{tr(endStop.name)}</span>
                    <small>
                      {sriDate(new Date(boardTime)) !==
                      sriDate(new Date(endTime)) ? (
                        <b className="next-day">{tr("+1 day · ")}</b>
                      ) : null}
                      {tr(dateLabel(endTime))}
                    </small>
                  </div>
                  <div className="trip-price">
                    <small>{tr("Per seat, including fee")}</small>
                    <strong>{tr(money(t.fare + t.fee))}</strong>
                    <span>
                      {tr(money(t.fare))} {tr(" fare + ")}
                      {tr(money(t.fee))} {tr(" fee ")}
                    </span>
                  </div>
                  <div className="trip-action">
                    {closed ? (
                      <span className="badge muted">
                        {tr("Booking closed")}
                      </span>
                    ) : t.available ? (
                      <Link
                        className="button button-dark"
                        href={`/book/${t.id}?pickup=${encodeURIComponent(from || t.route.origin)}&dropoff=${encodeURIComponent(to || t.route.destination)}`}
                      >
                        {tr(" Choose seats ")}
                        <ArrowRight size={17} />
                      </Link>
                    ) : (
                      <span className="badge muted">{tr("Sold out")}</span>
                    )}
                    <small>
                      {tr(t.available)} {tr(" seats available")}
                    </small>
                  </div>
                </div>
                <div className="trip-bottom">
                  {t.bus.amenities.map((a) => (
                    <span key={a}>
                      <Check size={14} />
                      {tr(a)}
                    </span>
                  ))}
                </div>
                <JourneyMap
                  route={t.route}
                  departure={t.departure}
                  pickup={startStop.name}
                  dropoff={endStop.name}
                />
              </article>
            );
          })
        ) : (
          <div className="empty-state">
            <BusFront size={42} />
            <h2>{tr("No departures match this journey.")}</h2>
            <p>
              {tr(
                " Try another date, route or filter. Our demo timetable covers the next two weeks. ",
              )}
            </p>
            <Link href="/routes" className="button button-dark">
              {tr(" Explore routes ")}
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
      <div className="spacer" />
    </>
  );
}
export function InfoPage({ kind }: { kind: string }) {
  return <InformationPages kind={kind} />;
}
