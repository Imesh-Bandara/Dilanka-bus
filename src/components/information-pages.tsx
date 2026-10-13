"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  BusFront,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { api, Notice } from "./site";
import { JourneyMap } from "./journey-map";
import { JourneyMedia } from "./journey-media";
import { routes as sampleRoutes, buses as sampleBuses } from "@/lib/seed";
import { expresswayRoute } from "@/lib/journey-map";
import { sriDate, type Route, type Bus } from "@/lib/types";

function nextDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return sriDate(d);
}
function routeLink(r: Route) {
  return `/search?from=${encodeURIComponent(r.origin)}&to=${encodeURIComponent(r.destination)}&date=${nextDate()}`;
}
function routePhoto(r: Route) {
  if (/kandy/i.test(`${r.via} ${r.destination}`))
    return "/images/destination-kandy.webp";
  if (/matara/i.test(`${r.destination} ${r.origin}`))
    return "/images/destination-matara.webp";
  if (/colombo/i.test(r.destination)) return "/images/destination-colombo.webp";
  return "/images/dilanka-hills.webp";
}
function routePhotoAlt(r: Route) {
  const photo = routePhoto(r);
  return photo.includes("kandy")
    ? "Kandy Lake · corridor inspiration"
    : photo.includes("matara")
      ? "Sri Lankan coastline · destination inspiration"
      : photo.includes("colombo")
        ? "Colombo city · destination inspiration"
        : "Dilanka Express on a Sri Lankan road";
}
const titles: Record<
  string,
  {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    image: string;
    alt: string;
  }
> = {
  routes: {
    eyebrow: "CONNECTED BY THE ROAD",
    title: "A place to go.",
    accent: "A journey to enjoy.",
    description:
      "From familiar city streets to the road less hurried. Explore the corridors that bring us together.",
    image: "/images/dilanka-hills.webp",
    alt: "A Dilanka Express coach travelling through Sri Lanka’s hills",
  },
  fleet: {
    eyebrow: "YOUR SPACE ON THE ROAD",
    title: "The journey feels",
    accent: "different here.",
    description:
      "Get to know the coaches behind the journey, explore the seat templates, and take a closer look at Dilanka.",
    image: "/images/dilanka-fleet-original.webp",
    alt: "Four gold Dilanka Express coaches at the depot",
  },
  about: {
    eyebrow: "THE PEOPLE BEHIND THE JOURNEY",
    title: "Rooted in Ampara.",
    accent: "Moving together.",
    description:
      "A connection to home. A new destination. The people and places that make every journey matter.",
    image: "/images/dilanka-lineup.webp",
    alt: "The Dilanka Express fleet and team",
  },
  contact: {
    eyebrow: "A REAL PERSON. A LITTLE HELP.",
    title: "Good journeys start",
    accent: "with a conversation.",
    description:
      "Planning a trip or looking for a little guidance? Speak with the Dilanka team about real travel arrangements.",
    image: "/images/dilanka-fleet-original.webp",
    alt: "Dilanka Express coaches in Ampara",
  },
  help: {
    eyebrow: "A LITTLE CLARITY BEFORE YOU GO",
    title: "Less wondering.",
    accent: "More looking forward.",
    description:
      "From choosing a seat to keeping your QR ticket close. Find the details you need for this booking preview.",
    image: "/images/destination-matara.webp",
    alt: "Sri Lanka’s turquoise southern coastline",
  },
};
function PhotoHeading({ kind }: { kind: string }) {
  const p = titles[kind] || titles.help;
  return (
    <section className={`inner-hero inner-hero-${kind}`}>
      <div className="container inner-hero-grid">
        <div className="inner-hero-copy">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>
              {kind === "help"
                ? "Help & policies"
                : kind === "about"
                  ? "Our story"
                  : kind === "contact"
                    ? "Contact"
                    : `Our ${kind}`}
            </span>
          </div>
          <span className="eyebrow">{p.eyebrow}</span>
          <h1>
            {p.title}
            <em>{p.accent}</em>
          </h1>
          <p>{p.description}</p>
          <span className="inner-signature">
            <span /> DILANKA EXPRESS · SRI LANKA
          </span>
        </div>
        <div className="inner-hero-photo">
          <img src={p.image} alt={p.alt} />
          <span>THE ROAD AHEAD, WITH DILANKA.</span>
        </div>
      </div>
    </section>
  );
}
function Assistance({
  title = "A little help goes a long way.",
}: {
  title?: string;
}) {
  return (
    <section className="container inner-assistance">
      <div>
        <span className="eyebrow">WE’RE HERE TO HELP</span>
        <h2>{title}</h2>
        <p>
          For current services and real travel arrangements, talk to the team.
        </p>
      </div>
      <a className="button button-dark" href="tel:+94777914680">
        <Phone size={16} />
        0777 914680
        <ArrowUpRight size={16} />
      </a>
    </section>
  );
}
function FleetCoach({ bus: b, index }: { bus: Bus; index: number }) {
  return (
    <article className="coach-profile">
      <div className="coach-photo">
        <img
          src={
            index === 1
              ? "/images/dilanka-fleet-original.webp"
              : "/images/fleet.webp"
          }
          alt="Dilanka fleet reference photograph; vehicle assignment is illustrative"
          loading="lazy"
        />
        <span className="coach-index">0{index + 1} / THE FLEET</span>
      </div>
      <div className="coach-copy">
        <div className="coach-labels">
          <span className="eyebrow">{b.registration}</span>
          <span className="badge">{b.capacity} SEATS</span>
        </div>
        <h2>{b.name}</h2>
        <p>A closer look at the space for your next journey.</p>
        <div className="coach-amenities">
          {b.amenities.map((a) => (
            <span key={a}>
              <Check size={16} />
              {a}
            </span>
          ))}
        </div>
        <p className="small-note">
          {b.id === "ne3230"
            ? "Seat chart observed on Magiya. Upcoming assignments remain demonstrations."
            : "Sample seat template and fictional demo vehicle assignment."}{" "}
          Fleet photographs are references.
        </p>
        <details className="coach-layout">
          <summary>
            <Armchair size={17} />
            Explore the {b.capacity}-seat layout
            <ChevronDown size={16} />
          </summary>
          <div className="mini-coach">
            <span className="mini-coach-front">
              <BusFront size={17} /> FRONT · DRIVER
            </span>
            {b.layout.map((row, i) => (
              <div className="mini-seat-row" key={i}>
                {row.map((seat, j) => (
                  <span
                    key={j}
                    style={{
                      gridColumn: row.length === 4 && j >= 2 ? j + 2 : j + 1,
                    }}
                    className={seat ? "mini-seat" : "mini-seat-space"}
                  >
                    {seat ? String(seat).padStart(2, "0") : ""}
                  </span>
                ))}
              </div>
            ))}
            <small>REAR · REFERENCE LAYOUT</small>
          </div>
          <p className="small-note">
            Preview only. Available seats are shown for your chosen departure.
          </p>
        </details>
        <Link className="text-link" href="/search">
          Find a journey
          <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}

export function InformationPages({ kind }: { kind: string }) {
  const [routes, setRoutes] = useState(sampleRoutes),
    [fleet, setFleet] = useState(sampleBuses),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all");
  const [policy, setPolicy] = useState({
    bagKg: 15,
    arrivalMinutes: 30,
    cancellationMinutes: 180,
    cutoffMinutes: 180,
  });
  useEffect(() => {
    setQuery("");
    setCategory("all");
  }, [kind]);
  useEffect(() => {
    api("catalog")
      .then((c) => {
        setRoutes(c.routes);
        setFleet(c.buses);
        setPolicy(c.policy);
      })
      .catch(() => {});
  }, []);
  const faqs = [
    {
      category: "booking",
      q: "Is this a real travel ticket?",
      a: "This is a client prototype. Bookings are saved and QR verification works, but tickets are demonstrations, are not valid for travel, and no payment is taken.",
    },
    {
      category: "booking",
      q: "Do I need an account?",
      a: "No. Book as a guest. Keep the private ticket link or your booking reference and access code to retrieve your booking.",
    },
    {
      category: "booking",
      q: "How do seat holds work?",
      a: "Your selected seats are held temporarily while you complete the booking. The visible timer shows when the hold expires. Reselect your seats if the timer runs out.",
    },
    {
      category: "tickets",
      q: "Where can I find my ticket again?",
      a: "Open Find my ticket and enter your booking reference and private access code. You can also use your original private link. Download the PDF from your confirmation page to keep a copy.",
    },
    {
      category: "tickets",
      q: "What happens when I scan the QR code?",
      a: "The QR opens the public verification page for that seat. It shows ticket status and journey details without phone numbers or email addresses. Only authorised staff can check in a ticket.",
    },
    {
      category: "travel",
      q: "How much luggage can I bring?",
      a: `The editable demo policy allows one bag up to ${policy.bagKg} kg per seat. Confirm actual luggage terms with Dilanka before travelling.`,
    },
    {
      category: "travel",
      q: "When should I arrive?",
      a: `The demo guidance is ${policy.arrivalMinutes} minutes before your boarding time. Intermediate stop times and exact boarding points require operator confirmation.`,
    },
    {
      category: "tickets",
      q: "Can I cancel my booking?",
      a: `Unboarded demo bookings can be cancelled until ${policy.cancellationMinutes} minutes before departure. Open your private ticket page to cancel. No money moves; these are draft rules for client review.`,
    },
    {
      category: "booking",
      q: "When does booking close?",
      a: `The current demo cutoff is ${policy.cutoffMinutes} minutes before the bus starts its departure. Choose a later departure if booking has closed.`,
    },
    {
      category: "travel",
      q: "Does the map show the exact bus route?",
      a: "The map shows an illustrative corridor and town-centre markers, with highway sections highlighted where applicable. It is not live tracking or turn-by-turn directions. Ask Dilanka to confirm boarding locations.",
    },
  ];
  const matchingFaqs = faqs.filter(
    (f) =>
      (category === "all" || category === f.category) &&
      `${f.q} ${f.a}`.toLowerCase().includes(query.toLowerCase()),
  );
  const matchingRoutes = routes.filter(
    (r) =>
      `${r.origin} ${r.destination} ${r.via} ${r.stops.map((s) => s.name).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === "all" ||
        (category === "highway" ? expresswayRoute(r) : !expresswayRoute(r))),
  );
  return (
    <div className={`information-page information-${kind}`}>
      <PhotoHeading kind={kind} />
      {kind === "routes" && (
        <section className="container inner-section">
          <div className="inner-section-heading">
            <div>
              <span className="eyebrow">FIND YOUR CONNECTION</span>
              <h2>Where will the road take you?</h2>
            </div>
            <Link href="/search" className="text-link">
              All departures
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="browse-toolbar">
            <label className="browse-search">
              <Search size={18} />
              <input
                aria-label="Search routes"
                placeholder="Search a town or route…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="browse-tabs" aria-label="Route type">
              {[
                ["all", "All routes"],
                ["highway", "Expressway"],
                ["main", "Main road"],
              ].map(([v, label]) => (
                <button
                  key={v}
                  aria-pressed={category === v}
                  onClick={() => setCategory(v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="browse-count">
            {matchingRoutes.length}{" "}
            {matchingRoutes.length === 1 ? "corridor" : "corridors"} to explore
            · sample timetable
          </p>
          <div className="corridor-grid">
            {matchingRoutes.map((r, i) => (
              <article className="corridor" key={r.id}>
                <Link href={routeLink(r)} className="corridor-image">
                  <img
                    src={routePhoto(r)}
                    alt={routePhotoAlt(r)}
                    loading="lazy"
                  />
                  <span className="corridor-tag">
                    {expresswayRoute(r)
                      ? "VIA EXPRESSWAY"
                      : "MAIN-ROAD JOURNEY"}
                  </span>
                  <span className="corridor-open">
                    <ArrowUpRight size={22} />
                  </span>
                </Link>
                <div className="corridor-copy">
                  <span className="eyebrow">
                    CORRIDOR {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>
                    {r.origin}
                    <ArrowRight size={20} />
                    {r.destination}
                  </h3>
                  <p>{r.via}</p>
                  <div className="corridor-meta">
                    <span>
                      <Clock size={14} />
                      {Math.floor(r.duration / 60)}h{" "}
                      {r.duration % 60 ? `${r.duration % 60}m` : ""} sample
                    </span>
                    <span>
                      <MapPin size={14} />
                      {r.stops.length} listed stops
                    </span>
                  </div>
                  <Link href={routeLink(r)} className="text-link">
                    View departures
                    <ArrowRight size={17} />
                  </Link>
                </div>
                <JourneyMap route={r} />
              </article>
            ))}
          </div>
          {!matchingRoutes.length && (
            <div className="empty-state">
              <MapPin size={35} />
              <h3>No corridors found.</h3>
              <p>Try another town or show all routes.</p>
              <button
                className="button button-outline"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
          <Notice>
            Corridors are informed by company announcements. Upcoming schedules,
            fares, vehicle assignments and stop times are sample data. Confirm
            real travel with Dilanka.
          </Notice>
          <details className="image-credits">
            <summary>Destination photo credits</summary>
            <p>
              Destination inspiration:{" "}
              <a
                href="https://unsplash.com/photos/lotus-tower-stands-tall-over-a-city-skyline-6iqB-y0EBCw"
                target="_blank"
                rel="noreferrer"
              >
                Colombo
              </a>{" "}
              ·{" "}
              <a
                href="https://unsplash.com/photos/a-serene-lake-under-a-clear-blue-sky-haJVERPHkGE"
                target="_blank"
                rel="noreferrer"
              >
                Kandy
              </a>{" "}
              ·{" "}
              <a
                href="https://unsplash.com/photos/aerial-view-of-a-tropical-beach-with-rocky-coastline-7II6rU76_3Q"
                target="_blank"
                rel="noreferrer"
              >
                Sri Lankan coastline
              </a>{" "}
              via Unsplash. Dilanka photographs supplied by the client or
              sourced from the company’s public page.
            </p>
          </details>
        </section>
      )}
      {kind === "fleet" && (
        <>
          <section className="container inner-section">
            <div className="inner-section-heading">
              <div>
                <span className="eyebrow">MEET YOUR COACH</span>
                <h2>Room for the road ahead.</h2>
              </div>
              <p>
                Photos of the Dilanka fleet.
                <br />
                Seat templates for this booking preview.
              </p>
            </div>
            <div className="coach-profiles">
              {fleet.map((b, i) => (
                <FleetCoach key={b.id} bus={b} index={i} />
              ))}
            </div>
          </section>
          <JourneyMedia />
        </>
      )}
      {kind === "about" && (
        <>
          <section className="container inner-section company-story">
            <div className="company-story-image">
              <img
                src="/images/dilanka-fleet-original.webp"
                alt="Dilanka’s gold coaches lined up in Ampara"
                loading="lazy"
              />
              <span>AMPARA, SRI LANKA · OUR HOME ON THE ROAD</span>
            </div>
            <div>
              <span className="eyebrow">DILANKA ENTERPRISES (PVT) LTD</span>
              <h2>
                More than a destination.
                <br />
                <em>A connection.</em>
              </h2>
              <p>
                Dilanka Enterprises (Pvt) Ltd is based in Ampara. Its public
                company profile describes normal, luxury, super luxury and
                tourist services in Sri Lanka’s passenger transport sector.
              </p>
              <p>
                This preview brings the journey into one simple experience:
                explore a corridor, choose a departure, find your seat, and keep
                your QR ticket close.
              </p>
              <Link href="/routes" className="text-link">
                Discover our routes
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>
          <section className="company-band">
            <div className="container">
              <span className="eyebrow">A THOUGHTFUL WAY TO BOOK</span>
              <h2>
                A little care.
                <br />
                <em>At every step.</em>
              </h2>
              <div className="company-promises">
                {[
                  [
                    MapPin,
                    "Know your journey",
                    "Explore the corridor and listed stops before choosing a departure.",
                  ],
                  [
                    Armchair,
                    "Make yourself comfortable",
                    "See the numbered layout and choose the seats that suit your group.",
                  ],
                  [
                    Ticket,
                    "Keep it close",
                    "Book as a guest and save a QR ticket for every passenger.",
                  ],
                ].map(([Icon, title, copy]) => {
                  const I = Icon as typeof MapPin;
                  return (
                    <div key={String(title)}>
                      <I size={25} />
                      <h3>{String(title)}</h3>
                      <p>{String(copy)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          <section className="container company-finish">
            <img
              src="/images/dilanka-lineup.webp"
              alt="Dilanka Express team and fleet"
              loading="lazy"
            />
            <div>
              <span className="eyebrow">LET’S PLAN WHAT’S NEXT</span>
              <h2>
                Your journey.
                <br />
                Our next conversation.
              </h2>
              <p>
                Speak with the company for current departures, service details
                and travel enquiries.
              </p>
              <Link className="button button-dark" href="/contact">
                Meet the team, over a call
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </section>
        </>
      )}
      {kind === "contact" && (
        <section className="container inner-section contact-editorial">
          <div className="contact-main">
            <span className="eyebrow">TALK TO DILANKA</span>
            <h2>
              A familiar voice.
              <br />
              <em>A helpful answer.</em>
            </h2>
            <p>
              Confirm a departure, ask about your boarding point, or discuss a
              travel enquiry directly with the company.
            </p>
            <a className="contact-number" href="tel:+94777914680">
              0777 914680
              <ArrowUpRight size={28} />
            </a>
            <a className="contact-secondary" href="tel:+94777205634">
              Alternative hotline · 0777 205634
              <ArrowUpRight size={16} />
            </a>
            <a
              href="https://wa.me/94777914680"
              target="_blank"
              rel="noreferrer"
              className="button button-dark"
            >
              Open WhatsApp
              <ArrowUpRight size={17} />
            </a>
            <p className="small-note">
              WhatsApp opens a conversation for you to send. Current
              availability and travel arrangements are confirmed by the team.
            </p>
          </div>
          <div className="contact-methods">
            <a
              href="mailto:dilankaexpress@gmail.com"
              className="contact-method"
            >
              <Mail size={24} />
              <div>
                <span className="eyebrow">WRITE TO US</span>
                <h3>Email the team</h3>
                <p>dilankaexpress@gmail.com</p>
              </div>
              <ArrowUpRight size={20} />
            </a>
            <a
              className="contact-method"
              href="https://www.google.com/maps/search/?api=1&query=BL-26+3rd+Lane+Ampara+Sri+Lanka"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={24} />
              <div>
                <span className="eyebrow">BASED IN AMPARA</span>
                <h3>Our home</h3>
                <p>
                  BL-26, 3rd Lane
                  <br />
                  Ampara, Sri Lanka
                </p>
                <small>Open address search in Maps</small>
              </div>
              <ArrowUpRight size={20} />
            </a>
            <Link href="/help" className="contact-method">
              <Ticket size={24} />
              <div>
                <span className="eyebrow">USING THE BOOKING PREVIEW?</span>
                <h3>A little guidance</h3>
                <p>Tickets, seat holds and draft policies.</p>
              </div>
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
      )}
      {kind === "help" && (
        <section className="container inner-section">
          <div className="help-shortcuts">
            <Link href="/find-ticket">
              <Ticket size={23} />
              <div>
                <h3>Find my ticket</h3>
                <p>Your reference & private code</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
            <Link href="/routes">
              <MapPin size={23} />
              <div>
                <h3>Explore the route</h3>
                <p>Corridors, maps & listed stops</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
            <Link href="/contact">
              <Phone size={23} />
              <div>
                <h3>Speak to the team</h3>
                <p>Real travel enquiries</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="help-editorial">
            <aside>
              <span className="eyebrow">YOUR TRAVEL COMPANION</span>
              <h2>
                Good to know.
                <br />
                <em>Before you go.</em>
              </h2>
              <p>
                Find an answer, then get back to looking forward to the journey.
              </p>
              <a href="#privacy" className="text-link">
                Privacy in this preview
                <ArrowRight size={16} />
              </a>
              <div className="help-draft">
                <ShieldCheck size={21} />
                <h3>A preview, with clarity.</h3>
                <p>
                  All bookings are demonstrations. The policies below are
                  editable draft rules awaiting client approval.
                </p>
              </div>
            </aside>
            <div>
              <label className="browse-search">
                <Search size={18} />
                <input
                  aria-label="Search help"
                  placeholder="Search your question…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="browse-tabs help-tabs" aria-label="Help topics">
                {[
                  ["all", "All questions"],
                  ["booking", "Booking"],
                  ["tickets", "Tickets"],
                  ["travel", "Travel"],
                ].map(([v, label]) => (
                  <button
                    key={v}
                    aria-pressed={category === v}
                    onClick={() => setCategory(v)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="editorial-faq">
                {matchingFaqs.map((f) => (
                  <details key={f.q}>
                    <summary>
                      {f.q}
                      <ChevronDown size={18} />
                    </summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
              {!matchingFaqs.length && (
                <div className="empty-state">
                  <h3>No matching answers yet.</h3>
                  <p>Try a different word or contact the team.</p>
                  <button
                    className="text-link"
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                    }}
                  >
                    Show all questions
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="privacy-editorial" id="privacy">
            <ShieldCheck size={28} />
            <div>
              <span className="eyebrow">YOUR DETAILS, HANDLED WITH CARE</span>
              <h2>Privacy in this prototype.</h2>
              <p>
                Names and contact details entered here are stored for the demo
                booking and visible to authorised staff. Public QR pages do not
                show phone numbers or email addresses. Use fictional passenger
                details for demonstrations. No card or identity-document details
                are collected.
              </p>
              <p>
                Keep your private booking link and access code to yourself.
                Contact the project owner to remove demo records. This notice
                describes the prototype; approved company privacy and booking
                policies are still required before public launch.
              </p>
            </div>
          </div>
        </section>
      )}
      <Assistance />
    </div>
  );
}
