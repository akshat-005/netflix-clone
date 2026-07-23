# 🎬 Netflix-Style Birthday Website

A single-page, static site that feels exactly like opening Netflix — but every title is a memory of the birthday person. No backend, deploy anywhere.

## Quick start

1. Open `index.html` directly in a browser to preview.
   - Video previews/players work best when served over HTTP. Run a tiny server:
     ```bash
     # from this folder
     python -m http.server 8000
     # then open http://localhost:8000
     ```
2. Edit **`js/config.js`** — that's the only file you need to touch.
3. Drop your files into `assets/` (see below).

## What to edit (all in `js/config.js`)

- `CONFIG.name` — her name (shows in the intro splash + nav logo).
- `CONFIG.hero` — the big banner title, blurb, background image, and where Play starts.
- `CONFIG.profiles` — the main profile (opens the site) + joke profiles with easter-egg messages.
- `titles[]` — one entry per card. Each card has a poster, a hover preview, and a chapter timestamp.
- `rows[]` — group titles into horizontal rows by their `id`.

### Title options
| Field | Meaning |
|---|---|
| `poster` | thumbnail image for the card |
| `previewType: "clip"` | hover plays its own file → set `previewSrc` |
| `previewType: "segment"` | hover plays a slice of `master-video.mp4` → set `previewStart` / `previewEnd` (seconds) |
| `playStart` | seconds into `master-video.mp4` where this "chapter" opens in the player |

## Assets to drop in

```
assets/
├── master-video.mp4        # the ONE long video every title jumps into
├── profile-photo.jpg       # her avatar (profiles + nav)
├── intro-sound.mp3         # optional splash "thud"
├── posters/
│   └── poster-01.jpg ...    # one per title card
└── previews/
    └── preview-02.mp4 ...   # only for titles using previewType:"clip"
```

Missing files degrade gracefully (cards stay dark, sound is skipped) so you can add assets one at a time.

## The "one video, many chapters" trick
Every title opens the same `master-video.mp4` and seeks to its `playStart`. If seeking within one long file gives you trouble, split into per-chapter files and point each title at its own file instead (set that file as `masterVideo` per-open — ask if you want this variant wired up).

## Deploy
Push to **Vercel**, **Netlify**, or **GitHub Pages** — it's a plain static site, no build step.

## Features
- Netflix-style intro reveal, "Who's watching?" profiles, hero banner, hover-preview rows.
- Custom full-screen player (scrubber, volume, fullscreen, auto-hiding controls).
- Keyboard: `space`/`k` play, `←`/`→` seek, `↑`/`↓` volume, `m` mute, `f` fullscreen, `Esc` close.
- Fully responsive; mobile uses tap-to-preview, tap-again-to-play.
