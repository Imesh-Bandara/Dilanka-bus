"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  Wind,
  Ticket,
  Phone,
  ChevronDown,
  Route as RouteIcon,
  Check,
  CalendarDays,
  UserRound,
  Compass,
} from "lucide-react";
import { JourneyMedia } from "./journey-media";
import { sriDate } from "@/lib/types";

const destinations = [
  {
    name: "Colombo",
    from: "Ampara",
    category: "City",
    tag: "THE CITY, REIMAGINED",
    image: "/images/destination-colombo.webp",
    alt: "Colombo’s Lotus Tower rising above the city skyline",
    description: "A change of pace. A world of possibilities.",
    via: "Via Kandy or the Southern Expressway",
    position: "50% 50%",
  },
  {
    name: "Kandy",
    from: "Colombo",
    category: "Hill country",
    tag: "INTO THE HILLS",
    image: "/images/destination-kandy.webp",
    alt: "Kandy Lake framed by green hills and a blue sky",
    description: "Slow down where the hills meet the lake.",
    via: "A stop along our eastern corridor",
    position: "50% 82%",
  },
  {
    name: "Matara",
    from: "Ampara",
    category: "Coast",
    tag: "FOLLOW THE COAST",
    image: "/images/destination-matara.webp",
    alt: "Turquoise waves, coastal rocks and palms on the Matara coastline",
    description: "Salt in the air. Something new on the horizon.",
    via: "Via Tangalle & Dikwella",
    position: "50% 50%",
  },
  {
    name: "Ampara",
    from: "Colombo",
    category: "Hill country",
    tag: "THE ROAD HOME",
    image: "/images/dilanka-hills.webp",
    alt: "A Dilanka coach travelling through green Sri Lankan hills",
    description: "Familiar faces. A place that feels like home.",
    via: "Via Kandy or the Southern Expressway",
    position: "50% 65%",
  },
];
const faqs = [
  [
    "Do I need an account to book?",
    "No. Choose your route, date and seats, then enter your passenger details. Save your private booking link and access code so you can find your tickets again.",
  ],
  [
    "How do I receive my ticket?",
    "Your demo QR tickets appear immediately after confirmation. You can download a PDF or print them. Email and SMS delivery are not connected in this prototype.",
  ],
  [
    "Can I see the stops before booking?",
    "Yes. Open “Explore route & stops” on a departure to view the corridor, stop list and sample times. Exact boarding locations still need operator confirmation.",
  ],
  [
    "Is this a real ticket booking?",
    "This is a client preview. Trips, fares and policies are demonstration data. No payment is collected, and demo tickets are not valid for travel.",
  ],
];
export function LandingPage({ search }: { search: ReactNode }) {
  const [filter, setFilter] = useState("All journeys");
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  const tomorrow = sriDate(date);
  return (
    <div className="landing-page">
      <section className="luxe-hero" aria-labelledby="landing-title">
        <img
          className="luxe-hero-photo"
          src="/images/dilanka-fleet-enhanced.webp"
          alt="Dilanka Express gold coach fleet, photograph enhanced for presentation"
          fetchPriority="high"
        />
        <div className="luxe-hero-shade" />
        <div className="container luxe-hero-inner">
          <div className="luxe-hero-copy">
            <span className="luxe-kicker">
              <i /> YOUR LUXURY TRAVEL PARTNER
            </span>
            <h1 id="landing-title">
              Every journey.
              <br />A beautiful
              <br />
              <em>beginning.</em>
            </h1>
            <p>
              From the familiar roads of home
              <br />
              to the places you’ve yet to discover.
            </p>
            <div className="luxe-hero-actions">
              <a href="#plan-journey" className="button button-gold">
                Find your journey <ArrowUpRight size={18} />
              </a>
              <a href="#our-destinations" className="luxe-explore">
                Explore destinations <ArrowRight size={17} />
              </a>
            </div>
          </div>
          <div className="luxe-hero-aside">
            <span>ROOTED IN AMPARA</span>
            <span>CONNECTED TO SRI LANKA</span>
            <i />
            <small>
              Your next chapter
              <br />
              starts on the road.
            </small>
          </div>
        </div>
        <div className="luxe-hero-bottom">
          <span>DILANKA EXPRESS</span>
          <span>FAMILIAR ROADS. NEW STORIES.</span>
          <a href="#plan-journey" aria-label="Scroll to journey search">
            <ChevronDown size={20} />
          </a>
        </div>
      </section>

      <section
        className="container luxe-search-wrap"
        id="plan-journey"
        aria-label="Plan your journey"
      >
        <div className="luxe-search-panel">
          <div className="luxe-search-top">
            <div>
              <span className="eyebrow">WHERE WILL THE ROAD TAKE YOU?</span>
              <h2>Let’s plan your next chapter.</h2>
            </div>
            <span className="luxe-guest">
              <UserRound size={14} /> No account needed
            </span>
          </div>
          {search}
          <div className="luxe-search-note">
            <span>
              <Check size={13} /> Sample trips · No payment collected
            </span>
            <Link href="/find-ticket">
              Already booked? Find your ticket <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      <div className="container luxe-reassurance">
        <span>
          <Armchair size={21} />
          <span>
            Your seat.
            <br />
            <strong>Your choice.</strong>
          </span>
        </span>
        <span>
          <CalendarDays size={21} />
          <span>
            A clear view
            <br />
            <strong>of your journey.</strong>
          </span>
        </span>
        <span>
          <Ticket size={21} />
          <span>
            Your QR ticket,
            <br />
            <strong>instantly.</strong>
          </span>
        </span>
        <a href="tel:+94777914680">
          <Phone size={21} />
          <span>
            A real person.
            <br />
            <strong>A call away.</strong>
          </span>
        </a>
      </div>

      <section className="container luxe-destinations" id="our-destinations">
        <div className="luxe-section-head">
          <div>
            <span className="eyebrow">AN ISLAND OF POSSIBILITIES</span>
            <h2>
              Somewhere new.
              <br />
              <em>Somewhere that feels like you.</em>
            </h2>
          </div>
          <p>
            The energy of the city. The quiet of the hills.
            <br />
            The coast calling your name.
            <br />
            Choose a place. We’ll help with the journey.
          </p>
        </div>
        <div className="luxe-destination-toolbar">
          <div
            className="destination-filters"
            role="group"
            aria-label="Filter destinations"
          >
            {["All journeys", "City", "Hill country", "Coast"].map((f) => (
              <button
                type="button"
                key={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <Link href="/routes">
            All routes <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="luxe-destination-grid">
          {destinations
            .filter((d) => filter === "All journeys" || d.category === filter)
            .map((d, i) => (
              <Link
                className={`luxe-destination destination-${d.name.toLowerCase()}`}
                href={`/search?from=${d.from}&to=${d.name}&date=${tomorrow}`}
                key={d.name}
              >
                <img
                  src={d.image}
                  alt={d.alt}
                  loading="lazy"
                  style={{ objectPosition: d.position }}
                />
                <div className="destination-shade" />
                <span className="destination-tag">{d.tag}</span>
                <span className="destination-index">0{i + 1}</span>
                <div className="destination-copy">
                  <span className="destination-from">
                    {d.from} <ArrowRight size={13} />
                  </span>
                  <h3>{d.name}</h3>
                  <p>{d.description}</p>
                  <div>
                    <span>{d.via}</span>
                    <span className="destination-arrow">
                      <ArrowUpRight size={22} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
        <p className="luxe-demo-caption">
          Explore sample departures. Destination photographs show the places,
          not confirmed boarding locations.
        </p>
      </section>

      <section className="luxe-comfort">
        <div className="container luxe-comfort-grid">
          <div className="luxe-comfort-copy">
            <span className="eyebrow">
              THE JOURNEY IS PART OF THE EXPERIENCE
            </span>
            <h2>
              A little more care.
              <br />
              <em>All the way there.</em>
            </h2>
            <p>
              Make room for the journey itself. Choose a seat that suits you,
              see the stops ahead, and keep your ticket close.
            </p>
            <div className="comfort-detail">
              <Wind size={23} />
              <div>
                <h3>A comfortable place to settle in.</h3>
                <p>
                  Explore air-conditioned coaches and choose a numbered seat
                  that suits your journey.
                </p>
              </div>
            </div>
            <div className="comfort-detail">
              <RouteIcon size={23} />
              <div>
                <h3>Know the road ahead.</h3>
                <p>
                  Preview your corridor, stops and highway sections before
                  choosing a departure.
                </p>
              </div>
            </div>
            <div className="comfort-detail">
              <Ticket size={23} />
              <div>
                <h3>One less thing to think about.</h3>
                <p>
                  Keep your QR ticket on your phone or download a copy for your
                  journey.
                </p>
              </div>
            </div>
            <Link href="/fleet" className="luxe-text-link">
              Meet the Dilanka fleet <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="luxe-comfort-image">
            <img
              src="/images/dilanka-fleet-original.webp"
              alt="Original photograph of four Dilanka Express gold coaches supplied by the client"
              loading="lazy"
            />
            <div className="comfort-image-label">
              <span>THE DILANKA FLEET</span>
              <strong>
                A familiar name.
                <br />A fresh perspective.
              </strong>
            </div>
            <span className="comfort-image-number">DE / 01</span>
          </div>
        </div>
      </section>

      <section className="container luxe-booking-steps">
        <div className="luxe-section-head">
          <div>
            <span className="eyebrow">
              LESS PLANNING. MORE LOOKING FORWARD.
            </span>
            <h2>
              Your next journey,
              <br />
              <em>in three simple steps.</em>
            </h2>
          </div>
          <a href="#plan-journey" className="luxe-text-link">
            Start your booking <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="luxe-step-grid">
          {[
            {
              icon: Compass,
              title: "Find your way.",
              text: "Choose your starting point, destination and travel date.",
            },
            {
              icon: Armchair,
              title: "Make yourself comfortable.",
              text: "Compare departures, explore the route and choose your seats.",
            },
            {
              icon: Ticket,
              title: "Keep your ticket close.",
              text: "Confirm your demo booking and save your individual QR tickets.",
            },
          ].map((s, i) => (
            <article key={s.title}>
              <div className="luxe-step-top">
                <span>0{i + 1}</span>
                <s.icon size={25} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <JourneyMedia />

      <section className="container luxe-story">
        <div className="luxe-story-photo">
          <img
            src="/images/dilanka-lineup.webp"
            alt="The Dilanka Express team with their gold coach fleet"
            loading="lazy"
          />
          <span>AMPARA, SRI LANKA · DILANKA EXPRESS</span>
        </div>
        <div className="luxe-story-copy">
          <span className="eyebrow">
            ROOTED IN A PLACE. BUILT AROUND PEOPLE.
          </span>
          <h2>
            The roads we know.
            <br />
            <em>The people who matter.</em>
          </h2>
          <p>
            A trip home. A new beginning. A weekend by the coast. Behind every
            journey, there’s a reason to go.
          </p>
          <p>
            Based in Ampara, Dilanka Express connects communities through
            normal, luxury, super luxury and tourist transport services.
          </p>
          <Link href="/about" className="luxe-text-link">
            Our story <ArrowUpRight size={18} />
          </Link>
          <div className="luxe-story-contact">
            <span>LET’S TALK ABOUT YOUR JOURNEY</span>
            <a href="tel:+94777914680">
              0777 914680 <Phone size={20} />
            </a>
          </div>
        </div>
      </section>

      <section className="container luxe-faq">
        <div>
          <span className="eyebrow">A LITTLE CLARITY BEFORE YOU GO</span>
          <h2>
            Good questions.
            <br />
            <em>Simple answers.</em>
          </h2>
          <Link href="/help" className="luxe-text-link">
            More help & policies <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="luxe-faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <ChevronDown size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="luxe-last-call">
        <img
          src="/images/destination-matara.webp"
          alt="Sri Lanka’s southern coastline"
          loading="lazy"
        />
        <div className="last-call-shade" />
        <div className="container">
          <span className="eyebrow">NEXT STOP: YOUR NEXT CHAPTER</span>
          <h2>
            There’s a good journey
            <br />
            <em>waiting for you.</em>
          </h2>
          <a href="#plan-journey" className="button button-gold">
            Let’s get you there <ArrowUpRight size={18} />
          </a>
          <span className="last-call-signature">Dilanka Express</span>
        </div>
      </section>

      <div className="container landing-photo-credits">
        <details>
          <summary>Photography & presentation credits</summary>
          <p>
            Fleet hero: an AI-enhanced version of the client-supplied Dilanka
            photograph; the original is shown in the fleet section. Destination
            images:{" "}
            <a
              href="https://unsplash.com/photos/lotus-tower-stands-tall-over-a-city-skyline-6iqB-y0EBCw"
              target="_blank"
              rel="noopener noreferrer"
            >
              Colombo — Manorie Kodithuwakku
            </a>
            ,{" "}
            <a
              href="https://unsplash.com/photos/a-serene-lake-under-a-clear-blue-sky-haJVERPHkGE"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kandy — Ajai S
            </a>
            ,{" "}
            <a
              href="https://unsplash.com/photos/aerial-view-of-a-tropical-beach-with-rocky-coastline-7II6rU76_3Q"
              target="_blank"
              rel="noopener noreferrer"
            >
              Matara — Kasun Eranda
            </a>
            , via Unsplash. Additional fleet media comes from Dilanka’s public
            Facebook page.
          </p>
        </details>
      </div>
    </div>
  );
}
