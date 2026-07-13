# ChronoShift

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&style=flat-square)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](/LICENSE)

A high-performance, developer-centric timezone and meeting planner built for distributed teams. Stop performing mental math to coordinate cross-border projects. ChronoShift calculates dynamic team availability heatmaps and geographic coordinate alignments while respecting localized Daylight Saving Time (DST) shifts.

---

## Key Features

- 🌍 **Geographic Overlap Map**: A minimalist custom vector world map plotting teammates based on precise coordinate projections with real-time daylight status tracking.
- 📅 **Lane-Based Timeline Planner**: Click-to-adjust, horizontal 24-hour schedules mapping custom teammates' working, personal, and sleeping periods.
- ⚙️ **Localized Shifts**: Custom work-start and work-end hour configurations per teammate to fit flexible remote working hours.
- 🔍 **Raycast-Style Command Palette**: Fully keyboard-accessible search overlay (`⌘K` or `Ctrl+K`) for finding cities, toggling themes, adding nodes, or switching views.
- 🔗 **Instant Calendar Sync**: Generate ready-to-go Google Calendar, Outlook Web, and offline `.ics` event files on any target planning date.
- ⚡ **DST-Aware Calculations**: Utilizes browser `Intl` APIs to dynamically retrieve target timezone offsets, fully preventing scheduling shifts on future dates.

---

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## Directory Architecture

```text
├── LICENSE
├── README.md
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── src
    ├── App.jsx                   # Primary layout orchestrator & keyboard routing
    ├── index.css                 # Global theme definitions and resets
    ├── main.jsx                  # React DOM entry point
    ├── components
    │   ├── Sidebar.jsx           # Monochrome navigation panel & shortcut guides
    │   ├── TimelinePlanner.jsx   # Interactive 24-hour overlap planner & exporters
    │   ├── WorldMap.jsx          # Custom SVG world outline and teammate pins
    │   ├── TeammateGrid.jsx      # Teammate parameters & work-hour editors
    │   └── CommandPalette.jsx    # Raycast-style search overlay (Cmd+K)
    └── lib
        ├── cities.js             # 150+ worldwide cities database & fuzzy index
        ├── engine.js             # DST-aware availability calculator
        └── calendar.js           # RFC-5545 .ics & web calendar URL builders
```

---

## Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. Clone the repository:
   ```bash
   git clone https://github.com/Blue-kaiCodes/ChronoShift.git
   cd ChronoShift
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Fire up the development environment:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## Developer Roadmap

- [ ] **Saved Team Workspaces**: Support multiple separate team groups stored in distinct local namespaces.
- [ ] **Slack & Discord Webhook Integration**: Trigger Slack schedule reports or meeting coordinate notifications directly from the UI.
- [ ] **Holiday API Synchronization**: Highlight dynamic national holiday overlaps to warning users about localized teammate absences.

---

## Contributing

We welcome additions, bug fixes, and feature requests. To contribute:
1. Fork the repository.
2. Create a clean feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes with meaningful commit lines.
4. Open a Pull Request targeting `main`.

---

## License

This project is licensed under the [MIT License](/LICENSE).
