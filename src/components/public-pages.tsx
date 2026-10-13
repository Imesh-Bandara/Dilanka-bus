"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeftRight,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Armchair,
  Clock,
  Phone,
  Mail,
  Check,
  Route as RouteIcon,
  BusFront,
  Ticket,
  ChevronRight,
  Wind,
  Sunrise,
} from "lucide-react";
import { api, PageTitle, Notice, Loading, useLocale } from "./site";
import { routes as initialRoutes, buses } from "@/lib/seed";
import { JourneyMap } from "./journey-map";
import { JourneyMedia, HeroPhotos } from "./journey-media";
import { expresswayRoute } from "@/lib/journey-map";
import {
  dateLabel,
  money,
  sriDate,
  time,
  type Route,
  type Trip,
} from "@/lib/types";
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
          {t.from}
        </span>
        <select
          required
          aria-label={t.from}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          <option value="">Where from?</option>
          {places.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="swap icon-button"
        aria-label="Swap origin and destination"
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
          {t.to}
        </span>
        <select
          required
          aria-label={t.to}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          <option value="">Where to?</option>
          {places
            .filter((p) => p !== from)
            .map((p) => (
              <option key={p}>{p}</option>
            ))}
        </select>
      </label>
      <label className="date-input">
        <span>
          <CalendarDays size={15} />
          {t.date}
        </span>
        <input
          required
          aria-label={t.date}
          type="date"
          min={sriDate()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <button className="button button-gold search-submit" type="submit">
        {t.search}
        <ArrowRight size={19} />
      </button>
      {error && <div className="search-error">{error}</div>}
    </form>
  );
}
const popular = [initialRoutes[1], initialRoutes[4], initialRoutes[5]];
export function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-line" /> YOUR LUXURY TRAVEL PARTNER
            </span>
            <h1>
              More than
              <br />a destination.
              <br />
              <em>A good journey.</em>
            </h1>
            <p>
              Familiar places. New possibilities.
              <br />
              Travel across Sri Lanka with Dilanka Express.
            </p>
            <div className="hero-proof">
              <div className="proof-icon">
                <ShieldCheck size={22} />
              </div>
              <span>
                Choose your seat.
                <br />
                <strong>Make the journey yours.</strong>
              </span>
              <span className="hero-since">
                BASED IN
                <br />
                <strong>AMPARA, SRI LANKA</strong>
              </span>
            </div>
          </div>
          <div className="hero-image">
            <HeroPhotos />
            <div className="image-shade" />
            <div className="hero-image-top">
              <span className="glass-chip">DILANKA EXPRESS</span>
            </div>
            <div className="hero-caption">
              <span>THE ROAD FEELS DIFFERENT WITH US</span>
              <strong>
                A little more comfort.
                <br />A lot to look forward to.
              </strong>
            </div>
            <div className="floating-card">
              <div className="round-icon">
                <BusFront size={21} />
              </div>
              <div>
                <span>YOUR NEXT JOURNEY</span>
                <strong>
                  Ampara <ArrowRight size={16} /> Colombo
                </strong>
              </div>
              <ArrowUpRight size={20} />
            </div>
          </div>
        </div>
      </section>
      <section className="search-section container">
        <div className="search-card">
          <div className="search-card-heading">
            <h2>Where are we taking you?</h2>
            <span>
              <Ticket size={15} /> No account needed
            </span>
          </div>
          <SearchForm />
          <p className="search-footnote">
            <ShieldCheck size={13} /> Working demo bookings · Sample fares · No
            payment collected
          </p>
        </div>
      </section>
      <div className="container reassurance">
        <span>
          <Armchair />
          Your seat, your choice
        </span>
        <span>
          <Clock />
          Clear departure times
        </span>
        <span>
          <Ticket />
          Instant QR demo tickets
        </span>
        <a href="tel:+94777914680">
          <Phone />A real person to call
        </a>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FAMILIAR ROADS. NEW STORIES.</span>
            <h2>Find your way.</h2>
          </div>
          <Link href="/routes" className="text-link">
            Explore all routes <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="route-cards">
          {popular.map((r, i) => (
            <RouteCard key={r.id} route={r} index={i} />
          ))}
        </div>
      </section>
      <section className="journey-band">
        <div className="container journey-band-inner">
          <span className="eyebrow">A LITTLE LESS HASSLE</span>
          <h2>
            Good journeys start
            <br />
            with a simple booking.
          </h2>
          <div className="steps">
            <div>
              <span>01</span>
              <h3>Find your route</h3>
              <p>Choose your places and travel date.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Make yourself comfortable</h3>
              <p>Pick your departure and favourite seat.</p>
            </div>
            <div>
              <span>03</span>
              <h3>You’re ready to go</h3>
              <p>Confirm your demo booking and save your QR ticket.</p>
            </div>
          </div>
        </div>
      </section>
      <JourneyMedia />
      <section className="section container story-section">
        <div className="story-photo">
          <img
            src="/images/fleet.webp"
            alt="Dilanka Express fleet in Ampara"
            loading="lazy"
          />
          <span className="story-photo-label">DILANKA EXPRESS · AMPARA</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">ROOTED IN AMPARA. CONNECTED TO YOU.</span>
          <h2>
            For the places
            <br />
            that matter.
          </h2>
          <p>
            A trip home. A new beginning. A weekend by the coast. There’s a
            story behind every journey.
          </p>
          <p>
            Dilanka Express connects communities through normal, luxury, super
            luxury and tourist transport services across Sri Lanka.
          </p>
          <Link href="/about" className="text-link">
            Get to know Dilanka <ArrowUpRight size={19} />
          </Link>
          <div className="story-contact">
            <Phone size={20} />
            <span>
              A question before you travel?
              <strong>
                <a href="tel:+94777914680">0777 914680</a>
              </strong>
            </span>
          </div>
        </div>
      </section>
      <section className="container bottom-cta">
        <div>
          <span className="eyebrow">NEXT STOP: YOUR NEXT CHAPTER</span>
          <h2>Let’s get you there.</h2>
        </div>
        <Link href="/search" className="button button-dark">
          Find a journey <ArrowRight size={20} />
        </Link>
      </section>
    </>
  );
}
function RouteCard({ route: r, index }: { route: Route; index: number }) {
  return (
    <Link
      href={`/search?from=${r.origin}&to=${r.destination}&date=${tomorrow()}`}
      className={`route-card route-tone-${index % 3}`}
    >
      <div className="route-art">
        <img
          src={
            /kandy|oluvil/.test(r.id)
              ? "/images/dilanka-hills.webp"
              : "/images/dilanka-lineup.webp"
          }
          alt="Dilanka Express fleet photograph; sample trip assignment"
          loading="lazy"
        />
        <span className="route-number">0{index + 1}</span>
        <span className="route-art-label">
          {/kandy|oluvil/.test(r.id)
            ? "THROUGH THE HILLS"
            : expresswayRoute(r)
              ? "THE EXPRESSWAY"
              : "TOWARDS THE COAST"}
        </span>
      </div>
      <div className="route-card-body">
        <span className="eyebrow">{r.via}</span>
        <h3>
          {r.origin}
          <ArrowRight size={24} />
          {r.destination}
        </h3>
        <div className="route-card-meta">
          <span>
            <Clock size={14} />
            {Math.floor(r.duration / 60)}h {r.duration % 60 || ""}
            {r.duration % 60 ? "m" : ""} · sample duration
          </span>
          <span className="circle-arrow">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
export function SearchPage() {
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
        eyebrow="YOUR JOURNEY STARTS HERE"
        title={from && to ? `${from} to ${to}` : "Where would you like to go?"}
        description="A clear view of your journey. A seat that feels right."
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
          Client preview: upcoming trips, fares and intermediate times are
          demonstration data. No payment is collected.
        </Notice>
        <div className="results-toolbar">
          <span>
            <strong>{loading ? "…" : filtered.length}</strong> departures ·{" "}
            {dateLabel(`${date}T12:00:00+05:30`)}
          </span>
          <div>
            <select
              aria-label="Filter bus layout"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All coaches</option>
              <option value="49">49-seat luxury</option>
              <option value="51">51-seat premium</option>
              <option value="53">53-seat NE-3230</option>
            </select>
            <select
              aria-label="Filter departure time"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="all">Any time</option>
              <option value="day">Before 5 PM</option>
              <option value="evening">After 5 PM</option>
            </select>
            <select
              aria-label="Sort journeys"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="time">Earliest departure</option>
              <option value="price">Lowest fare</option>
            </select>
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <Notice type="error">
            {error} <button onClick={() => location.reload()}>Try again</button>
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
                    alt="Dilanka Yutong coaches · fleet reference photo"
                    loading="lazy"
                  />
                  <div>
                    <h3>{t.bus.name}</h3>
                    <span>
                      {t.bus.registration} · {t.bus.capacity} seats
                    </span>
                  </div>
                  <span className="badge">DEMO SERVICE</span>
                  <small className="trip-photo-note">
                    Fleet photo · assignment is illustrative
                  </small>
                </div>
                <div className="trip-main">
                  <div className="trip-time">
                    <strong>{time(boardTime)}</strong>
                    <span>{startStop.name}</span>
                    <small>{dateLabel(boardTime)}</small>
                  </div>
                  <div className="trip-line">
                    <span>
                      {Math.floor(duration / 60)}h {duration % 60}m
                    </span>
                    <div>
                      <i />
                      <span />
                      <i />
                    </div>
                    <small>{t.route.via}</small>
                  </div>
                  <div className="trip-time">
                    <strong>{time(endTime)}</strong>
                    <span>{endStop.name}</span>
                    <small>
                      {sriDate(new Date(boardTime)) !==
                      sriDate(new Date(endTime)) ? (
                        <b className="next-day">+1 day · </b>
                      ) : null}
                      {dateLabel(endTime)}
                    </small>
                  </div>
                  <div className="trip-price">
                    <small>Per seat, including fee</small>
                    <strong>{money(t.fare + t.fee)}</strong>
                    <span>
                      {money(t.fare)} fare + {money(t.fee)} fee
                    </span>
                  </div>
                  <div className="trip-action">
                    {closed ? (
                      <span className="badge muted">Booking closed</span>
                    ) : t.available ? (
                      <Link
                        className="button button-dark"
                        href={`/book/${t.id}?pickup=${encodeURIComponent(from || t.route.origin)}&dropoff=${encodeURIComponent(to || t.route.destination)}`}
                      >
                        Choose seats <ArrowRight size={17} />
                      </Link>
                    ) : (
                      <span className="badge muted">Sold out</span>
                    )}
                    <small>{t.available} seats available</small>
                  </div>
                </div>
                <div className="trip-bottom">
                  <span>
                    <Wind size={14} /> Air conditioning
                  </span>
                  <span>
                    <Armchair size={14} /> Reclining seats
                  </span>
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
            <h2>No departures match this journey.</h2>
            <p>
              Try another date, route or filter. Our demo timetable covers the
              next two weeks.
            </p>
            <Link href="/routes" className="button button-dark">
              Explore routes <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
      <div className="spacer" />
    </>
  );
}
export function InfoPage({ kind }: { kind: string }) {
  const [catalog, setCatalog] = useState(initialRoutes);
  const [fleet, setFleet] = useState(buses);
  const [policy, setPolicy] = useState({
    bagKg: 15,
    arrivalMinutes: 30,
    cancellationMinutes: 180,
    cutoffMinutes: 180,
  });
  useEffect(() => {
    api("catalog")
      .then((d) => {
        setPolicy(d.policy);
        setCatalog(d.routes);
        setFleet(d.buses);
      })
      .catch(() => {});
  }, []);
  if (kind === "routes")
    return (
      <>
        <PageTitle
          eyebrow="CONNECTED BY THE ROAD"
          title="Somewhere good awaits."
          description="Explore Dilanka’s published corridors, with sample departures ready to try."
        />
        <div className="container route-cards all-routes">
          {catalog.map((r, i) => (
            <RouteCard route={r} index={i} key={r.id} />
          ))}
        </div>
        <div className="container section">
          <Notice>
            Routes are informed by company announcements. Upcoming departures,
            fares, vehicle assignments and stop times are demo data.
          </Notice>
          <Link href="/search" className="text-link">
            Browse all upcoming departures <ArrowRight size={18} />
          </Link>
        </div>
      </>
    );
  if (kind === "fleet")
    return (
      <>
        <PageTitle
          eyebrow="YOUR SPACE ON THE ROAD"
          title="Settle into the journey."
          description="Meet the fleet inspiration behind our Dilanka Express prototype."
        />
        <div className="container fleet-cover">
          <img
            src="/images/dilanka-lineup.webp"
            alt="Dilanka Express fleet and team in Ampara"
          />
        </div>
        <div className="container section fleet-grid">
          {fleet.map((b) => (
            <article className="panel" key={b.id}>
              <img
                className="fleet-card-photo"
                src="/images/fleet.webp"
                alt="Dilanka fleet reference; not a verified trip assignment"
                loading="lazy"
              />
              <span className="eyebrow">{b.registration}</span>
              <h2>{b.name}</h2>
              <p>{b.capacity} numbered seats</p>
              {b.amenities.map((a) => (
                <p className="check-line" key={a}>
                  <Check size={17} />
                  {a}
                </p>
              ))}
              <small>
                {b.id === "ne3230"
                  ? "Seat chart observed on Magiya. Trips remain demonstrations."
                  : "Reference seat template with a fictional demo vehicle assignment."}
              </small>
            </article>
          ))}
        </div>
        <JourneyMedia />
      </>
    );
  if (kind === "about")
    return (
      <>
        <PageTitle
          eyebrow="THE PEOPLE BEHIND THE JOURNEY"
          title="Rooted in Ampara."
          description="Connecting people, communities and the moments that matter."
        />
        <section className="container story-section section">
          <div className="story-photo">
            <img src="/images/fleet.webp" alt="Dilanka Express fleet" />
          </div>
          <div className="story-copy">
            <h2>
              Your luxury
              <br />
              travel partner.
            </h2>
            <p>
              Dilanka Enterprises (Pvt) Ltd is based in Ampara. Its public
              company profile describes normal, luxury, super luxury and tourist
              services in Sri Lanka’s passenger transport sector.
            </p>
            <p>
              This booking prototype brings those journeys into one clear
              experience: find a departure, choose a seat, and keep your ticket
              close.
            </p>
            <Link href="/routes" className="text-link">
              Explore the routes <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </>
    );
  if (kind === "contact")
    return (
      <>
        <PageTitle
          eyebrow="A REAL PERSON. A LITTLE HELP."
          title="Let’s talk travel."
          description="For company enquiries and real travel arrangements, contact Dilanka directly."
        />
        <div className="container contact-grid section">
          <a className="panel contact-panel" href="tel:+94777914680">
            <Phone />
            <span className="eyebrow">GENERAL HOTLINE</span>
            <h2>0777 914680</h2>
            <p>Also available: 0777 205634</p>
            <span className="text-link">
              Give us a call <ArrowUpRight size={18} />
            </span>
          </a>
          <a
            className="panel contact-panel"
            href="mailto:dilankaexpress@gmail.com"
          >
            <Mail />
            <span className="eyebrow">EMAIL THE TEAM</span>
            <h3>dilankaexpress@gmail.com</h3>
            <p>Company and travel enquiries.</p>
            <span className="text-link">
              Write an email <ArrowUpRight size={18} />
            </span>
          </a>
          <a
            className="panel contact-panel"
            href="https://www.google.com/maps/search/?api=1&query=BL-26+3rd+Lane+Ampara+Sri+Lanka"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin />
            <span className="eyebrow">OUR HOME</span>
            <h2>Ampara</h2>
            <p>
              BL-26, 3rd Lane
              <br />
              Ampara, Sri Lanka
            </p>
            <span className="text-link">
              Open map search <ArrowUpRight size={18} />
            </span>
          </a>
        </div>
        <div className="container bottom-cta">
          <div>
            <h2>A quick question?</h2>
            <p>Open WhatsApp to start a conversation yourself.</p>
          </div>
          <a
            className="button button-dark"
            href="https://wa.me/94777914680"
            target="_blank"
            rel="noreferrer"
          >
            Open WhatsApp <ArrowUpRight size={18} />
          </a>
        </div>
      </>
    );
  return (
    <>
      <PageTitle
        eyebrow="A LITTLE CLARITY BEFORE YOU GO"
        title="Travel, with confidence."
        description="Your guide to this demonstration booking experience."
      />
      <div className="container help-layout section">
        <div className="panel">
          <h2>Good to know.</h2>
          {[
            [
              "Is this a real travel ticket?",
              "No. This is a client prototype. Bookings persist and QR verification works, but all tickets are demonstrations and no payment is taken.",
            ],
            [
              "Do I need an account?",
              "No. Book as a guest. Keep the private ticket link or your booking reference and access code to retrieve your booking.",
            ],
            [
              "How do seat holds work?",
              "Your selected seats are held temporarily while you complete the booking. The visible timer shows when the hold expires. You can reselect seats if needed.",
            ],
            [
              "How much luggage can I bring?",
              `Our editable demo policy allows one bag up to ${policy.bagKg} kg per seat. Actual luggage terms must be confirmed with Dilanka.`,
            ],
            [
              "When should I arrive?",
              `The demo guidance is ${policy.arrivalMinutes} minutes before your boarding time.`,
            ],
            [
              "Can I cancel?",
              `Unboarded demo bookings can be cancelled until ${policy.cancellationMinutes} minutes before departure. No money moves. These are draft rules for client review.`,
            ],
            [
              "When does booking close?",
              `The demo booking cutoff is ${policy.cutoffMinutes} minutes before departure.`,
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <ChevronRight size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <aside>
          <div className="panel">
            <Phone />
            <h3>A question about real travel?</h3>
            <p>Please speak with Dilanka before making travel arrangements.</p>
            <a className="text-link" href="tel:+94777914680">
              0777 914680 <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="panel" id="privacy">
            <h3>Privacy in this prototype</h3>
            <p>
              Names and contact details entered here are stored for the demo
              booking and visible to authorised staff. Public QR pages do not
              show phone numbers or email addresses.
            </p>
            <p>
              Use fictional passenger details for demonstrations. No card or
              identity-document details are collected. Contact the project owner
              to remove demo records.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
