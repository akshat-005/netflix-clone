/* =====================================================================
   CONFIG — EDIT THIS FILE ONLY (no need to touch app.js)
   =====================================================================
   This is the one place you customise the whole experience:
   the birthday person's name, the hero banner, the profiles, and
   every title card + its hover-preview + its chapter timestamp.
   Drop your real files into the /assets folders (see README.md) and
   update the filenames / timestamps below.
===================================================================== */

const CONFIG = {
  /* ---- Branding --------------------------------------------------- */
  brand: "ARFLIX",                     // the Netflix-style wordmark (intro splash + nav logo)
  name:  "ARCHI",                      // the person (used in hero + her profile)

  /* ---- Global asset paths ----------------------------------------- */
  introSound:   "assets/intro-sound.mp3",     // optional splash "thud" (safe if missing/blocked)
  profilePhoto: "assets/profile-photo.jpg",   // her avatar (profiles screen + nav)
  masterVideo:  "assets/master-video.mp4",    // the ONE long video every title jumps into

  /* ---- Intro timing (ms) ------------------------------------------ */
  introDurationMs: 3300,               // how long the splash lasts before the profile screen (A → beams → ARFLIX)

  /* ---- Hover previews --------------------------------------------- */
  previewSound:  true,                 // play hover previews WITH audio (mute toggle sits on the card)
  previewVolume: 0.6,                  // 0..1 — previews fade up to this level

  /* ---- Hero banner (top of the Browse screen) --------------------- */
  hero: {
    title:     "Happy Anniversary",       // big hero title
    blurb:     "My love, my gudda, my cupcake, my cuttieee, my Archi <3. Our memories, together and forever.",
    backdrop:  "assets/posters/dates-1.jpg", // big background image (use a wide/landscape one)
    playStart: 0                       // seconds into master-video.mp4 the Play button starts at
  },

  /* ---- Profiles ("Who's watching?") ------------------------------- */
  /* The first one (isMain:true) opens the site. The rest are jokes. */
  profiles: [
    { name: "Archi",  photo: "assets/profile-photo.jpg", isMain: true },
    { name: "Guest",  color: "#5b8def", easterEgg: "Nice try 😏 This one's private." },
    { name: "Kids",   color: "#e6b800", easterEgg: "Not yet, abhi time hai isme ;)" },
    { name: "Life",     color: "#7a7a7a", easterEgg: "Itni jaldi kya hai, one day at a time gudda :))" }
  ]
};

/* =====================================================================
   TITLES — one object per card. Add/remove freely.
   ---------------------------------------------------------------------
   previewType: "clip"    -> hover plays its own file (previewSrc)
   previewType: "segment" -> hover plays a slice of master-video.mp4
                             (loops between previewStart and previewEnd)
   playStart: seconds into master-video.mp4 where this "chapter" opens

   Optional flair (purely cosmetic, adds to the "real Netflix" look):
   top10: true            -> shows the red TOP 10 badge on the card
   tag:   "New Episode"   -> small red ribbon above the card title
===================================================================== */

const titles = [
  {
    id: "title-01",
    name: "Before We Met",
    poster: "assets/posters/before-we-met.jpg",
    tag: "Recently Added",
    previewType: "clip",
    previewSrc: "assets/previews/video1.mp4",
    playStart: 10
  },
  {
    id: "title-02",
    name: "Almost Met Each Other",
    poster: "assets/posters/almost-met.jpg",
    previewType: "clip",
    previewSrc: "assets/previews/almost-met.mp4",
    playStart: 10
  },
  {
    id: "title-03",
    name: "The Crush",
    poster: "assets/posters/the-crush.jpg",
    previewType: "clip",
    previewSrc: "assets/previews/crush.mp4",
    playStart: 10
  },
  {
    id: "title-04",
    name: "Just Us",
    poster: "assets/posters/just-us.jpg",
    top10: true,
    previewType: "clip",
    previewSrc: "assets/previews/just-us.mp4",
    playStart: 10
  },
  {
    id: "title-05",
    name: "More of Us",
    poster: "assets/posters/more-just-us.jpg",
    previewType: "clip",
    previewSrc: "assets/previews/more-us.mp4",
    playStart: 120
  },
  {
    id: "title-06",
    name: "Having Fun Together",
    poster: "assets/posters/having-fun.jpg",
    previewType: "clip",
    previewSrc: "assets/previews/having-fun.mp4",
    playStart: 10
  },
  {
    id: "title-07",
    name: "Virtual Moments",
    poster: "assets/posters/virtual-moments.jpeg",
    previewType: "clip",
    previewSrc: "assets/previews/virtual-movie.mp4",
    playStart: 10
  },
  {
    id: "title-08",
    name: "Saath Saath",
    poster: "assets/posters/dates-2.jpg",
    previewType: "clip",
    previewSrc: "assets/previews/saath-saath.mp4",
    playStart: 10
  },
  {
    id: "title-09",
    name: "My beautiful",
    poster: "assets/posters/beautiful.jpg",
    previewType: "clip",
    previewSrc: "assets/previews/beautiful.mp4",
    playStart: 10
  },
  {
    id: "title-10",
    name: "The Prettiest Girl",
    poster: "assets/posters/prettiest.jpg",
    top10: true,
    previewType: "clip",
    previewSrc: "assets/previews/prettiest-girl.mp4",
    playStart: 10
  },
  {
    id: "title-11",
    name: "My Favourite Person",
    poster: "assets/posters/fav-person.jpg",
    previewType: "segment",
    previewStart: 180,
    previewEnd: 188,
    playStart: 180
  }
];

/* =====================================================================
   ROWS — group titles into Netflix-style horizontal rows.
   Reference titles by their id above. A title can appear in many rows.
===================================================================== */

const rows = [
  { title: "Moments",            titleIds: ["title-01", "title-02", "title-03", "title-04", "title-07"] },
  { title: "Dates",          titleIds: ["title-06", "title-05", "title-08", "title-03"] },
  { title: "Because You're Iconic", titleIds: ["title-10", "title-09", "title-11", "title-01", "title-02"] }
];
