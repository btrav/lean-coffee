# lean-coffee

A structured meeting facilitator for [Lean Coffee](https://leancoffee.org/) sessions. Open it on a shared screen, no sign-up required.

**[Live demo →](https://btrav.github.io/lean-coffee/)**

---

## What it does

Lean Coffee is a meeting format where participants propose topics, vote on what to discuss, and timebox each item. This tool runs the whole session from one browser tab — brainstorm, vote, discuss, export — without accounts, a backend, or anything to install.

## Phases

**1. Brainstorm** — anyone at the table calls out topics; the facilitator types them in. Participants are tracked by name for the export.

**2. Vote** — each participant gets a fixed number of votes to spread across topics however they want. Topics auto-rank by vote count.

**3. Discuss** — topics play out in ranked order, each with a countdown timer. Extend time by 1 minute with one click. Key takeaways are auto-saved as you type.

**4. Export** — a full session summary shows discussed topics, takeaways, time spent, and any topics that didn't make the cut. Copy as markdown or download as a `.md` file.

Sessions survive a page refresh — localStorage keeps everything intact until you start a new session.

## What's included

- Configurable votes-per-person before voting starts
- Per-topic discussion timer with 1-minute extension
- Phase-level timer visible throughout the session
- Auto-saving takeaways (every 2 seconds, only on change)
- Confirmation dialogs before advancing between phases
- Markdown export with stats, takeaways, and participant list
- Keyboard and screen reader accessible phase transitions

## Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for builds
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons
- [GitHub Pages](https://pages.github.com/) for hosting, via GitHub Actions

## Why

I kept reaching for sticky notes or a shared doc to run Lean Coffee at work. The multi-user tools required everyone to sign in or sync on a separate device. This is just a URL on the projector — the facilitator drives it, everyone else participates verbally. No friction.

## Run it locally

```bash
npm install
npm run dev
```
