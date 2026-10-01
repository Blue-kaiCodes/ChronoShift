# ChronoShift — Distributed Team Timezone Intelligence Platform

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&style=flat-square)](https://vite.dev)
[![Vitest](https://img.shields.io/badge/Vitest-2.1.0-729B1B?logo=vitest&style=flat-square)](https://vitest.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-12.16-FFCA28?logo=firebase&style=flat-square)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](/LICENSE)

A high-performance, technically credible timezone intelligence and meeting coordination platform purpose-built for globally distributed engineering, product, and operations teams. 

ChronoShift eliminates timezone math errors, coordinates multi-region overlap windows, prevents scheduling across Daylight Saving Time (DST) cliffs, and automatically tracks national holidays across 150+ global technology hubs.

---

## Technical Highlights & Architecture

### 1. Mathematical Timezone & DST Intelligence Engine (`src/lib/engine.js`)
- **Native Standard IANA Resolution**: Calculates exact UTC offsets (including fractional offsets such as India `UTC+5:30` and Nepal `UTC+5:45`) dynamically using browser-native `Intl.DateTimeFormat` APIs.
- **Proactive DST Transition Scanning**: Probes upcoming Daylight Saving Time transitions up to 180 days into the future. Flags upcoming shifts within 14 days directly in the Timeline Planner to prevent missed cross-border syncs.
- **Duration-Aware Continuous Slot Scoring (`findMeetingSlots`)**: Evaluates meeting feasibility continuously across durations from 15 to 120 minutes. A slot is only scored high if all sampled points across the entire duration fit comfortably within teammate working windows.
- **Overnight Wrap-Around Shift Support**: Fully supports non-standard and night shifts (e.g. `22:00` to `06:00` crossing midnight), ensuring night-shift operators, on-call responders, and offshore teams are modeled with mathematical precision.
- **Equirectangular Solar Terminator Math**: Computes the exact astronomical solar day/night terminator boundary curve mapped synchronously as the user scrubs across the 24-hour visualizer.

### 2. Live Public Holiday Service (`src/lib/holidayService.js` & `src/lib/holidays.js`)
- **Real Public API Integration**: Queries the official [Nager.Date](https://date.nager.at/) REST API (`https://date.nager.at/api/v3/PublicHolidays/{year}/{code}`) for real-time, official country holiday registries.
- **Resilient Multi-Tier Caching**: Caches fetched holiday calendars in memory and `localStorage` with a 7-day TTL to guarantee zero latency on repeated queries and timeline scrubs.
- **Zero-Network Offline Fallbacks**: Pre-compiled verified national holiday calendars for key regions (US, GB, IN, DE, JP, AU, CA) ensure instant offline reliability.
- **Customizable Weekend Schemes**: Supports custom weekend days (e.g., Friday & Saturday in the Middle East) to prevent accidental scheduling on team rest days.

### 3. Authoritative 150+ Global Cities Database (`src/lib/cities.js`)
- Verified directory of 150+ technology hubs across North America, Europe, Asia, Latin America, the Middle East, Africa, and Oceania.
- Each entry contains verified latitude, longitude, ISO 3166-1 alpha-2 country code, official IANA timezone identifier, and colloquial aliases (`NYC`, `SF`, `Bombay`, `Bengaluru`, `DC`, `Joburg`, etc.).
- Fuzzy ranking algorithm scores exact matches, prefix matches, and aliases ahead of substring queries.

### 4. RFC 5545 iCalendar & Web Dispatch Hub (`src/lib/calendar.js`)
- **Strict RFC 5545 Compliance**: Generates complete `.ics` documents with proper character escaping (`\,`, `\;`, `\\`, `\n`), stable UID generation, RFC attendee parameters, and 15-minute alarm triggers (`VALARM`).
- **Universal Web Calendar Dispatch**: Instant one-click web scheduling links for Google Calendar, Outlook Web, Office 365, and Yahoo Calendar without requiring OAuth token exchanges.

### 5. Developer Multi-Format Share Hub (`src/components/ShareModal.jsx`)
- **Discord Dynamic Timestamps**: `<t:TIMESTAMP:F> (<t:TIMESTAMP:R>)` that automatically render in each viewer's local device clock in Discord channels.
- **Slack mrkdwn**: Cleanly formatted meeting briefing with participant local times and status emojis.
- **Markdown Tables**: Structured tables designed for immediate pasting into GitHub PRs, issues, or Notion agendas.
- **Deep-Link State Preservation**: Encodes date, hour, duration, and reference timezone in URL parameters for zero-friction sharing.

---

## Directory Architecture

```text
├── .env.example                  # Environment configuration template
├── LICENSE                       # MIT License
├── README.md                     # Technical architecture & product documentation
├── index.html                    # Single-page application entry HTML
├── package.json                  # Dependencies, test scripts, and build configuration
├── tailwind.config.js            # Tailwind CSS design system configuration
├── vite.config.js                # Vite build and Vitest configuration
├── firestore.rules               # Production-grade Firestore security rules
└── src
    ├── App.jsx                   # Application orchestrator, routing, and global hotkeys
    ├── index.css                 # Global theme definitions and design primitives
    ├── main.jsx                  # React DOM entry point
    ├── components
    │   ├── LandingPage.jsx       # Public landing page with live interactive preview
    │   ├── AuthModal.jsx         # Firebase email & Google authentication
    │   ├── Onboarding.jsx        # Initial user profile and schedule setup
    │   ├── Dashboard.jsx         # Live availability dashboard & overlap suggestions
    │   ├── TimelinePlanner.jsx   # 24-hour visual schedule, duration controls & DST alerts
    │   ├── WorldMap.jsx          # Vector world map with solar terminator & teammate pins
    │   ├── ShareModal.jsx        # Multi-format developer share hub
    │   ├── ShortcutsModal.jsx    # Keyboard shortcuts guide (?)
    │   ├── TeamView.jsx          # Teammate roster management & schedule editor
    │   ├── HistoryView.jsx       # Synchronized meeting log history
    │   ├── SettingsView.jsx      # User profile, preferences & workspace configuration
    │   └── CommandPalette.jsx    # Spotlight search overlay (Cmd+K)
    └── lib
        ├── __tests__/            # Automated test suite (100% Vitest coverage)
        │   ├── calendar.test.js  # RFC 5545 calendar & URL generation tests
        │   ├── cities.test.js    # 150+ city database integrity & search tests
        │   ├── engine.test.js    # Timezone offset, DST, and slot optimizer tests
        │   └── holidays.test.js  # Public holiday cache & weekend detection tests
        ├── calendar.js           # RFC 5545 .ics generator & calendar dispatch URLs
        ├── cities.js             # 150+ verified city database & fuzzy search
        ├── engine.js             # Core availability, DST, and timeline calculation engine
        ├── firebase.js           # Firebase app initialization & auth configuration
        ├── holidays.js           # Synchronous holiday wrapper & weekend detection
        ├── holidayService.js     # Live Nager.Date API client & offline database
        └── store.js              # State management hook (useSaaSStore) & Firestore sync
```

---

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Blue-kaiCodes/ChronoShift.git
   cd ChronoShift
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for Cloud Sync)**:
   ```bash
   cp .env.example .env
   ```
   ChronoShift operates automatically in **Developer Mode** out of the box with zero external configuration required. To connect your own Firebase project for cloud sync, provide the credentials in `.env`.

4. **Launch development server**:
   ```bash
   npm run dev
   ```

---

## Testing & Quality Assurance

ChronoShift includes a comprehensive unit and integration test suite powered by [Vitest](https://vitest.dev/).

Run all tests:
```bash
npm test
```

### Test Coverage Highlights:
- **Timezone Math**: Exact integer and fractional offsets (UTC, New York, London, Tokyo, Kolkata, Kathmandu).
- **Daylight Saving Time**: Accurate DST observation detection and upcoming shift scanning within 180-day horizons.
- **Overnight Shifts**: Verified wrap-around evaluation across midnight (e.g. 22:00 to 06:00).
- **Duration Overlap**: Continuous interval sampling for 15m, 30m, 45m, 60m, 90m, and 120m meetings.
- **City Database**: Coordinates bounds validation, IANA timezone parsing via `Intl`, and colloquial alias resolution.
- **Calendar Compliance**: Character escaping per RFC 5545 and valid URL formatting for all major calendar services.

---

## Production Build

To compile a production-ready bundle:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## Power-User Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| `⌘K` / `Ctrl+K` | Open Command Palette (Spotlight Search) |
| `G` | Snap timeline to optimal Golden Hour overlap |
| `T` | Reset timeline date and view to Today |
| `←` / `→` | Step date backward / forward by 1 day |
| `?` | Toggle keyboard shortcuts modal |
| `Alt+1` .. `Alt+5` | Quick-switch views (Dashboard, Planner, Team, History, Settings) |

---

## Data Provenance & Standards Disclosure

- **Timezone Calculations**: Native ECMAScript `Intl.DateTimeFormat` compliant with the standard IANA Time Zone Database (TZDB).
- **Public Holidays**: Live queries via [Nager.Date](https://date.nager.at/) REST API with offline fallbacks.
- **Calendar Formats**: [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545) Internet Calendaring and Scheduling Core Object Specification.
- **Geographic Geometry**: Natural Earth 110m resolution equirectangular vector projection.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
