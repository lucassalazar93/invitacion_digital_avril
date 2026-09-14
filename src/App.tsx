import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  Baby,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Church,
  Clock3,
  Gift,
  Heart,
  MapPin,
  Navigation,
  PartyPopper,
  Sparkles,
  Star,
} from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import confetti from "canvas-confetti";

import { invitationConfig as cfg } from "./invitationConfig";
import { supabase } from "./supabase";

gsap.registerPlugin(ScrollTrigger);

const invitationDate = new Date(cfg.date.iso);

/* =========================================================
   CUENTA REGRESIVA
========================================================= */

function getCountdown() {
  const distance = Math.max(0, invitationDate.getTime() - Date.now());

  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

/* =========================================================
   FRASES DINÁMICAS
========================================================= */

const blessings = [
  "Que nunca le falte luz en el camino",
  "Que el amor la acompañe en cada paso",
  "Que la fe sea siempre su refugio",
];

/* =========================================================
   PÉTALOS
========================================================= */

const petals = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 17 + 7) % 96}%`,
  delay: `${(i % 7) * -1.8}s`,
  duration: `${11 + (i % 5) * 1.7}s`,
  drift: `${-26 + (i % 7) * 9}px`,
}));

/* =========================================================
   GOOGLE MAPS
========================================================= */

function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);

  const [countdown, setCountdown] = useState(getCountdown);
  const [blessingIndex, setBlessingIndex] = useState(0);

  const [giftOpen, setGiftOpen] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [selectedRsvp, setSelectedRsvp] = useState<
    "yes" | "maybe" | "no" | null
  >(null);
  const [companions, setCompanions] = useState(0);
  const [sendingRsvp, setSendingRsvp] = useState(false);
  const [rsvpSaved, setRsvpSaved] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  const [progress, setProgress] = useState(0);

  /* =======================================================
     REFERENCIAS GSAP
  ======================================================= */

  const pageRef = useRef<HTMLElement>(null);

  const introRef = useRef<HTMLElement>(null);

  const envelopeRef = useRef<HTMLDivElement>(null);

  const letterRef = useRef<HTMLDivElement>(null);

  const sealRef = useRef<HTMLDivElement>(null);

  const experienceRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     CONTADOR
  ======================================================= */

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  /* =======================================================
     FRASES CAMBIANTES
  ======================================================= */

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlessingIndex((value) => (value + 1) % blessings.length);
    }, 4200);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  /* =======================================================
     PROGRESO DEL SCROLL
  ======================================================= */

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;

      const current = max > 0 ? Math.min(1, window.scrollY / max) : 0;

      setProgress(current);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* =======================================================
     GOOGLE MAPS
  ======================================================= */

  const maps = useMemo(
    () => ({
      church: cfg.locations.church.mapUrl,
      reception: cfg.locations.reception.mapUrl,
    }),
    [],
  );

  /* =======================================================
     ENTRADA INICIAL GSAP
  ======================================================= */

  useGSAP(
    () => {
      if (!pageRef.current) return;

      /*
       * Dejamos la experiencia invisible inicialmente.
       * Sigue existiendo en el DOM para poder animarla.
       */

      gsap.set(experienceRef.current, {
        opacity: 0,
        visibility: "hidden",
      });

      /*
       * Entrada suave de textos.
       */

      gsap.from(
        ".intro-eyebrow, .intro h1, .intro-message, .cta, .intro > small",
        {
          y: 22,
          opacity: 0,
          filter: "blur(9px)",
          duration: 1.1,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.25,
        },
      );

      /*
       * Entrada del sobre.
       */

      gsap.from(envelopeRef.current, {
        y: 30,
        opacity: 0,
        scale: 0.9,
        rotateX: 8,
        duration: 1.45,
        ease: "expo.out",
      });

      /*
       * El sello respira suavemente mientras espera.
       */

      gsap.to(sealRef.current, {
        scale: 1.07,
        duration: 1.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    {
      scope: pageRef,
    },
  );

  useGSAP(
    () => {
      if (!opened) return;

      const mm = gsap.matchMedia();

      // Esperamos a que la experiencia haya entrado
      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);

      /* =====================================================
         DESKTOP / TABLET
      ===================================================== */

      mm.add("(min-width: 769px)", () => {
        /* =========================
           BEBÉ
        ========================= */

        gsap.fromTo(
          ".baby-photo-wrap",
          {
            x: -70,
            y: 40,
            opacity: 0,
            scale: 0.88,
            rotate: -4,
            filter: "blur(14px)",
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "expo.out",

            scrollTrigger: {
              trigger: ".baby-section",
              start: "top 78%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".baby-copy > *",
          {
            x: 55,
            y: 20,
            opacity: 0,
            filter: "blur(8px)",
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",

            scrollTrigger: {
              trigger: ".baby-section",
              start: "top 72%",
              once: true,
            },
          },
        );

        /* Parallax de la foto */

        gsap.to(".baby-photo-wrap", {
          y: -55,

          scrollTrigger: {
            trigger: ".baby-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });

        /* =========================
           MENSAJE
        ========================= */

        gsap.fromTo(
          ".message-section > *:not(.constellation)",
          {
            y: 55,
            opacity: 0,
            filter: "blur(10px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.12,
            duration: 1.05,
            ease: "power3.out",

            scrollTrigger: {
              trigger: ".message-section",
              start: "top 74%",
              once: true,
            },
          },
        );

        /* =========================
           CONSTELACIÓN
        ========================= */

        gsap.fromTo(
          ".constellation span",
          {
            opacity: 0,
            scale: 0.4,
            y: 22,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.14,
            ease: "back.out(1.7)",

            scrollTrigger: {
              trigger: ".constellation",
              start: "top 86%",
              once: true,
            },
          },
        );

        gsap.to(".constellation span", {
          y: (index) => (index % 2 === 0 ? -12 : 12),

          scrollTrigger: {
            trigger: ".constellation",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.8,
          },
        });

        /* =========================
           FECHA
        ========================= */

        gsap.fromTo(
          ".date-section .badge",
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,

            scrollTrigger: {
              trigger: ".date-section",
              start: "top 76%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".date-card",
          {
            opacity: 0,
            y: 70,
            scale: 0.88,
            rotateX: 12,
            filter: "blur(12px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1.25,
            ease: "expo.out",

            scrollTrigger: {
              trigger: ".date-section",
              start: "top 68%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".countdown > div",
          {
            opacity: 0,
            y: 32,
            scale: 0.82,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.09,
            duration: 0.8,
            ease: "back.out(1.4)",

            scrollTrigger: {
              trigger: ".countdown",
              start: "top 88%",
              once: true,
            },
          },
        );

        /* =========================
           AGENDA
        ========================= */

        gsap.fromTo(
          ".agenda-section > .script, .agenda-section > h3",
          {
            opacity: 0,
            y: 38,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,

            scrollTrigger: {
              trigger: ".agenda-section",
              start: "top 77%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".timeline article",
          {
            opacity: 0,
            x: -45,
            y: 25,
            filter: "blur(7px)",
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            duration: 0.95,
            stagger: 0.18,
            ease: "power3.out",

            scrollTrigger: {
              trigger: ".timeline",
              start: "top 78%",
              once: true,
            },
          },
        );

        /* =========================
           UBICACIONES
        ========================= */

        gsap.fromTo(
          ".locations-head > *",
          {
            opacity: 0,
            y: 35,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,

            scrollTrigger: {
              trigger: ".locations-section",
              start: "top 77%",
              once: true,
            },
          },
        );

        document.querySelectorAll(".location-card").forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              x: index % 2 === 0 ? -85 : 85,
              y: 45,
              scale: 0.94,
              filter: "blur(12px)",
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1.3,
              ease: "expo.out",

              scrollTrigger: {
                trigger: card,
                start: "top 82%",
                once: true,
              },
            },
          );
        });

        /* =========================
           REGALO
        ========================= */

        gsap.fromTo(
          ".gift-section > *",
          {
            opacity: 0,
            y: 40,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.09,
            ease: "power3.out",

            scrollTrigger: {
              trigger: ".gift-section",
              start: "top 75%",
              once: true,
            },
          },
        );

        /* =========================
           RSVP
        ========================= */

        gsap.fromTo(
          ".rsvp-card",
          {
            opacity: 0,
            y: 75,
            scale: 0.88,
            rotateX: 8,
            filter: "blur(14px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1.25,
            ease: "expo.out",

            scrollTrigger: {
              trigger: ".rsvp-section",
              start: "top 78%",
              once: true,
            },
          },
        );

        /* =========================
           CIERRE
        ========================= */

        gsap.fromTo(
          ".closing-section > *",
          {
            opacity: 0,
            y: 38,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: 0.12,
            ease: "power3.out",

            scrollTrigger: {
              trigger: ".closing-section",
              start: "top 72%",
              once: true,
            },
          },
        );
      });

      /* =====================================================
         MOBILE
         Más ligero para mantener fluidez
      ===================================================== */

      mm.add("(max-width: 768px)", () => {
        const sections = [
          ".baby-section",
          ".message-section",
          ".date-section",
          ".agenda-section",
          ".locations-section",
          ".gift-section",
          ".rsvp-section",
          ".closing-section",
        ];

        sections.forEach((selector) => {
          gsap.fromTo(
            selector,
            {
              opacity: 0,
              y: 45,
              filter: "blur(8px)",
            },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1,
              ease: "power3.out",

              scrollTrigger: {
                trigger: selector,
                start: "top 86%",
                once: true,
              },
            },
          );
        });

        gsap.fromTo(
          ".timeline article",
          {
            opacity: 0,
            x: -25,
          },
          {
            opacity: 1,
            x: 0,
            stagger: 0.15,
            duration: 0.75,

            scrollTrigger: {
              trigger: ".timeline",
              start: "top 88%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".countdown > div",
          {
            opacity: 0,
            scale: 0.84,
          },
          {
            opacity: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.65,

            scrollTrigger: {
              trigger: ".countdown",
              start: "top 90%",
              once: true,
            },
          },
        );
      });

      return () => {
        window.clearTimeout(refreshTimer);
        mm.revert();
      };
    },
    {
      scope: pageRef,
      dependencies: [opened],
      revertOnUpdate: true,
    },
  );

  /* =======================================================
     APERTURA CINEMATOGRÁFICA
  ======================================================= */

  const beginExperience = () => {
    if (opening || opened) return;

    setOpening(true);

    /*
     * Respeta usuarios que tengan reducción de movimiento.
     */

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      setOpened(true);

      gsap.set(introRef.current, {
        display: "none",
      });

      gsap.set(experienceRef.current, {
        opacity: 1,
        visibility: "visible",
      });

      setOpening(false);

      return;
    }

    /* =====================================================
       CONFETTI DESDE EL SELLO
    ===================================================== */

    const rect = sealRef.current?.getBoundingClientRect();

    if (rect) {
      const originX = (rect.left + rect.width / 2) / window.innerWidth;

      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      /*
       * Primera explosión.
       */

      confetti({
        particleCount: 40,
        spread: 70,
        startVelocity: 23,
        gravity: 0.55,
        scalar: 0.65,
        ticks: 110,

        origin: {
          x: originX,
          y: originY,
        },

        colors: ["#D6B67A", "#F2D99A", "#B97887", "#FFF5E8"],
      });

      /*
       * Segunda explosión más delicada.
       */

      window.setTimeout(() => {
        confetti({
          particleCount: 22,
          spread: 110,
          startVelocity: 14,
          gravity: 0.35,
          scalar: 0.45,
          ticks: 90,

          origin: {
            x: originX,
            y: originY,
          },

          colors: ["#FFF4CF", "#D6B67A", "#E8BCC6"],
        });
      }, 180);
    }

    /* =====================================================
       TIMELINE PRINCIPAL
    ===================================================== */

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.inOut",
      },
    });

    /*
     * 1. El sello recibe energía.
     */

    tl.to(sealRef.current, {
      scale: 1.3,
      rotate: -10,
      duration: 0.22,
      ease: "power2.out",
    });

    /*
     * 2. El sello desaparece.
     */

    tl.to(sealRef.current, {
      scale: 0,
      rotate: 42,
      opacity: 0,
      filter: "blur(6px)",
      duration: 0.38,
      ease: "back.in(2.5)",
    });

    /*
     * 3. La tarjeta empieza a salir.
     */

    tl.to(
      letterRef.current,
      {
        y: -75,
        scale: 1.06,
        rotateX: -2,
        boxShadow: "0 30px 65px rgba(80, 46, 53, 0.22)",
        duration: 0.65,
        ease: "power4.out",
      },
      "-=0.12",
    );

    /*
     * 4. La tarjeta asciende más.
     */

    tl.to(letterRef.current, {
      y: -125,
      scale: 1.15,
      duration: 0.55,
      ease: "expo.out",
    });

    /*
     * 5. El sobre baja ligeramente.
     */

    tl.to(
      envelopeRef.current,
      {
        y: 28,
        scale: 0.94,
        duration: 0.65,
        ease: "power3.inOut",
      },
      "-=0.65",
    );

    /*
     * 6. Textos principales desaparecen.
     */

    tl.to(
      ".intro-eyebrow, .intro h1, .intro-message, .cta, .intro > small",
      {
        y: 20,
        opacity: 0,
        filter: "blur(10px)",
        stagger: 0.045,
        duration: 0.5,
      },
      "-=0.4",
    );

    /*
     * 7. La tarjeta se acerca hacia cámara.
     */

    tl.to(letterRef.current, {
      y: -170,
      scale: 1.35,
      opacity: 0,
      filter: "blur(9px)",
      duration: 0.7,
      ease: "power3.in",
    });

    /*
     * 8. El sobre también desaparece.
     */

    tl.to(
      envelopeRef.current,
      {
        scale: 1.15,
        opacity: 0,
        filter: "blur(14px)",
        duration: 0.72,
      },
      "<",
    );

    /*
     * 9. Toda la portada se disuelve.
     */

    tl.to(
      introRef.current,
      {
        opacity: 0,
        scale: 1.055,
        filter: "blur(16px)",
        duration: 0.82,
        ease: "power3.inOut",
      },
      "-=0.25",
    );

    /*
     * 10. Activamos la experiencia.
     */

    tl.call(() => {
      setOpened(true);
    });

    /*
     * 11. Mostramos el contenido.
     */

    tl.set(experienceRef.current, {
      visibility: "visible",
    });

    /*
     * 12. Entrada cinematográfica del contenido.
     */

    tl.fromTo(
      experienceRef.current,
      {
        opacity: 0,
        scale: 0.975,
        filter: "blur(14px)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.25,
        ease: "expo.out",
      },
    );

    /*
     * 13. Entrada de textos del HERO.
     */

    tl.from(
      ".hero-copy > *",
      {
        y: 32,
        opacity: 0,
        filter: "blur(6px)",
        stagger: 0.09,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.8",
    );

    /*
     * 14. Entrada de tarjeta derecha.
     */

    tl.from(
      ".hero-card",
      {
        y: 45,
        scale: 0.91,
        opacity: 0,
        rotateY: -8,
        filter: "blur(10px)",
        duration: 1.05,
        ease: "expo.out",
      },
      "-=0.85",
    );

    /*
     * 15. Terminamos.
     */

    tl.call(() => {
      setOpening(false);

      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    });
  };

  const saveRsvp = async () => {
    const cleanName = guestName.trim();

    if (!cleanName) {
      setRsvpError("Escribe tu nombre para poder confirmar.");
      return;
    }

    if (!selectedRsvp) {
      setRsvpError("Selecciona una opción de asistencia.");
      return;
    }

    setSendingRsvp(true);
    setRsvpError("");
    setRsvpSaved(false);

    const { error } = await supabase.rpc("submit_rsvp", {
      p_guest_name: cleanName,
      p_response: selectedRsvp,
      p_event_name: cfg.child.fullName,
      p_companions: selectedRsvp === "yes" ? companions : 0,
    });

    if (error) {
      console.error("Error guardando RSVP:", error);

      setRsvpError("No pudimos guardar tu respuesta. Inténtalo nuevamente.");

      setSendingRsvp(false);
      return;
    }

    setRsvpSaved(true);
    setSendingRsvp(false);
  };

  const formattedGuestName = guestName
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const totalPeople = selectedRsvp === "yes" ? companions + 1 : 0;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main ref={pageRef} className={`page ${opened ? "page-opened" : ""}`}>
      {/* =====================================================
          FONDO
      ===================================================== */}

      <div className="paper" />

      <div className="ambient" />

      {/* =====================================================
          PÉTALOS
      ===================================================== */}

      <div className="petals" aria-hidden="true">
        {petals.map((petal, index) => (
          <i
            key={index}
            style={
              {
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
                "--drift": petal.drift,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section
        ref={introRef}
        className={`intro ${opened ? "intro-hidden" : ""}`}
      >
        {/* Círculos ornamentales */}

        <div className="rings">
          <span />
          <span />
          <span />
        </div>

        {/* ===================================================
            SOBRE
        =================================================== */}

        <div ref={envelopeRef} className="envelope-stage">
          <div className="envelope-back" />

          {/* =================================================
              TARJETA
          ================================================= */}

          <div ref={letterRef} className="letter-card">
            <div className="letter-border" />

            <span className="letter-eyebrow">UNA INVITACIÓN MUY ESPECIAL</span>

            <div className="letter-crest">
              <b>{cfg.child.initials}</b>

              <Sparkles size={15} />
            </div>

            <strong>{cfg.child.fullName}</strong>

            <em>Una bendición está por llegar</em>

            <div className="letter-shine" />
          </div>

          {/* =================================================
              SOBRE FRONTAL
          ================================================= */}

          <div className="envelope-front">
            <span />
            <span />
            <span />
          </div>

          {/* =================================================
              SELLO
          ================================================= */}

          <div ref={sealRef} className="seal">
            <Sparkles size={20} />
          </div>
        </div>

        {/* ===================================================
            TEXTO INTRO
        =================================================== */}

        <p className="intro-eyebrow">{cfg.intro.eyebrow}</p>

        <h1>El bautizo de {cfg.child.firstName}</h1>

        <p className="intro-message">{cfg.intro.specialMessage}</p>

        <button className="cta" onClick={beginExperience} disabled={opening}>
          {opening ? "Abriendo este momento..." : "Abrir invitación"}

          <Heart size={17} fill="currentColor" />
        </button>

        <small>Toca para vivir la experiencia</small>
      </section>

      {/* =====================================================
          EXPERIENCIA
      ===================================================== */}

      <div ref={experienceRef} className="experience" aria-hidden={!opened}>
        {/* ===================================================
            PROGRESO SUPERIOR
        =================================================== */}

        <div className="progress">
          <span
            style={{
              transform: `scaleX(${progress})`,
            }}
          />
        </div>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="hero" id="inicio">
          <div className="hero-bg" />

          {/* =================================================
              COPY HERO
          ================================================= */}

          <div className="hero-copy">
            <p className="kicker">
              <Sparkles size={15} />
              Mi bautizo
            </p>

            <p className="hero-blessing">
              Una nueva página de mi historia comienza rodeada de amor
            </p>

            <h2>
              {cfg.child.firstName}

              <span>{cfg.child.middleName}</span>
            </h2>

            <div className="living">
              <Star size={14} />

              {blessings[blessingIndex]}
            </div>

            <p className="hero-date">{cfg.date.display}</p>
          </div>

          {/* =================================================
              TARJETA REVEAL
          ================================================= */}

          <div className="hero-card">
            <div className="hero-card-bg" />

            <div className="hero-monogram">
              {cfg.child.initials}

              <Sparkles size={13} />
            </div>

            <span>LA HISTORIA CONTINÚA</span>

            <h3>
              Una bendición
              <br />
              tiene nombre
            </h3>

            <p>{cfg.child.fullName}</p>

            <div className="ornament">
              <i />

              <Heart size={12} fill="currentColor" />

              <i />
            </div>

            <small>Desliza para conocer a nuestra pequeña protagonista</small>
          </div>

          <div className="scroll-cue">
            Descubre
            <ChevronDown size={18} />
          </div>
        </section>

        {/* ===================================================
            BEBÉ
        =================================================== */}

        <section className="baby-section" id="bebe">
          <div className="baby-photo-wrap">
            <div className="baby-orbit">
              <span />
              <span />
              <span />
            </div>

            <img src={cfg.child.photoUrl} alt={cfg.child.photoAlt} />
          </div>

          <div className="baby-copy">
            <p className="section-eyebrow">{cfg.child.photoEyebrow}</p>

            <p className="script">{cfg.child.fullName}</p>

            <h3>{cfg.child.photoTitle}</h3>

            <p>{cfg.child.photoText}</p>

            <div className="mini-seal">
              <Heart size={13} fill="currentColor" />

              {cfg.child.initials}
            </div>
          </div>
        </section>

        {/* ===================================================
            MENSAJE
        =================================================== */}

        <section className="message-section">
          <div className="ornament wide">
            <i />

            <Sparkles size={18} />

            <i />
          </div>

          <p className="script">Con el corazón lleno de gratitud</p>

          <h3>Hay días que se guardan para siempre</h3>

          <p className="body-copy">
            Dios nos regaló la dicha de verla crecer, sonreír y llenar nuestros
            días de luz. Ahora queremos celebrar su bautizo junto a las personas
            que hacen parte de nuestra historia. Tu presencia hará este momento
            aún más especial.
          </p>

          <div className="signature">
            <span>Con amor,</span>

            <strong>{cfg.parents}</strong>

            <small>papás de {cfg.child.fullName}</small>
          </div>

          <div className="constellation">
            <span>AMOR</span>

            <span>LUZ</span>

            <span>FE</span>

            <span>GRACIA</span>

            <span>ESPERANZA</span>
          </div>
        </section>

        {/* ===================================================
            FECHA
        =================================================== */}

        <section className="date-section">
          <div className="badge">
            <CalendarDays size={17} />
            Guarda la fecha
          </div>

          <div className="date-card">
            <div>
              <span>{cfg.date.weekday}</span>

              <strong>{cfg.date.day}</strong>

              <span>{cfg.date.month}</span>
            </div>

            <i />

            <div>
              <Clock3 size={21} />

              <strong className="time">{cfg.date.ceremonyTime}</strong>

              <span>{cfg.date.year}</span>
            </div>
          </div>

          {/* =================================================
              CONTADOR
          ================================================= */}

          <div className="countdown">
            {(
              [
                [countdown.days, "días"],
                [countdown.hours, "horas"],
                [countdown.minutes, "min"],
                [countdown.seconds, "seg"],
              ] as const
            ).map(([value, label]) => (
              <div key={label}>
                <strong>{String(value).padStart(2, "0")}</strong>

                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            AGENDA
        =================================================== */}

        <section className="agenda-section">
          <p className="script">Un día para recordar</p>

          <h3>Así viviremos este momento</h3>

          <div className="timeline">
            {[
              {
                icon: Church,

                time: cfg.locations.church.time,

                title: "Ceremonia",

                text: "Recibiremos juntos la bendición del bautismo.",
              },

              {
                icon: Camera,

                time: "Después",

                title: "Fotos & abrazos",

                text: "Un momento para guardar recuerdos con quienes amamos.",
              },

              {
                icon: PartyPopper,

                time: cfg.locations.reception.time,

                title: "Celebración",

                text: "Almuerzo, brindis y una tarde para compartir.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <article key={item.title}>
                  <div className="step">{index + 1}</div>

                  <div className="timeline-icon">
                    <Icon size={23} />
                  </div>

                  <div>
                    <time>{item.time}</time>

                    <h4>{item.title}</h4>

                    <p>{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ===================================================
            UBICACIONES
        =================================================== */}

        <section className="locations-section">
          <div className="locations-head">
            <div className="badge">
              <MapPin size={17} />
              Dos momentos · dos lugares
            </div>

            <p className="script">Primero la bendición, luego la celebración</p>

            <h3>Te esperamos en ambos lugares</h3>
          </div>

          {(["church", "reception"] as const).map((key, index) => {
            const location = cfg.locations[key];

            const Icon = index === 0 ? Church : PartyPopper;

            return (
              <article
                className={`location-card ${index === 1 ? "reverse" : ""}`}
                key={key}
              >
                <div className="location-copy">
                  <div className="location-step">
                    <span>0{index + 1}</span>

                    <Icon size={22} />
                  </div>

                  <p className="section-eyebrow">
                    {location.type} · {location.time}
                  </p>

                  <h4>{location.name}</h4>

                  <p className="address">
                    {location.addressLine1}

                    <br />

                    {location.city}
                  </p>

                  <a
                    className="map-btn"
                    href={maps[key]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation size={16} />
                    Abrir en Google Maps
                  </a>
                </div>

                <iframe
                  title={`Mapa ${location.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    location.mapQuery,
                  )}&z=15&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </article>
            );
          })}
        </section>

        {/* ===================================================
            REGALO
        =================================================== */}

        <section className="gift-section">
          <div className="gift-icon">
            <Gift size={28} />
          </div>

          <p className="script">Un detalle para {cfg.child.firstName}</p>

          <h3>{cfg.gift.title}</h3>

          <p>{cfg.gift.text}</p>

          <button
            className="text-btn"
            onClick={() => setGiftOpen((value) => !value)}
          >
            <Sparkles size={15} />

            {giftOpen ? "Ocultar ideas" : "Ver ideas de regalo"}
          </button>

          <div className={`gift-ideas ${giftOpen ? "open" : ""}`}>
            {cfg.gift.ideas.map((idea) => (
              <span key={idea}>{idea}</span>
            ))}
          </div>
        </section>

        {/* ===================================================
            RSVP
        =================================================== */}

        <section className="rsvp-section">
          <div className="rsvp-card">
            <Baby size={27} />

            <p className="script">¿Nos acompañas?</p>

            <h3>Confirma tu asistencia</h3>

            <p>
              Ayúdanos a preparar cada detalle confirmando antes del{" "}
              {cfg.rsvpDeadline}.
            </p>

            <div className="rsvp-name-field">
              <label htmlFor="guestName">¿Quién está confirmando?</label>

              <input
                id="guestName"
                type="text"
                placeholder="Escribe tu nombre completo"
                value={guestName}
                onChange={(event) => {
                  setGuestName(event.target.value);
                  setRsvpError("");
                  setRsvpSaved(false);
                }}
                disabled={sendingRsvp}
              />
            </div>

            <div className="rsvp-question">
              <span>¿Podrás acompañarnos?</span>
            </div>

            <div className="rsvp-options">
              <button
                type="button"
                className={selectedRsvp === "yes" ? "active" : ""}
                onClick={() => {
                  setSelectedRsvp("yes");
                  setRsvpError("");
                  setRsvpSaved(false);
                }}
                disabled={sendingRsvp}
              >
                <Heart size={16} />
                Sí, asistiré
              </button>

              <button
                type="button"
                className={selectedRsvp === "maybe" ? "active" : ""}
                onClick={() => {
                  setSelectedRsvp("maybe");
                  setCompanions(0);
                  setRsvpError("");
                  setRsvpSaved(false);
                }}
                disabled={sendingRsvp}
              >
                <Sparkles size={16} />
                Aún no lo sé
              </button>

              <button
                type="button"
                className={selectedRsvp === "no" ? "active" : ""}
                onClick={() => {
                  setSelectedRsvp("no");
                  setCompanions(0);
                  setRsvpError("");
                  setRsvpSaved(false);
                }}
                disabled={sendingRsvp}
              >
                No podré asistir
              </button>
            </div>

            {selectedRsvp === "yes" && (
              <div className="rsvp-name-field companions-field">
                <label htmlFor="companions">
                  Además de ti, ¿vendrá alguien contigo?
                </label>

                <select
                  id="companions"
                  value={companions}
                  onChange={(event) =>
                    setCompanions(Number(event.target.value))
                  }
                  disabled={sendingRsvp}
                >
                  <option value={0}>Asistiré solo/a</option>
                  <option value={1}>Iré con 1 acompañante</option>
                  <option value={2}>Iré con 2 acompañantes</option>
                  <option value={3}>Iré con 3 acompañantes</option>
                  <option value={4}>Iré con 4 acompañantes</option>
                  <option value={5}>Iré con 5 acompañantes</option>
                  <option value={6}>Iré con 6 acompañantes</option>
                </select>

                <small className="companions-help">
                  No te cuentes a ti mismo/a. Solo indica cuántas personas
                  adicionales vienen contigo.
                </small>
              </div>
            )}

            {rsvpError && <div className="rsvp-error">{rsvpError}</div>}

            <button
              type="button"
              className="confirm-rsvp-btn"
              onClick={saveRsvp}
              disabled={sendingRsvp}
            >
              {sendingRsvp
                ? "Guardando respuesta..."
                : rsvpSaved
                  ? "Guardar cambios"
                  : "Confirmar respuesta"}
            </button>

            {rsvpSaved && (
              <div className="saved">
                <Check size={16} />

                {selectedRsvp === "yes" && (
                  <span>
                    ¡Gracias, {formattedGuestName}! Tu asistencia quedó
                    confirmada.{" "}
                    {companions === 0
                      ? "Asistirás tú solamente."
                      : `Serán ${totalPeople} personas en total: tú + ${companions === 1 ? "1 acompañante" : `${companions} acompañantes`}.`}
                  </span>
                )}

                {selectedRsvp === "maybe" && (
                  <span>
                    Gracias, {guestName.trim()}. Guardamos tu respuesta como
                    “aún no lo sé”. Puedes actualizarla cuando quieras.
                  </span>
                )}

                {selectedRsvp === "no" && (
                  <span>
                    Gracias por avisarnos, {guestName.trim()}. Lamentamos que no
                    puedas acompañarnos.
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            CIERRE
        =================================================== */}

        <section className="closing-section">
          <Sparkles size={30} />

          <p className="script">Gracias por ser parte de nuestra historia</p>

          <h3>{cfg.child.fullName}</h3>

          <p>“{cfg.closingMessage}”</p>

          <div className="closing-seal">{cfg.child.initials}</div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer>
          Invitación digital · {cfg.date.display} · Desarrollado por{" "}
          <a
            href="https://lucas-salazar-portfolio.vercel.app/"
            target="_blank"
            rel="noreferrer"
          >
            Lucas Salazar Villa
          </a>
        </footer>
      </div>
    </main>
  );
}
