"use client";
import { useTranslation } from "./locale";
import { useEffect, useRef, useState } from "react";
import { Play, ArrowLeft, ArrowRight, X, ExternalLink } from "lucide-react";
export const galleryPhotos = [
  {
    src: "/images/dilanka-lineup.webp",
    alt: "Dilanka Express gold coaches and team lined up at the depot",
    title: "Together, on the road.",
    caption: "The Dilanka fleet · Ampara",
    source: "https://www.facebook.com/photo.php?fbid=1038245622526825",
  },
  {
    src: "/images/dilanka-hills.webp",
    alt: "A gold Dilanka Express coach winding through the green hill country",
    title: "Take the scenic way.",
    caption: "Hill-country journeys",
    source: "https://www.facebook.com/photo.php?fbid=1047297211621666",
  },
  {
    src: "/images/fleet.webp",
    alt: "Two Dilanka Express Yutong coaches at the depot",
    title: "Your next journey awaits.",
    caption: "Dilanka Yutong coaches",
    source: "https://www.facebook.com/photo/?fbid=1093924306958956",
  },
];
const videos = [
  {
    url: "https://www.facebook.com/reel/1217697760553948",
    title: "Comfort in motion",
    subtitle: "An 11-second film from Dilanka Express",
  },
  {
    url: "https://www.facebook.com/100090241902532/videos/1075628290781857/",
    title: "Meet the southern express",
    subtitle: "Dilanka’s inaugural expressway journey",
  },
];
export function HeroPhotos() {
  const tr = useTranslation();
  const [index, setIndex] = useState(2);
  const photo = galleryPhotos[index];
  return (
    <>
      <img src={photo.src} alt={tr(photo.alt)} fetchPriority="high" />
      <div
        className="hero-photo-picker"
        aria-label={tr("Hero photograph selection")}
      >
        <button
          type="button"
          aria-label={tr("Previous hero photo")}
          onClick={() =>
            setIndex((index + galleryPhotos.length - 1) % galleryPhotos.length)
          }
        >
          <ArrowLeft size={14} />
        </button>
        <span>
          {tr(String(index + 1).padStart(2, "0"))} /{tr(" ")}
          {tr(String(galleryPhotos.length).padStart(2, "0"))}
        </span>
        <button
          type="button"
          aria-label={tr("Next hero photo")}
          onClick={() => setIndex((index + 1) % galleryPhotos.length)}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}
export function JourneyMedia() {
  const tr = useTranslation();
  const dialog = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0),
    [video, setVideo] = useState<number | null>(null),
    [playing, setPlaying] = useState(false);
  const photo = galleryPhotos[index];
  useEffect(() => {
    if (video === null) return;
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVideo(null);
        setPlaying(false);
      }
      if (e.key === "Tab") {
        const controls = dialog.current?.querySelectorAll<HTMLElement>(
          "button,a[href],iframe",
        );
        if (!controls?.length) return;
        const first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("keydown", escape);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [video]);
  return (
    <section className="container section journey-media">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{tr("A GLIMPSE OF THE JOURNEY")}</span>
          <h2>{tr("See the road our way.")}</h2>
        </div>
        <p>
          {tr(" Real moments from Dilanka Express. ")}
          <br />
          {tr("A little inspiration before you travel. ")}
        </p>
      </div>
      <div className="media-grid">
        <div
          className="photo-stage"
          aria-roledescription={tr("carousel")}
          aria-label={tr("Dilanka photo gallery")}
        >
          <img
            key={photo.src}
            src={photo.src}
            alt={tr(photo.alt)}
            loading="lazy"
          />
          <div className="photo-shade" />
          <div className="photo-caption" aria-live="polite">
            <span className="eyebrow">{tr(photo.caption)}</span>
            <h3>{tr(photo.title)}</h3>
            <a href={photo.source} target="_blank" rel="noopener noreferrer">
              {tr(" From Dilanka’s Facebook ")}
              <ExternalLink size={12} />
            </a>
          </div>
          <div className="photo-controls">
            <button
              type="button"
              aria-label={tr("Previous photo")}
              onClick={() =>
                setIndex(
                  (index + galleryPhotos.length - 1) % galleryPhotos.length,
                )
              }
            >
              <ArrowLeft size={18} />
            </button>
            <span>
              {tr(String(index + 1).padStart(2, "0"))} /{tr(" ")}
              {tr(String(galleryPhotos.length).padStart(2, "0"))}
            </span>
            <button
              type="button"
              aria-label={tr("Next photo")}
              onClick={() => setIndex((index + 1) % galleryPhotos.length)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="photo-dots">
            {galleryPhotos.map((p, i) => (
              <button
                type="button"
                key={p.src}
                aria-label={tr(`Show photo ${i + 1}: ${p.caption}`)}
                aria-pressed={index === i}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
        <div className="video-column">
          <span className="eyebrow">{tr("MOMENTS IN MOTION")}</span>
          <h3>
            {tr(" A window ")}
            <br />
            {tr(" to the journey. ")}
          </h3>
          <p>
            {tr(
              " Watch Dilanka coaches out on the road, straight from the company’s video collection. ",
            )}
          </p>
          {videos.map((v, i) => (
            <button
              className="video-choice"
              type="button"
              key={v.url}
              onClick={() => {
                setVideo(i);
                setPlaying(false);
              }}
            >
              <span className="play-circle">
                <Play size={18} fill="currentColor" />
              </span>
              <span>
                <strong>{tr(v.title)}</strong>
                <small>{tr(v.subtitle)}</small>
              </span>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      </div>
      {video !== null && (
        <div
          className="video-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={tr(videos[video].title)}
          onClick={() => {
            setVideo(null);
            setPlaying(false);
          }}
        >
          <div
            ref={dialog}
            className="video-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="video-dialog-top">
              <div>
                <span className="eyebrow">{tr("DILANKA EXPRESS FILMS")}</span>
                <h3>{tr(videos[video].title)}</h3>
              </div>
              <button
                autoFocus
                type="button"
                aria-label={tr("Close video")}
                onClick={() => {
                  setVideo(null);
                  setPlaying(false);
                }}
              >
                <X size={22} />
              </button>
            </div>
            {playing ? (
              <iframe
                src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videos[video].url)}&show_text=false&width=960&autoplay=true`}
                title={tr(videos[video].title)}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="video-consent">
                <img
                  src="/images/dilanka-hills.webp"
                  alt={tr("Dilanka coach on the road")}
                />
                <button
                  className="button button-gold"
                  type="button"
                  onClick={() => setPlaying(true)}
                >
                  <Play size={19} /> {tr(" Play company video ")}
                </button>
                <p>
                  {tr(
                    " Loads Facebook’s video player. Playback may depend on Facebook sign-in and browser settings. ",
                  )}
                </p>
              </div>
            )}
            <div className="video-fallback">
              <span>{tr("Player unavailable?")}</span>
              <a
                href={videos[video].url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr(" Watch on Facebook ")}
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
