# ChronoShift

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&style=flat-square)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-12.16-FFCA28?logo=firebase&style=flat-square)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](/LICENSE)

A high-performance, developer-centric timezone and meeting planner SaaS built for distributed teams. Stop performing mental math to coordinate cross-border projects. ChronoShift calculates dynamic team availability heatmaps and meeting overlap scores while respecting localized Daylight Saving Time (DST) shifts.

---

## Key Features

- 📅 **24-Hour Lane-Based Timeline Planner**: Click-to-adjust, horizontal 24-hour schedules mapping custom teammates' working, personal, and sleeping periods with an automated overlap scoring algorithm (0–100%).
- 👥 **Multi-Tenant Workspaces**: Create and manage distinct team workspaces with granular roles (`Owner`, `Admin`, `Contributor`), email invitations, and join links.
- 🔐 **Firebase Authentication & Real-Time Sync**: Secure user signup/login (Email/Password & Google Sign-In) powered by Firebase Auth and real-time Cloud Firestore synchronization.
- ⚡ **DST-Aware Calculations**: Utilizes browser `Intl` APIs to dynamically retrieve target timezone offsets, fully preventing scheduling shifts on future dates.
- 🔗 **Instant Calendar Sync**: Generate ready-to-go Google Calendar, Outlook Web, and offline RFC-5545 `.ics` event files on any target planning date.
- 🔍 **Raycast-Style Command Palette**: Fully keyboard-accessible search overlay (`⌘K` or `Ctrl+K`) for searching 150+ global cities, toggling themes, optimizing overlap, and resetting views.
- 📊 **Dashboard & Activity Logs**: Real-time overview of current team availability, quick meeting scheduler, and coordinate history logs.
- ⚙️ **Customized Profiles & Preferences**: Configurable work shifts, lunch breaks, weekend days, preferred calendar providers, and 12h/24h clock formats.

---

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **Notifications**: React Hot Toast
- **Charts & Visualizations**: Recharts

---

## Directory Architecture

```text
├── LICENSE
├── README.md
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── firestore.rules               # Cloud Firestore security rules
├── firebase-blueprint.json       # Firestore schema & entity definitions
├── firebase-applet-config.json   # Firebase configuration
└── src
    ├── App.jsx                   # Root layout orchestrator, routing, and modals
    ├── index.css                 # Global theme definitions, scrollbars, resets
    ├── main.jsx                  # React DOM entry point
    ├── components
    │   ├── LandingPage.jsx       # Public landing page with live demo & FAQs
    │   ├── AuthModal.jsx         # Sign in & registration modal
    │   ├── Onboarding.jsx        # First-time user profile & shift setup
    │   ├── Dashboard.jsx         # Live team availability, quick scheduler & invites
    │   ├── TimelinePlanner.jsx   # 24-hour visual schedule & calendar exporters
    │   ├── TeamView.jsx          # Workspace members, role management & invite links
    │   ├── HistoryView.jsx       # Meeting coordinate logs & details
    │   ├── SettingsView.jsx      # Profile, workspace, & schedule preferences
    │   └── CommandPalette.jsx    # Raycast-style search overlay (Cmd+K)
    └── lib
        ├── firebase.js           # Firebase app initialization & auth provider
        ├── store.js              # Global SaaS state hook (useSaaSStore) & Firestore sync
        ├── engine.js             # DST-aware availability calculator & overlap scoring
        ├── calendar.js           # RFC-5545 .ics & web calendar URL builders
        └── cities.js             # 150+ worldwide cities database & search index
```

---

## Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed on your machine.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Blue-kaiCodes/ChronoShift.git
   cd ChronoShift
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## License

This project is licensed under the [MIT License](/LICENSE).
