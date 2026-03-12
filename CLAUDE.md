# CLAUDE.md

## Project Overview

**widget-vuelos-bolivia** is an iOS widget for displaying real-time flight departures from Bolivian airports, built for the [Scriptable](https://scriptable.app/) app. It fetches live data from NAABOL (Bolivian airport operator) APIs and renders a compact departure board.

A secondary feature provides USD/BOB exchange rates via a Cloudflare serverless function.

## Repository Structure

```
widget-vuelos-bolivia/
├── widget-vuelos-naabol.js   # Main widget script (Scriptable API)
├── loader-scriptable.js      # Auto-updating loader with iCloud cache
├── index.html                # Simple HTML page for exchange rate display
├── functions/
│   └── exchange.js           # Cloudflare Function for USD/BOB rates
└── README.md                 # User-facing docs (Spanish)
```

## Tech Stack

- **Runtime**: Scriptable app (iOS) — not Node.js
- **Language**: JavaScript (ES6+), using Scriptable global APIs (`ListWidget`, `Request`, `FileManager`, etc.)
- **Serverless**: Cloudflare Functions (`functions/exchange.js`)
- **No build process** — single-file scripts deployed directly via GitHub

## Key Architecture

### Widget (`widget-vuelos-naabol.js`)

1. Fetches flight data from two NAABOL endpoints (Itinerario + Operativo)
2. Merges scheduled and actual flight info by airline code + flight number
3. Filters to a 12-hour window, max 10 flights (`HOURS_AHEAD`, `MAX_FLIGHTS`)
4. Renders a 5-column table: PROG | REAL | VUELO | EST | DST

**Parametrized by airport code** via `args.widgetParameter` (default: `VVI`). Supported airports: VVI, LPB, CBB, TJA, SRE, ORU, UYU, CIJ, RIB, RBQ, TDD, GYA.

### Loader (`loader-scriptable.js`)

Auto-fetches the latest widget from the GitHub API, caches locally in iCloud for offline use, and evaluates dynamically.

### Exchange (`functions/exchange.js`)

Serverless endpoint returning USD buy/sell rates from dolarboliviahoy.com. Cache: 300s.

## Code Conventions

- **Constants**: `SCREAMING_SNAKE_CASE` (`HOURS_AHEAD`, `MAX_FLIGHTS`, `AIRPORT_PARAM`)
- **Functions/variables**: `camelCase`
- **UI text/docs**: Spanish; code identifiers: English
- **Data processing**: Array `map`/`filter` chains, early returns for invalid data
- **Error handling**: Silent failures on API errors (returns `[]`), fallback defaults with `||`
- **Colors**: `Color.dynamic()` for light/dark mode support, hex values with RGB mappings

## Flight Status Codes

| Code | Meaning       | Color      |
|------|---------------|------------|
| PRE  | Pre-boarding  | Blue       |
| EMB  | Boarding      | Green      |
| DEM  | Delayed       | Red text   |
| CAN  | Canceled      | Red bg     |
| OK   | Normal        | Default    |

Active statuses (PRE/EMB/DEM) are always shown, even past scheduled time.

## Development Notes

- **No package.json, no npm dependencies, no bundler** — standalone Scriptable scripts
- **No test framework** — manual testing via Scriptable app
- **Deployment**: Push to `main` branch; the loader auto-fetches updates from GitHub
- Scriptable widgets are stateless — each execution fetches fresh data
- Flights crossing midnight are handled with next-day date correction

## Key Functions in `widget-vuelos-naabol.js`

| Function | Purpose |
|----------|---------|
| `normalizeHHMM(x)` | Parse time strings to HH:MM format |
| `todayWithHHMM(x)` | Convert time to Date, handling next-day flights |
| `airlineCode(name)` | Map airline names to IATA codes |
| `destinationIATA(route)` | Extract first destination from route |
| `statusInfo(obs)` | Normalize flight status text |
| `load(url)` | Fetch JSON with error handling |

## When Modifying This Code

- The Scriptable API is **not** standard browser or Node.js — do not use `document`, `window`, `require`, or `module.exports` in the widget files
- Test changes in the Scriptable app on iOS; there is no local emulator
- Keep the widget script self-contained (single file, no imports)
- Respect the dense table layout — screen real estate is extremely limited on iOS widgets
- Airport/airline lookup dictionaries are inline; add new entries directly to the objects
