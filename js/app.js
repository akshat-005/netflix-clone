/* =====================================================================
   app.js — all the logic. You normally DON'T need to edit this file;
   change content in js/config.js instead.
===================================================================== */

(() => {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const byId = (id) => titles.find((t) => t.id === id);
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* Screen switcher: show one .screen, hide the rest ----------------- */
  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.toggle("is-active", s.id === id));
  }

  /* ==================================================================
     SCREEN 1 — INTRO
  ================================================================== */
  function runIntro() {
    const brand = CONFIG.brand || CONFIG.name;
    document.title = brand;

    $("#introLetter").textContent = brand.charAt(0);   // the opening "A"
    $("#introWord").textContent   = brand;             // resolves into "ARFLIX"
    buildBeams();

    // The "tudum" boom lands ~0.4s into the clip, so audio + visuals must
    // start together — then the beam-burst hits exactly on the boom.
    // Browsers block autoplay-with-sound on a cold load; try it, and if it's
    // refused, show a one-tap gate and start on the user's gesture instead.
    const snd = $("#introSound");
    if (snd) snd.volume = 0.85;

    const attempt = snd ? snd.play() : null;
    if (attempt && typeof attempt.then === "function") {
      attempt.then(startIntroSequence).catch(() => showStartGate(snd));
    } else {
      startIntroSequence();
    }
  }

  function startIntroSequence() {
    const letterEl = $("#introLetter");
    const wordEl   = $("#introWord");

    // 1. the "A" zooms in (the clip's ~0.35s of lead-in silence covers this)
    requestAnimationFrame(() => letterEl.classList.add("animate"));
    // 2. it explodes into ribbon beams of light right as the boom hits (~0.4s)
    setTimeout(() => {
      $$(".beam").forEach((b) => b.classList.add("animate"));
      letterEl.classList.add("burst");
    }, 420);
    // 3. the ARFLIX wordmark resolves out of the light and holds
    setTimeout(() => wordEl.classList.add("animate"), 1100);
    // 4. hand off to the profile screen (the tudum tail fades under it)
    setTimeout(goToProfiles, CONFIG.introDurationMs);
  }

  // Build a spectrum of tall, thin light ribbons centered on the "A".
  function buildBeams() {
    const beamsEl = $("#beams");
    beamsEl.innerHTML = "";
    const N = 18;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);                 // 0..1 across the spectrum
      const beam = document.createElement("div");
      beam.className = "beam";
      beam.style.setProperty("--c", `hsl(${Math.round(360 * t)} 100% 60%)`);
      beam.style.setProperty("--x", `${((t - 0.5) * 92).toFixed(1)}vw`);       // spread outward
      beam.style.setProperty("--w", `${(4 + Math.random() * 6).toFixed(1)}px`);
      beam.style.setProperty("--d", `${(Math.abs(t - 0.5) * 0.45).toFixed(2)}s`); // center first
      beamsEl.appendChild(beam);
    }
  }

  // Shown only when the browser blocks audio autoplay. One tap unlocks the
  // sound and starts the whole intro from the top, in sync.
  function showStartGate(snd) {
    const gate = document.createElement("button");
    gate.className = "intro-gate";
    gate.setAttribute("aria-label", "Play intro");
    gate.innerHTML =
      `<span class="intro-gate-play">
         <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
       </span>
       <span class="intro-gate-hint">Tap to play</span>`;
    gate.addEventListener("click", () => {
      gate.remove();
      if (snd) { try { snd.currentTime = 0; } catch (_) {} snd.play().catch(() => {}); }
      startIntroSequence();
    }, { once: true });
    $("#introStage").appendChild(gate);
  }

  /* ==================================================================
     SCREEN 2 — PROFILES
  ================================================================== */
  function buildProfiles() {
    const grid = $("#profilesGrid");
    grid.innerHTML = "";

    CONFIG.profiles.forEach((p) => {
      const li = document.createElement("li");
      li.className = "profile";
      li.tabIndex = 0;
      li.setAttribute("role", "button");

      // Avatar: photo for the main profile, Netflix-style smiley (or the
      // rainbow "kids" tile) for the joke profiles.
      let avatar;
      if (p.photo) {
        avatar = document.createElement("img");
        avatar.className = "profile-avatar";
        avatar.src = p.photo;
        avatar.alt = p.name;
      } else {
        avatar = document.createElement("div");
        avatar.className = "profile-avatar";
        avatar.innerHTML = isKids(p) ? kidsSVG() : smileySVG(p.color || "#5b8def");
      }

      const name = document.createElement("span");
      name.className = "profile-name";
      name.textContent = p.name;

      li.append(avatar, name);

      const activate = () => (p.isMain ? enterBrowse() : showToast(p.easterEgg));
      li.addEventListener("click", activate);
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
      });

      grid.appendChild(li);
    });

    // "Add Profile" tile, like Netflix (playful easter-egg on click).
    const add = document.createElement("li");
    add.className = "profile add";
    add.tabIndex = 0;
    add.setAttribute("role", "button");
    add.innerHTML =
      `<div class="profile-avatar">
         <svg viewBox="0 0 100 100" aria-hidden="true">
           <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="6"/>
           <path d="M50 34V66M34 50H66" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
         </svg>
       </div>
       <span class="profile-name">Add Profile</span>`;
    const addMsg = () => showToast("This whole thing is just for you 🥹 no room for anyone else.");
    add.addEventListener("click", addMsg);
    add.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addMsg(); }
    });
    grid.appendChild(add);
  }

  /* ---- Avatar SVG helpers ----------------------------------------- */
  const isKids = (p) => p.kids === true || /kid/i.test(p.name || "");

  // Darken a #rrggbb hex by pct (0..1) for the smiley's vertical gradient.
  function shade(hex, pct) {
    const n = parseInt((hex || "#5b8def").slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * (1 - pct));
    const g = Math.round(((n >> 8) & 255) * (1 - pct));
    const b = Math.round((n & 255) * (1 - pct));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function smileySVG(color) {
    const id = "g" + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${color}"/>
        <stop offset="1" stop-color="${shade(color, 0.3)}"/>
      </linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id})"/>
      <circle cx="35" cy="42" r="6.5" fill="#fff"/>
      <circle cx="65" cy="42" r="6.5" fill="#fff"/>
      <path d="M33 60 Q50 76 67 60" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    </svg>`;
  }

  function kidsSVG() {
    const id = "k" + Math.random().toString(36).slice(2, 7);
    const stripes = ["#3a8d5b", "#e08b2d", "#e8615b", "#e84f9c", "#8e5bd0", "#4f74e8"];
    const w = 100 / stripes.length;
    const rects = stripes
      .map((c, i) => `<rect x="${(i * w).toFixed(2)}" y="0" width="${w.toFixed(2)}" height="100" fill="${c}"/>`)
      .join("");
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <clipPath id="${id}"><rect width="100" height="100"/></clipPath>
      <g clip-path="url(#${id})">${rects}</g>
      <text x="50" y="60" text-anchor="middle" paint-order="stroke"
            font-family="'Bebas Neue',Impact,sans-serif" font-weight="700" font-size="36"
            fill="#E50914" stroke="#fff" stroke-width="4">kids</text>
    </svg>`;
  }

  let toastTimer;
  function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg || "🎬";
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function goToProfiles() {
    buildProfiles();
    showScreen("screen-profiles");
  }

  /* ==================================================================
     SCREEN 3 — BROWSE
  ================================================================== */
  function buildBrowse() {
    // Nav + hero content from config
    $("#navLogo").textContent = CONFIG.brand || CONFIG.name;

    // Nav avatar: her photo, falling back to a smiley if it isn't added yet.
    const slot = $("#navAvatar");
    const avatar = document.createElement("img");
    avatar.src = CONFIG.profilePhoto;
    avatar.alt = CONFIG.name;
    avatar.onerror = () => { slot.innerHTML = smileySVG("#5b8def"); };
    slot.innerHTML = "";
    slot.appendChild(avatar);

    $("#heroTitle").textContent = CONFIG.hero.title;
    $("#heroBlurb").textContent = CONFIG.hero.blurb;
    $("#hero").style.backgroundImage = `url("${CONFIG.hero.backdrop}")`;

    $("#heroPlay").addEventListener("click", () => openPlayer({ name: CONFIG.hero.title, playStart: CONFIG.hero.playStart }));
    $("#heroInfo").addEventListener("click", () => {
      // "More Info" just plays too — one master video, one story.
      openPlayer({ name: CONFIG.hero.title, playStart: CONFIG.hero.playStart });
    });

    // Rows
    const rowsEl = $("#rows");
    rowsEl.innerHTML = "";
    rows.forEach((row) => rowsEl.appendChild(buildRow(row)));
    syncMuteIcons();   // reflect the starting sound preference on every card

    // Nav background on scroll
    const nav = $("#nav");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Hover-preview audio (shared across every card) -------------- */
  // Mute state is global and sticky, like Netflix: mute one preview and every
  // following preview stays muted until you turn it back on.
  let previewMuted = !(CONFIG.previewSound !== false);
  let activePreview = null;        // the <video> currently previewing
  let stopActivePreview = null;    // its stop function, so a new hover can cancel it

  // Ramp volume up so previews don't slam in at full blast.
  function fadeInVolume(video) {
    if (!video || video.muted) return;
    const target = Math.min(Math.max(CONFIG.previewVolume ?? 0.6, 0), 1);
    const steps = 12;
    let i = 0;
    clearInterval(video._fade);
    video.volume = 0;
    video._fade = setInterval(() => {
      i++;
      if (!video.isConnected || i >= steps) { clearInterval(video._fade); }
      try { video.volume = Math.min(target * (i / steps), target); } catch (_) {}
    }, 35);
  }

  // Keep every card's mute icon in sync with the global state.
  function syncMuteIcons() {
    $$(".card-icon.mute").forEach((btn) => {
      const on  = $(".ic-vol", btn);
      const off = $(".ic-mut", btn);
      if (on)  on.hidden  = previewMuted;
      if (off) off.hidden = !previewMuted;
    });
  }

  /* Stable fake "% Match" derived from the title id (never changes). */
  function matchScore(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return 90 + (h % 10);
  }

  /* Build one row: header + progress dashes + arrows + track -------- */
  function buildRow(row) {
    const section = document.createElement("section");
    section.className = "row";
    section.innerHTML =
      `<div class="row-head">
         <h2 class="row-title">${row.title}<span class="explore">Explore All ›</span></h2>
         <div class="row-progress"></div>
       </div>
       <div class="row-body">
         <button class="row-arrow left" aria-label="Scroll left" hidden>
           <svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M15.4 7.4L14 6l-6 6 6 6 1.4-1.4-4.6-4.6z"/></svg>
         </button>
         <div class="row-track"></div>
         <button class="row-arrow right" aria-label="Scroll right">
           <svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M8.6 7.4L10 6l6 6-6 6-1.4-1.4 4.6-4.6z"/></svg>
         </button>
       </div>`;

    const track = $(".row-track", section);
    row.titleIds.forEach((id) => {
      const title = byId(id);
      if (title) track.appendChild(buildCard(title));
    });

    // --- Scroll-progress dashes + arrow state ---------------------
    const progress = $(".row-progress", section);
    const left  = $(".row-arrow.left", section);
    const right = $(".row-arrow.right", section);

    const pages = () => Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth));

    function renderProgress() {
      const n = pages();
      if (n <= 1) { progress.innerHTML = ""; return; }
      if (progress.children.length !== n) {
        progress.innerHTML = Array.from({ length: n }, () => "<i></i>").join("");
      }
      const max = track.scrollWidth - track.clientWidth;
      const idx = max <= 0 ? 0 : Math.round((track.scrollLeft / max) * (n - 1));
      [...progress.children].forEach((d, i) => d.classList.toggle("on", i === idx));
    }

    function renderArrows() {
      const max = track.scrollWidth - track.clientWidth;
      left.hidden = track.scrollLeft <= 4;
      right.hidden = track.scrollLeft >= max - 4;
    }

    const update = () => { renderProgress(); renderArrows(); };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Posters change scrollWidth as they load, so recheck then too.
    $$("img", track).forEach((img) => img.addEventListener("load", update));
    requestAnimationFrame(update);

    const page = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: "smooth" });
    left.addEventListener("click", () => page(-1));
    right.addEventListener("click", () => page(1));

    return section;
  }

  /* Build a single title card with hover-preview behaviour ---------- */
  function buildCard(title) {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Play ${title.name}`);

    const img = document.createElement("img");
    img.src = title.poster;
    img.alt = title.name;
    img.addEventListener("load", () => img.classList.add("loaded"));
    img.onerror = () => img.classList.add("loaded"); // hide shimmer even if missing

    const shimmer = document.createElement("div");
    shimmer.className = "shimmer";

    // Static poster furniture: brand mark, optional badges, title scrim.
    // This is what makes a raw photo read as designed cover art.
    const brand = document.createElement("div");
    brand.className = "card-brand";
    brand.textContent = (CONFIG.brand || CONFIG.name).charAt(0);

    const scrim = document.createElement("div");
    scrim.className = "card-scrim";
    scrim.innerHTML =
      (title.tag ? `<span class="card-tag">${title.tag}</span>` : "") +
      `<div class="card-name">${title.name || ""}</div>`;

    card.append(img, shimmer, brand, scrim);

    if (title.top10) {
      const badge = document.createElement("div");
      badge.className = "card-top10";
      badge.innerHTML = `Top<b>10</b>`;
      card.appendChild(badge);
    }

    // Hover overlay: Netflix-style action row + meta line (only Play works).
    const overlay = document.createElement("div");
    overlay.className = "card-overlay";
    overlay.innerHTML = `
      <div class="overlay-title">${title.name || ""}</div>
      <div class="overlay-actions">
        <span class="card-icon play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
        </span>
        <span class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>
        </span>
        <span class="card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M2 10h4v11H2zm18.5 0H14l1-4.2c.2-1-.5-1.8-1.4-1.8-.6 0-1.1.3-1.4.8L8 11.5V21h10.6c.9 0 1.7-.6 1.9-1.5l1.4-6.6c.2-1.3-.7-2.4-1.4-2.9z"/></svg>
        </span>
        <button class="card-icon mute" aria-label="Toggle preview sound">
          <svg class="ic-vol" viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9zm13.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z"/></svg>
          <svg class="ic-mut" viewBox="0 0 24 24" width="13" height="13" hidden><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9zm14 .4L15.6 8 13 10.6 10.4 8 9 9.4 11.6 12 9 14.6 10.4 16 13 13.4 15.6 16 17 14.6 14.4 12z"/></svg>
        </button>
        <span class="card-icon expand" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M12 15.4L6.6 10 8 8.6l4 4 4-4 1.4 1.4z"/></svg>
        </span>
      </div>
      <div class="overlay-meta">
        <span class="match">${matchScore(title.id)}% Match</span>
        <span class="chip">U/A</span>
        <span class="chip">HD</span>
      </div>`;

    card.appendChild(overlay);

    // ---- Hover / preview handling -------------------------------
    let hoverTimer, previewVideo;

    const startPreview = () => {
      // Only one preview may sound at a time — stop whatever else is running.
      if (stopActivePreview && stopActivePreview !== stopPreview) stopActivePreview();
      stopActivePreview = stopPreview;

      previewVideo = document.createElement("video");
      previewVideo.loop = true;
      previewVideo.playsInline = true;
      previewVideo.setAttribute("playsinline", "");
      previewVideo.muted = previewMuted;
      previewVideo.volume = 0;              // faded up on play, so audio never pops

      if (title.previewType === "clip" && title.previewSrc) {
        // Standalone preview file.
        previewVideo.src = title.previewSrc;
      } else {
        // "segment": loop a slice of the master video.
        previewVideo.src = CONFIG.masterVideo;
        const start = title.previewStart || 0;
        const end = title.previewEnd || start + 8;
        previewVideo.addEventListener("loadedmetadata", () => { previewVideo.currentTime = start; });
        previewVideo.addEventListener("timeupdate", () => {
          if (previewVideo.currentTime >= end) previewVideo.currentTime = start;
        });
      }

      // Only reveal the video once it can actually play; if the file is
      // missing the card just stays on its poster instead of going black.
      previewVideo.addEventListener("canplay", () => card.classList.add("has-video"));
      previewVideo.addEventListener("error", () => {
        card.classList.remove("has-video");
        if (previewVideo) { previewVideo.remove(); previewVideo = null; }
      });

      card.appendChild(previewVideo);
      card.classList.add("previewing");
      if (isTouch) card.classList.add("touch");

      activePreview = previewVideo;
      // Try to play WITH sound. Browsers refuse unmuted autoplay unless the
      // page has user activation — if refused, fall back to a muted preview
      // rather than losing the preview entirely.
      previewVideo.play()
        .then(() => fadeInVolume(previewVideo))
        .catch(() => {
          previewMuted = true;
          syncMuteIcons();
          if (!previewVideo) return;
          previewVideo.muted = true;
          previewVideo.play().catch(() => {});
        });
    };

    const stopPreview = () => {
      clearTimeout(hoverTimer);
      card.classList.remove("previewing", "touch", "has-video");
      if (previewVideo) {
        if (activePreview === previewVideo) activePreview = null;
        clearInterval(previewVideo._fade);
        previewVideo.pause();
        previewVideo.remove();
        previewVideo = null;
      }
      if (stopActivePreview === stopPreview) stopActivePreview = null;
    };

    // Mute toggle lives on the card and must not open the player.
    const muteBtn = $(".card-icon.mute", overlay);
    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      previewMuted = !previewMuted;
      if (activePreview) {
        activePreview.muted = previewMuted;
        if (!previewMuted) fadeInVolume(activePreview);
      }
      syncMuteIcons();
    });

    if (isTouch) {
      // Mobile: first tap = preview, second tap (while previewing) = open.
      card.addEventListener("click", (e) => {
        // If the play icon was tapped, always open.
        if (e.target.closest(".card-icon.play") || card.classList.contains("previewing")) {
          stopPreview();
          openPlayer(title);
        } else {
          $$(".card.previewing").forEach((c) => c !== card && c.dispatchEvent(new Event("_stop")));
          startPreview();
        }
      });
      card.addEventListener("_stop", stopPreview);
    } else {
      // Desktop: hover delay ~500ms to preview.
      card.addEventListener("mouseenter", () => {
        hoverTimer = setTimeout(startPreview, 500);
      });
      card.addEventListener("mouseleave", stopPreview);
      card.addEventListener("click", () => { stopPreview(); openPlayer(title); });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPlayer(title); }
      });
    }

    return card;
  }

  function enterBrowse() {
    buildBrowse();
    showScreen("screen-browse");
    window.scrollTo(0, 0);
  }

  /* ==================================================================
     SCREEN 4 — PLAYER  (single master video, seek to chapter)
  ================================================================== */
  const player   = $("#player");
  const video    = $("#playerVideo");
  const controls = $("#playerControls");
  let uiTimer;

  function openPlayer(title) {
    // Attach master video once; seek to this title's chapter start.
    if (!video.src) video.src = CONFIG.masterVideo;

    $("#playerHeading").textContent = title.name;
    $("#playerNameSmall").textContent = title.name;

    player.classList.add("open", "buffering");
    player.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const seekAndPlay = () => {
      const start = title.playStart || 0;
      try { video.currentTime = start; } catch (_) {}
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) seekAndPlay();
    else video.addEventListener("loadedmetadata", seekAndPlay, { once: true });

    showControls();
  }

  function closePlayer() {
    video.pause();
    player.classList.remove("open", "hide-ui", "hide-cursor", "buffering");
    player.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    clearTimeout(uiTimer);
  }

  /* ---- Controls: play/pause, time, scrubber, volume, fullscreen --- */
  const playPauseBtn = $("#btnPlayPause");
  const iconPlay  = $(".icon-play", playPauseBtn);
  const iconPause = $(".icon-pause", playPauseBtn);

  function syncPlayIcon() {
    const paused = video.paused;
    iconPlay.hidden = !paused;
    iconPause.hidden = paused;
  }
  function togglePlay() { video.paused ? video.play().catch(() => {}) : video.pause(); }

  playPauseBtn.addEventListener("click", togglePlay);
  video.addEventListener("play", syncPlayIcon);
  video.addEventListener("pause", syncPlayIcon);
  video.addEventListener("click", togglePlay);
  video.addEventListener("waiting", () => player.classList.add("buffering"));
  video.addEventListener("playing", () => player.classList.remove("buffering"));
  video.addEventListener("canplay", () => player.classList.remove("buffering"));

  // Time + scrubber
  const filled   = $("#scrubFilled");
  const buffered = $("#scrubBuffered");
  const knob     = $("#scrubKnob");
  const timeLbl  = $("#timeLabel");

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  video.addEventListener("timeupdate", () => {
    const pct = (video.currentTime / video.duration) * 100 || 0;
    filled.style.width = pct + "%";
    knob.style.left = pct + "%";
    timeLbl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
  });
  video.addEventListener("progress", () => {
    if (video.buffered.length) {
      const end = video.buffered.end(video.buffered.length - 1);
      buffered.style.width = (end / video.duration) * 100 + "%";
    }
  });

  const scrubber = $("#scrubber");
  const seekFromEvent = (e) => {
    const rect = scrubber.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pct = Math.min(Math.max(x / rect.width, 0), 1);
    if (isFinite(video.duration)) video.currentTime = pct * video.duration;
  };
  let scrubbing = false;
  scrubber.addEventListener("mousedown", (e) => { scrubbing = true; seekFromEvent(e); });
  window.addEventListener("mousemove", (e) => { if (scrubbing) seekFromEvent(e); });
  window.addEventListener("mouseup", () => { scrubbing = false; });
  scrubber.addEventListener("click", seekFromEvent);
  scrubber.addEventListener("touchstart", (e) => { seekFromEvent(e); }, { passive: true });
  scrubber.addEventListener("touchmove", (e) => { seekFromEvent(e); }, { passive: true });

  // Volume / mute
  const muteBtn  = $("#btnMute");
  const iconVol   = $(".icon-vol", muteBtn);
  const iconMuted = $(".icon-muted", muteBtn);
  const volSlider = $("#volumeSlider");

  function syncMuteIcon() {
    const off = video.muted || video.volume === 0;
    iconVol.hidden = off;
    iconMuted.hidden = !off;
  }
  muteBtn.addEventListener("click", () => { video.muted = !video.muted; syncMuteIcon(); });
  volSlider.addEventListener("input", () => {
    video.volume = parseFloat(volSlider.value);
    video.muted = video.volume === 0;
    syncMuteIcon();
  });
  video.addEventListener("volumechange", () => {
    volSlider.value = video.muted ? 0 : video.volume;
    syncMuteIcon();
  });

  // Fullscreen
  $("#btnFullscreen").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else (player.requestFullscreen || player.webkitRequestFullscreen)?.call(player);
  });

  $("#playerClose").addEventListener("click", closePlayer);

  /* ---- Auto-hide controls on idle --------------------------------- */
  function showControls() {
    player.classList.remove("hide-ui", "hide-cursor");
    clearTimeout(uiTimer);
    uiTimer = setTimeout(() => {
      if (!video.paused) player.classList.add("hide-ui", "hide-cursor");
    }, 3000);
  }
  player.addEventListener("mousemove", showControls);
  player.addEventListener("touchstart", showControls, { passive: true });

  /* ---- Keyboard shortcuts (player only) --------------------------- */
  document.addEventListener("keydown", (e) => {
    if (!player.classList.contains("open")) return;
    switch (e.key) {
      case " ": case "k":  e.preventDefault(); togglePlay(); showControls(); break;
      case "Escape":        closePlayer(); break;
      case "ArrowRight":    video.currentTime = Math.min(video.currentTime + 5, video.duration || 0); showControls(); break;
      case "ArrowLeft":     video.currentTime = Math.max(video.currentTime - 5, 0); showControls(); break;
      case "ArrowUp":       e.preventDefault(); video.volume = Math.min(video.volume + 0.1, 1); video.muted = false; showControls(); break;
      case "ArrowDown":     e.preventDefault(); video.volume = Math.max(video.volume - 0.1, 0); showControls(); break;
      case "m":             video.muted = !video.muted; syncMuteIcon(); showControls(); break;
      case "f":             $("#btnFullscreen").click(); break;
    }
  });

  /* ==================================================================
     BOOT
  ================================================================== */
  window.addEventListener("DOMContentLoaded", runIntro);
})();
