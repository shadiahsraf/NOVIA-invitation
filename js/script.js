/* =========================================================
   DANIEL & OLIVIA — DIGITAL INVITATION
   script.js
   Replace the values in WEDDING CONFIG to reuse this template.
========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     WEDDING CONFIG — edit these to customise the invitation
  --------------------------------------------------------- */
  const WEDDING_DATE_ISO = "2026-10-17T18:00:00"; // local time of the venue

  const weddingLocation = {
    name: "ROYAL GATE",
    city: "Assiut",
    latitude: "27.1896693",
    longitude: "31.1890561",
    url: "https://maps.google.com/?cid=5095818961917769176"
  };

  // If a Google Maps Places/Embed API key is ever needed for a richer map,
  // keep it isolated here rather than scattered through the codebase.
  const GOOGLE_MAPS_API_KEY = ""; // not required for the current "open in Maps" link

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     UTILITIES
  --------------------------------------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function buildGoogleMapsUrl(loc) {
    if (loc && loc.url) return loc.url;
    const query = encodeURIComponent(`${loc.name}, ${loc.city}`);
    if (loc.latitude && loc.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}(${query})`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  /* ---------------------------------------------------------
     CUSTOM CURSOR (desktop / fine pointer only)
  --------------------------------------------------------- */
  (function initCursor() {
    const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    if (!canHover) return;
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    if (!dot || !ring) return;

    let ringX = 0, ringY = 0, targetX = 0, targetY = 0;
    document.addEventListener("mousemove", (e) => {
      document.body.classList.add("cursor-ready");
      targetX = e.clientX; targetY = e.clientY;
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
    });

    function raf() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    $$("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
  })();

  /* ---------------------------------------------------------
     MUSIC
  --------------------------------------------------------- */
  const audio = $("#wedding-audio");
  const musicToggle = $("#music-toggle");
  let audioReady = true;

  function playMusic() {
    if (!audio || !audioReady) return;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.then(() => {
        musicToggle.classList.add("is-playing");
        musicToggle.setAttribute("aria-pressed", "true");
        musicToggle.setAttribute("aria-label", "Pause background music");
        document.body.classList.add("is-music-playing");
      }).catch(() => {
        // Autoplay blocked or file missing — fail silently, site keeps working.
        audioReady = true;
      });
    }
  }

  function pauseMusic() {
    if (!audio) return;
    audio.pause();
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Play background music");
    document.body.classList.remove("is-music-playing");
  }

  if (audio) {
    audio.addEventListener("error", () => { audioReady = false; }, true);
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      if (musicToggle.classList.contains("is-playing")) pauseMusic();
      else playMusic();
    });
  }

  const songBanners = $$(".folio__card-arabic-header, .invitation-card__arabic-header");
  songBanners.forEach(b => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (musicToggle && musicToggle.classList.contains("is-playing")) pauseMusic();
      else playMusic();
    });
  });

  /* ---------------------------------------------------------
     THE INVITATION BOX — WOW MOMENT #1
  --------------------------------------------------------- */
  const boxScene = $("#box-scene");
  const boxTrigger = $("#box-trigger");
  const mainEl = $("#main");

  function openInvitation() {
    if (boxTrigger.classList.contains("is-open")) return;
    boxTrigger.classList.add("is-open");
    boxTrigger.setAttribute("aria-label", "Invitation opened");

    // First user interaction: try to start music here (satisfies autoplay policies).
    playMusic();

    // Realistic Physical Untying & Gravity Fall Sequence:
    // 0.0s - 0.6s: Right tail pulled, loops unravel into wavy ribbons
    // 0.45s - 1.85s: Entire bow & belly bands fall down and drop off folio ("unties and falls away")
    // 0.55s - 1.7s: 3D gatefold flaps swing wide open in perspective
    // 0.65s - 1.8s: Inner gold card rises into full view with metallic light sweep
    // 1.8s - 2.5s: Brief pause to admire the revealed invitation card
    // 2.5s: Folio scene dissolves smoothly into main experience
    window.setTimeout(() => {
      boxScene.classList.add("is-open");
      mainEl.hidden = false;
      document.body.style.overflow = "";
      // Move focus into the experience for keyboard/screen-reader users.
      $(".invitation-card").setAttribute("tabindex", "-1");
      $(".invitation-card").focus({ preventScroll: true });
    }, prefersReducedMotion ? 50 : 2500);
  }

  if (boxTrigger) {
    document.body.style.overflow = "hidden";
    boxTrigger.addEventListener("click", openInvitation);
    boxTrigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openInvitation(); }
    });
  }

  /* ---------------------------------------------------------
     INVITATION CARD — subtle 3D follow
  --------------------------------------------------------- */
  (function initCardTilt() {
    const card = $("#invitation-card");
    if (!card || prefersReducedMotion) return;
    const canHover = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

    if (canHover) {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${px * 8}deg) rotateX(${py * -8}deg) translateZ(0)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (e) => {
        const gx = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
        const gy = Math.max(-1, Math.min(1, (e.beta || 0) / 60 - 0.5));
        card.style.transform = `rotateY(${gx * 6}deg) rotateX(${gy * -6}deg)`;
      });
    }
  })();

  /* ---------------------------------------------------------
     FLOATING MENU
  --------------------------------------------------------- */
  const menuTrigger = $("#menu-trigger");
  const menuPanel = $("#menu-panel");

  function closeMenu() {
    menuPanel.classList.remove("is-open");
    menuPanel.setAttribute("aria-hidden", "true");
    menuTrigger.setAttribute("aria-expanded", "false");
  }
  function openMenu() {
    menuPanel.classList.add("is-open");
    menuPanel.setAttribute("aria-hidden", "false");
    menuTrigger.setAttribute("aria-expanded", "true");
  }

  if (menuTrigger) {
    menuTrigger.addEventListener("click", () => {
      menuPanel.classList.contains("is-open") ? closeMenu() : openMenu();
    });
  }
  $$("[data-menu-link]").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------------------------------------------------------
     OUR STORY — timeline expand + gold line fill
  --------------------------------------------------------- */
  (function initStory() {
    const items = $$(".story__item");
    const lineFill = $(".story__line-fill");
    if (!items.length) return;

    items.forEach((item) => {
      const btn = $(".story__marker", item);
      btn.addEventListener("click", () => {
        const expanded = item.classList.toggle("is-expanded");
        item.classList.add("is-active");
        btn.setAttribute("aria-expanded", String(expanded));
      });
    });

    const line = $(".story__line");
    if (!line) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            line.querySelector(".story__line-fill").style.height = "100%";
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(line);
  })();

  /* ---------------------------------------------------------
     THE DAY — Calendar & iCal Export
  --------------------------------------------------------- */
  (function initTheDay() {
    const downloadBtn = $("#download-ics-btn");
    if (!downloadBtn) return;

    downloadBtn.addEventListener("click", () => {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Daniel & Olivia Wedding//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "UID:wedding-daniel-olivia-20261017@invitation",
        "SUMMARY:Daniel & Olivia's Wedding",
        "DESCRIPTION:Celebrating the wedding of Daniel and Olivia at ROYAL GATE, Assiut.",
        "LOCATION:ROYAL GATE, Assiut, Egypt",
        "DTSTART:20261017T150000Z",
        "DTEND:20261017T230000Z",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "Daniel-Olivia-Wedding.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    });
  })();

  /* ---------------------------------------------------------
     COUNTDOWN — flip clock
  --------------------------------------------------------- */
  (function initCountdown() {
    const flipRoot = $("#countdown-flip");
    const arrived = $("#countdown-arrived");
    if (!flipRoot) return;
    const target = new Date(WEDDING_DATE_ISO).getTime();

    const prev = { days: null, hours: null, minutes: null, seconds: null };

    function setUnit(unit, value) {
      const el = flipRoot.querySelector(`[data-unit="${unit}"]`);
      if (!el) return;
      const padded = String(Math.max(0, value)).padStart(2, "0");
      const d1 = el.querySelector("[data-d1]");
      const d2 = el.querySelector("[data-d2]");
      if (prev[unit] !== padded) {
        if (!prefersReducedMotion) {
          d1.classList.add("is-flipping");
          d2.classList.add("is-flipping");
          window.setTimeout(() => {
            d1.classList.remove("is-flipping");
            d2.classList.remove("is-flipping");
          }, 400);
        }
        d1.textContent = padded[0];
        d2.textContent = padded[1];
        prev[unit] = padded;
      }
    }

    function tick() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        flipRoot.hidden = true;
        arrived.hidden = false;
        clearInterval(timer);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setUnit("days", days);
      setUnit("hours", hours);
      setUnit("minutes", minutes);
      setUnit("seconds", seconds);
    }

    tick();
    const timer = setInterval(tick, 1000);
  })();

  /* ---------------------------------------------------------
     THE WEDDING GAME — "The Great Bridal Bouquet Toss"
  --------------------------------------------------------- */
  (function initBouquetToss() {
    const root = $("#bouquet-toss");
    const arena = $("#bouquet-arena");
    if (!root || !arena) return;

    const sprite = $("#bouquet-sprite");
    const wreath = $("#catch-wreath");
    const meterWrap = $("#bouquet-meter-wrap");
    const meterPointer = $("#bouquet-meter-pointer");
    const tossBtn = $("#bouquet-toss-btn");
    const catchBtn = $("#bouquet-catch-btn");
    const trailsContainer = $("#bouquet-trails");
    const confettiCanvas = $("#bouquet-confetti");
    const winnerCelebration = $("#winner-celebration");

    const fortuneCard = $("#fortune-card");
    const fortuneTitle = $("#fortune-title");
    const fortuneBlessing = $("#fortune-blessing");
    const fortuneProgressText = $("#fortune-progress-text");
    const fortuneDots = $("#fortune-dots");
    const fortuneAgainBtn = $("#fortune-again-btn");
    const fortuneNoteBtn = $("#fortune-note-btn");
    const missCard = $("#fortune-miss");
    const retryBtn = $("#fortune-retry-btn");

    const fortunes = [
      {
        title: "The Crown of Romance",
        blessing: "The bridal bouquet chose you! You are officially crowned the next one to walk down the aisle of eternal love.",
        noteGreeting: "I caught the bridal bouquet at Daniel & Olivia's wedding! Wishing the radiant couple a lifetime filled with timeless romance and joy! 💐👑"
      },
      {
        title: "Star of the Dance Floor",
        blessing: "A radiant catch! Olivia and Daniel declare you the honorary heartbeat of the dance floor tonight until the last song!",
        noteGreeting: "Caught the bouquet! Getting my dancing shoes ready for October 17th to celebrate Daniel & Olivia until the sunrise! 💃✨"
      },
      {
        title: "The Royal Toast of Honor",
        blessing: "Legendary catch! You have been granted the honorary royal toast to everlasting joy, laughter, and unbreakable devotion.",
        noteGreeting: "Raising the royal toast to Daniel & Olivia! May your marriage overflow with endless happiness, warmth, and shared dreams. 🥂🕊️"
      },
      {
        title: "Sweet Slice of Fortune",
        blessing: "The sweetest bouquet catch! You are gifted premier honors at the cutting of the wedding cake and unending sweet days ahead.",
        noteGreeting: "Sending the sweetest love and blessings to Daniel & Olivia on their unforgettable wedding day! 🍰💖"
      },
      {
        title: "Bearer of Joy & Light",
        blessing: "Blessed by the bridal flowers! Your presence brings the warmest light and sweetest smile to Daniel & Olivia's celebration.",
        noteGreeting: "So honoured to witness this magical day. Wishing Olivia & Daniel a life as bright and blooming as the bridal bouquet! 🌸✨"
      },
      {
        title: "The Golden Destiny",
        blessing: "A once-in-a-lifetime toss! True love, sparkling adventures, and extraordinary fortune will follow your every step this year.",
        noteGreeting: "Caught the Golden Destiny! May every chapter of Daniel & Olivia's love story shine with endless wonder! ⭐💛"
      }
    ];

    let discoveredFortunes = new Set();
    try {
      const saved = sessionStorage.getItem("do_wedding_fortunes");
      if (saved) discoveredFortunes = new Set(JSON.parse(saved));
    } catch (e) {}

    let isFlying = false;
    let flightReq = null;
    let meterReq = null;
    let meterTime = 0;
    let meterValue = 50; // 0 to 100
    let lastPetalSpawn = 0;
    let hasCaught = false;

    // Soft gentle chime using Web Audio API
    function playChime(isWin) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") ctx.resume();

        // Royal victory fanfare chords on win (C5, E5, G5, C6, E6)
        const notes = isWin ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [440, 392];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = isWin ? "triangle" : "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.11);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.11);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.11 + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.11);
          osc.stop(ctx.currentTime + i * 0.11 + 0.7);
        });
      } catch (err) {}
    }

    // Confetti Engine
    function launchConfetti() {
      if (!confettiCanvas) return;
      const ctx = confettiCanvas.getContext("2d");
      const rect = arena.getBoundingClientRect();
      confettiCanvas.width = rect.width;
      confettiCanvas.height = rect.height;

      const colors = ["#c9a96a", "#b08d4f", "#fef3c7", "#fcd34d", "#fbcfe8", "#ffffff", "#ffd700"];
      const particles = [];
      const count = Math.min(110, Math.floor(rect.width / 3.8));

      for (let i = 0; i < count; i++) {
        particles.push({
          x: rect.width * 0.5 + (Math.random() - 0.5) * 120,
          y: rect.height * 0.38 + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 8 - 2.5,
          size: Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vr: (Math.random() - 0.5) * 14,
          alpha: 1,
          shape: Math.random() > 0.4 ? "petal" : "ribbon"
        });
      }

      let animId;
      function render() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let alive = false;
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.18; // gravity
          p.vx *= 0.98; // air resistance
          p.rotation += p.vr;
          p.alpha -= 0.009;

          if (p.alpha > 0) {
            alive = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;

            if (p.shape === "petal") {
              ctx.beginPath();
              ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
            }
            ctx.restore();
          }
        });

        if (alive) {
          animId = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
      }
      render();
    }

    // Update collection dots in fortune card
    function updateProgress() {
      if (!fortuneProgressText || !fortuneDots) return;
      const count = discoveredFortunes.size;
      fortuneProgressText.textContent = `Discovered ${count} of ${fortunes.length} Wedding Fortunes`;
      const dots = $$(".f-dot", fortuneDots);
      dots.forEach((dot, idx) => {
        dot.classList.toggle("is-found", idx < count);
      });
      try {
        sessionStorage.setItem("do_wedding_fortunes", JSON.stringify([...discoveredFortunes]));
      } catch (e) {}
    }

    // Power meter animation (smooth comfortable oscillation)
    function startMeter() {
      if (meterReq) cancelAnimationFrame(meterReq);
      function loop() {
        meterTime += 0.032;
        // Sine oscillation between 8% and 92%
        meterValue = 50 + 42 * Math.sin(meterTime);
        if (meterPointer) meterPointer.style.left = `${meterValue}%`;
        meterReq = requestAnimationFrame(loop);
      }
      meterReq = requestAnimationFrame(loop);
    }

    function stopMeter() {
      if (meterReq) cancelAnimationFrame(meterReq);
    }


    // Launch the bridal bouquet
    let tossAccurate = false;
    let tossMissReason = "";
    let tossProgress = 0;

    function launchBouquet() {
      if (isFlying) return;
      isFlying = true;
      hasCaught = false;

      // Capture the exact meter power at the moment of launch!
      const power = meterValue;
      stopMeter();

      // Generous golden sweet spot (18% to 82%) for easy, satisfying wins
      if (power >= 18 && power <= 82) {
        tossAccurate = true;
        tossMissReason = "";
      } else if (power < 18) {
        tossAccurate = false;
        tossMissReason = "Gentle toss! Aim a little closer to the center golden zone 🌸";
      } else {
        tossAccurate = false;
        tossMissReason = "Powerful toss! Aim a little closer to the center golden zone 🌸";
      }

      sprite.classList.remove("is-resting");
      meterWrap.classList.add("is-hidden");
      tossBtn.hidden = true;
      tossBtn.style.display = "none";
      catchBtn.hidden = false;
      catchBtn.style.display = "inline-flex";

      const arenaRect = arena.getBoundingClientRect();
      const arenaW = arenaRect.width;
      const arenaH = arenaRect.height;

      // Start position (bottom center)
      const startX = arenaW * 0.5;
      const startY = arenaH - 85;

      // Peak target (the lowered golden wreath at top 38%)
      let peakX = arenaW * 0.5;
      let peakY = arenaH * 0.38;
      let endX = arenaW * 0.78;
      let endY = arenaH - 25;

      if (!tossAccurate) {
        if (power < 18) {
          peakY = arenaH * 0.54;
          endX = arenaW * 0.64;
          endY = arenaH - 40;
        } else {
          peakY = arenaH * 0.16;
          endX = arenaW * 0.90;
          endY = arenaH - 10;
        }
      }

      const duration = 2600; // ms (relaxed comfortable flight)
      const startTime = performance.now();

      function flightLoop(now) {
        const elapsed = now - startTime;
        tossProgress = Math.min(1, elapsed / duration);

        const t = tossProgress;
        const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * peakX + t * t * endX;
        const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * (peakY - 20) + t * t * endY;
        const currentRot = -15 + t * 42;

        sprite.style.left = `${currentX}px`;
        sprite.style.top = `${currentY}px`;
        sprite.style.bottom = "auto";
        sprite.style.transform = `translate(-50%, -50%) rotate(${currentRot}deg)`;

        // Spawn dynamic trailing blossom petals
        if (now - lastPetalSpawn > 80 && t < 0.88) {
          lastPetalSpawn = now;
          const petal = document.createElement("span");
          petal.className = "trail-petal";
          const pSize = Math.random() * 8 + 6;
          petal.style.width = `${pSize}px`;
          petal.style.height = `${pSize * 1.3}px`;
          petal.style.left = `${currentX + (Math.random() - 0.5) * 14}px`;
          petal.style.top = `${currentY + (Math.random() - 0.5) * 14}px`;
          petal.style.setProperty("--tx", `${(Math.random() - 0.5) * 30}px`);
          petal.style.setProperty("--ty", `${Math.random() * 30 + 15}px`);
          petal.style.background = Math.random() > 0.5 ? "#fcd34d" : "#fbcfe8";
          trailsContainer.appendChild(petal);
          setTimeout(() => petal.remove(), 800);
        }

        // Highlight wreath and catch button during generous sweet timing window (0.24 to 0.82)
        if (tossAccurate && t >= 0.24 && t <= 0.82) {
          catchBtn.classList.add("is-in-range");
          wreath.style.transform = "translate(-50%, -50%) scale(1.18)";
          wreath.style.filter = "drop-shadow(0 0 16px rgba(245,214,138,.9))";
        } else {
          catchBtn.classList.remove("is-in-range");
          if (!hasCaught) {
            wreath.style.transform = "translate(-50%, -50%) scale(1)";
            wreath.style.filter = "none";
          }
        }

        if (t < 1 && !hasCaught) {
          flightReq = requestAnimationFrame(flightLoop);
        } else if (!hasCaught) {
          // Flight ended without catching
          handleMiss(tossMissReason || "Missed the golden moment! The bouquet already drifted past 🌸");
        }
      }

      flightReq = requestAnimationFrame(flightLoop);
    }

    // Catch attempt triggered by catchBtn, spacebar, or direct arena tap
    function handleCatch() {
      if (!isFlying || hasCaught) return;

      const wreathRect = wreath.getBoundingClientRect();
      const spriteRect = sprite.getBoundingClientRect();

      const spriteCenterX = spriteRect.left + spriteRect.width / 2;
      const spriteCenterY = spriteRect.top + spriteRect.height / 2;
      const wreathCenterX = wreathRect.left + wreathRect.width / 2;
      const wreathCenterY = wreathRect.top + wreathRect.height / 2;

      const dist = Math.hypot(spriteCenterX - wreathCenterX, spriteCenterY - wreathCenterY);

      // Highly forgiving win condition:
      // If toss is accurate and in the comfortable window (0.20 to 0.86), OR within generous wreath radius
      const isInsideWreath = (tossAccurate && tossProgress >= 0.20 && tossProgress <= 0.86) || dist < (wreathRect.width * 0.95);

      if (isInsideWreath) {
        hasCaught = true;
        if (flightReq) cancelAnimationFrame(flightReq);
        catchBtn.classList.remove("is-in-range");
        catchBtn.hidden = true;
        catchBtn.style.display = "none";

        // Snap bouquet into wreath with glorious victory celebration
        wreath.classList.add("is-won");
        sprite.classList.add("is-caught");
        sprite.style.left = "50%";
        sprite.style.top = "38%";

        if (winnerCelebration) {
          winnerCelebration.classList.add("is-visible");
        }

        if (navigator.vibrate) {
          navigator.vibrate([40, 70, 140]);
        }

        playChime(true);
        launchConfetti();

        // Pick fortune
        let unpicked = fortunes.filter((_, idx) => !discoveredFortunes.has(idx));
        let chosenIdx;
        if (unpicked.length > 0) {
          const pick = unpicked[Math.floor(Math.random() * unpicked.length)];
          chosenIdx = fortunes.indexOf(pick);
        } else {
          chosenIdx = Math.floor(Math.random() * fortunes.length);
        }
        discoveredFortunes.add(chosenIdx);

        const fortune = fortunes[chosenIdx];
        fortuneTitle.textContent = fortune.title;
        fortuneBlessing.textContent = fortune.blessing;

        // Wire "Send With My Note" button
        fortuneNoteBtn.onclick = (e) => {
          e.preventDefault();
          const noteMsg = $("#note-message");
          if (noteMsg) {
            noteMsg.value = fortune.noteGreeting;
          }
          const noteSection = $("#leave-a-note");
          if (noteSection) {
            noteSection.scrollIntoView({ behavior: "smooth" });
          }
          const noteName = $("#note-name");
          if (noteName) setTimeout(() => noteName.focus(), 600);
        };

        updateProgress();

        setTimeout(() => {
          fortuneCard.hidden = false;
        }, 650);
      } else {
        // Missed! Provide specific informative feedback
        if (!tossAccurate) {
          handleMiss(tossMissReason);
        } else if (tossProgress < 0.20) {
          handleMiss("A bit early! Let the bouquet rise towards the golden wreath 🌸");
        } else {
          handleMiss("A bit late! The bouquet already drifted past the wreath 🌸");
        }
      }
    }

    function handleMiss(reason) {
      if (hasCaught) return;
      hasCaught = true;
      if (flightReq) cancelAnimationFrame(flightReq);
      catchBtn.hidden = true;
      catchBtn.style.display = "none";
      playChime(false);

      const missSub = missCard.querySelector(".fortune-miss__sub");
      if (missSub && reason) {
        missSub.textContent = reason;
      }

      setTimeout(() => {
        missCard.hidden = false;
      }, 350);
    }

    // Reset arena to initial ready state
    function resetArena() {
      isFlying = false;
      hasCaught = false;
      tossAccurate = false;
      tossMissReason = "";
      if (flightReq) cancelAnimationFrame(flightReq);
      trailsContainer.innerHTML = "";

      fortuneCard.hidden = true;
      missCard.hidden = true;
      meterWrap.classList.remove("is-hidden");
      catchBtn.hidden = true;
      catchBtn.classList.remove("is-in-range");
      catchBtn.style.display = "none";
      tossBtn.hidden = false;
      tossBtn.style.display = "inline-flex";

      wreath.classList.remove("is-won");
      wreath.style.transform = "";
      wreath.style.filter = "";
      sprite.classList.remove("is-caught");
      if (winnerCelebration) winnerCelebration.classList.remove("is-visible");

      sprite.style.opacity = "1";
      sprite.style.left = "50%";
      sprite.style.top = "auto";
      sprite.style.bottom = "62px";
      sprite.style.transform = "translate(-50%, 0)";
      sprite.classList.add("is-resting");
      startMeter();
    }

    // Event listeners
    tossBtn.addEventListener("click", launchBouquet);
    catchBtn.addEventListener("click", handleCatch);
    fortuneAgainBtn.addEventListener("click", resetArena);
    retryBtn.addEventListener("click", resetArena);

    // Direct tap anywhere on arena during flight to catch (mobile-friendly)
    arena.addEventListener("click", (e) => {
      if (isFlying && !hasCaught) {
        if (!e.target.closest("button") || e.target.closest("#bouquet-catch-btn")) {
          handleCatch();
        }
      }
    });

    // Keyboard support: Spacebar launches or catches
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        const rect = arena.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          e.preventDefault();
          if (!isFlying) launchBouquet();
          else if (!hasCaught) handleCatch();
        }
      }
    });

    // Initial setup
    resetArena();
  })();

  /* ---------------------------------------------------------
     WOW MOMENT #2 — PHOTOGRAPH STACK (full control & touch/drag)
  --------------------------------------------------------- */
  (function initPhotoStack() {
    const stack = $("#photo-stack");
    const restackBtn = $("#photo-restack");
    const nextBtn = $("#photo-next");
    const prevBtn = $("#photo-prev");
    const counterEl = $("#photo-counter");
    if (!stack) return;

    // Fallback: hide any broken image and show luxury gradient
    $$("img", stack).forEach((img) => {
      img.addEventListener("error", () => {
        img.style.display = "none";
        img.parentElement.style.background = "linear-gradient(160deg, var(--cream), var(--beige))";
      });
    });

    function getCards() {
      return Array.from(stack.querySelectorAll(".photo-card"));
    }

    function updateCounter() {
      const cards = getCards();
      if (!cards.length || !counterEl) return;
      const topIndex = parseInt(cards[0].dataset.index || 0, 10) + 1;
      counterEl.textContent = `${topIndex} / ${cards.length}`;
    }

    function layout() {
      const cards = getCards();
      cards.forEach((card, i) => {
        card.style.position = "absolute";
        card.style.left = "50%";
        card.style.top = "50%";
        card.style.width = "100%";
        card.style.height = "100%";
        card.style.zIndex = String(100 - i);
        // Only the top card receives pointer interactions
        card.style.pointerEvents = i === 0 ? "auto" : "none";
        card.style.cursor = i === 0 ? "grab" : "default";

        if (card.classList.contains("is-dragging")) return;

        const depth = Math.min(i, 4);
        const rot = (i % 2 === 0 ? -1 : 1) * depth * 2.2;
        card.style.transform = `translate(-50%,-50%) translateY(${depth * 8}px) scale(${1 - depth * 0.035}) rotate(${rot}deg)`;
        card.style.opacity = depth > 3 ? "0" : "1";
      });
      updateCounter();
    }

    function nextPhoto() {
      const cards = getCards();
      if (cards.length < 2) return;
      const topCard = cards[0];
      topCard.style.transition = "transform .38s cubic-bezier(.22, 1, .36, 1), opacity .35s ease";
      topCard.style.transform = "translate(-130%, -50%) rotate(-14deg)";
      topCard.style.opacity = "0";

      window.setTimeout(() => {
        topCard.style.transition = "";
        topCard.style.opacity = "";
        stack.appendChild(topCard);
        layout();
      }, 340);
    }

    function prevPhoto() {
      const cards = getCards();
      if (cards.length < 2) return;
      const lastCard = cards[cards.length - 1];
      lastCard.style.transition = "none";
      lastCard.style.transform = "translate(-130%, -50%) rotate(-14deg)";
      lastCard.style.opacity = "0";
      stack.insertBefore(lastCard, cards[0]);

      // Trigger reflow then animate in
      lastCard.getBoundingClientRect();
      lastCard.style.transition = "transform .38s cubic-bezier(.22, 1, .36, 1), opacity .35s ease";
      layout();
    }

    function restack() {
      const cards = getCards();
      const sorted = cards.sort((a, b) => parseInt(a.dataset.index, 10) - parseInt(b.dataset.index, 10));
      sorted.forEach((c) => {
        c.style.transition = "";
        stack.appendChild(c);
      });
      layout();
    }

    // Unified pointer/touch drag on top card
    let startX = 0, startY = 0, dx = 0, dy = 0, isDragging = false, activePointerId = null;

    function handlePointerDown(e) {
      const cards = getCards();
      if (!cards.length) return;
      const topCard = cards[0];

      isDragging = true;
      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      dx = 0;
      dy = 0;
      topCard.classList.add("is-dragging");
      topCard.style.cursor = "grabbing";
      try {
        topCard.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    function handlePointerMove(e) {
      if (!isDragging) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;

      const cards = getCards();
      if (!cards.length) return;
      const topCard = cards[0];
      const rot = dx * 0.07;
      topCard.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy * 0.3}px)) rotate(${rot}deg)`;
    }

    function handlePointerUp(e) {
      if (!isDragging) return;
      isDragging = false;

      const cards = getCards();
      if (!cards.length) return;
      const topCard = cards[0];
      topCard.classList.remove("is-dragging");
      topCard.style.cursor = "grab";

      try {
        if (activePointerId !== null) topCard.releasePointerCapture(activePointerId);
      } catch (err) {}

      // Click / Tap detection: if dragged less than 12px, advance to next photo!
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
        nextPhoto();
        return;
      }

      // Drag / Swipe detection: if dragged more than 45px, flick to next!
      if (Math.abs(dx) >= 45) {
        const flyX = dx > 0 ? 120 : -120;
        topCard.style.transition = "transform .35s ease, opacity .35s ease";
        topCard.style.transform = `translate(calc(-50% + ${flyX}vw), -50%) rotate(${dx * 0.12}deg)`;
        topCard.style.opacity = "0";

        window.setTimeout(() => {
          topCard.style.transition = "";
          topCard.style.opacity = "";
          stack.appendChild(topCard);
          layout();
        }, 300);
      } else {
        // Snap back into place
        topCard.style.transition = "transform .25s ease";
        layout();
        setTimeout(() => { topCard.style.transition = ""; }, 250);
      }
    }

    // Attach pointer events to stack container
    stack.addEventListener("pointerdown", handlePointerDown);
    stack.addEventListener("pointermove", handlePointerMove);
    stack.addEventListener("pointerup", handlePointerUp);
    stack.addEventListener("pointercancel", handlePointerUp);

    // Keyboard navigation
    stack.setAttribute("tabindex", "0");
    stack.setAttribute("role", "region");
    stack.setAttribute("aria-label", "Interactive photograph stack — click, drag, or use arrow keys");
    stack.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        nextPhoto();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevPhoto();
      }
    });

    if (nextBtn) nextBtn.addEventListener("click", nextPhoto);
    if (prevBtn) prevBtn.addEventListener("click", prevPhoto);
    if (restackBtn) restackBtn.addEventListener("click", restack);

    layout();
  })();

  /* ---------------------------------------------------------
     THE PLACE — open Google Maps & copy coordinates
  --------------------------------------------------------- */
  (function initPlace() {
    const openBtn = $("#open-location");
    if (openBtn) {
      const url = buildGoogleMapsUrl(weddingLocation);
      openBtn.setAttribute("href", url);
    }

    const copyBtn = $("#copy-coords-btn");
    const copyText = $("#copy-coords-text");
    if (copyBtn && copyText) {
      copyBtn.addEventListener("click", () => {
        const coords = `${weddingLocation.latitude}, ${weddingLocation.longitude}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(coords).then(() => {
            const original = copyText.textContent;
            copyText.textContent = "Copied! ✓";
            window.setTimeout(() => { copyText.textContent = original; }, 2000);
          }).catch(() => {});
        }
      });
    }
  })();

  /* ---------------------------------------------------------
     WOW MOMENT #3 — LEAVE A NOTE → Letter into Envelope & Seal
  --------------------------------------------------------- */
  (function initNote() {
    const form = $("#note-form");
    const nameInput = $("#note-name");
    const messageInput = $("#note-message");
    const errorEl = $("#note-error");
    const letterStage = $("#letter-stage");
    const envelopeCraft = $("#envelope-craft");
    const paper = $("#letter-paper");
    const flap = $("#envelope-flap");
    const seal = $("#envelope-seal");
    const sealedPanel = $("#note-sealed");
    const againBtn = $("#note-again");
    if (!form) return;

    // Structured so this can later call an API (e.g. a Google Sheets /
    // Excel-backed endpoint) without touching the animation logic below.
    async function submitNote(entry) {
      // Placeholder for a future backend integration:
      // await fetch("/api/notes", { method: "POST", body: JSON.stringify(entry) });
      return Promise.resolve(entry);
    }

    function resetStage() {
      letterStage.classList.remove("is-active");
      if (paper) paper.classList.remove("is-sliding-in");
      if (flap) flap.classList.remove("is-closed");
      if (seal) seal.classList.remove("is-stamped");
      if (envelopeCraft) envelopeCraft.classList.remove("is-sent");
      sealedPanel.hidden = true;
      form.classList.remove("is-hidden");
      form.reset();
      errorEl.hidden = true;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();
      if (!name || !message) {
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;

      submitNote({ name, message, sentAt: new Date().toISOString() });

      form.classList.add("is-hidden");
      letterStage.classList.add("is-active");
      $(".letter-stage__from", paper).textContent = `From ${name}`;
      $(".letter-stage__body", paper).textContent = message;

      if (prefersReducedMotion) {
        letterStage.classList.remove("is-active");
        sealedPanel.hidden = false;
        return;
      }

      // Step 1: Letter card appears hovered above envelope.
      // Step 2 (~850ms): Letter slides gracefully down into the envelope pocket.
      window.setTimeout(() => {
        if (paper) paper.classList.add("is-sliding-in");
      }, 850);

      // Step 3 (~2050ms): Flap folds down over the pocket.
      window.setTimeout(() => {
        if (flap) flap.classList.add("is-closed");
      }, 2050);

      // Step 4 (~2800ms): Gold wax seal medallion stamps down on the flap.
      window.setTimeout(() => {
        if (seal) seal.classList.add("is-stamped");
      }, 2800);

      // Step 5 (~3500ms): Sealed envelope floats up into delivery.
      window.setTimeout(() => {
        if (envelopeCraft) envelopeCraft.classList.add("is-sent");
      }, 3500);

      // Step 6 (~4200ms): Success screen revealed.
      window.setTimeout(() => {
        letterStage.classList.remove("is-active");
        sealedPanel.hidden = false;
      }, 4200);
    });

    if (againBtn) againBtn.addEventListener("click", resetStage);
  })();

  /* ---------------------------------------------------------
     HIDDEN SECRET
  --------------------------------------------------------- */
  (function initSecret() {
    const ornament = $("#secret-ornament");
    const overlay = $("#secret-overlay");
    const closeBtn = $("#secret-close");
    if (!ornament || !overlay) return;

    ornament.addEventListener("click", () => { overlay.hidden = false; });
    closeBtn.addEventListener("click", () => { overlay.hidden = true; });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.hidden = true; });
  })();

  /* ---------------------------------------------------------
     FINAL CLOSING LOOP — CINEMATIC REVERSE SEQUENCE
  --------------------------------------------------------- */
  (function initClosing() {
    const closeBtn = $("#close-invitation");
    const closingCard = $("#closing-card");
    if (!closeBtn) return;

    closeBtn.addEventListener("click", () => {
      if (boxTrigger.classList.contains("is-closing")) return;
      closingCard.classList.add("is-returning");
      pauseMusic();

      if (prefersReducedMotion) {
        window.scrollTo({ top: 0, behavior: "auto" });
        boxScene.classList.remove("is-open");
        boxTrigger.classList.remove("is-open");
        boxTrigger.classList.remove("is-closing");
        boxTrigger.setAttribute("aria-label", "Untie the ribbon and open the invitation");
        mainEl.hidden = true;
        document.body.style.overflow = "hidden";
        closingCard.classList.remove("is-returning");
        return;
      }

      // Step 1: Rapidly fade the folio scene back in over 350ms in its open state
      boxScene.classList.add("is-closing-scene");
      boxScene.classList.remove("is-open");
      document.body.style.overflow = "hidden";

      // Step 2: Once the dark scene covers the screen at 350ms, hide main & reset scroll without jank
      window.setTimeout(() => {
        mainEl.hidden = true;
        window.scrollTo({ top: 0, behavior: "instant" });

        // Step 3: Trigger the Reverse Closing Animation
        window.setTimeout(() => {
          boxTrigger.classList.remove("is-open");
          boxTrigger.classList.add("is-closing");

          // Step 4: After reverse sequence finishes (1450ms), clean up to resting closed state
          window.setTimeout(() => {
            boxTrigger.classList.remove("is-closing");
            boxScene.classList.remove("is-closing-scene");
            closingCard.classList.remove("is-returning");
            boxTrigger.setAttribute("aria-label", "Untie the ribbon and open the invitation");
          }, 1450);
        }, 30);
      }, 350);
    });
  })();

  /* ---------------------------------------------------------
     GENERIC SCROLL-REVEAL
  --------------------------------------------------------- */
  (function initReveal() {
    const targets = $$(".section-head, .story, .the-day-section, .dress-code, .bouquet-toss, .place__map, .photo-stack");
    if (!("IntersectionObserver" in window) || !targets.length) return;
    targets.forEach((t) => t.classList.add("reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => io.observe(t));
  })();

  /* ---------------------------------------------------------
     DRESS CODE SWATCH INTERACTION (Click to copy hex)
  --------------------------------------------------------- */
  (function initDressCode() {
    const swatches = $$(".swatch-item");
    swatches.forEach((swatch) => {
      swatch.style.cursor = "pointer";
      swatch.setAttribute("title", "Click to copy color code");
      swatch.addEventListener("click", () => {
        const hex = swatch.querySelector(".swatch-hex");
        if (!hex) return;
        const text = hex.textContent.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
        }
        const orig = hex.textContent;
        hex.textContent = "Copied! ✓";
        hex.style.color = "var(--gold)";
        setTimeout(() => {
          hex.textContent = orig;
          hex.style.color = "";
        }, 1400);
      });
    });
  })();
})();
