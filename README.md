# TraceLens — Cyber Incident Autopsy Dashboard

> A professional SOC-style cybersecurity incident investigation dashboard that transforms raw incident descriptions into interactive attack timelines.

![TraceLens Dashboard](https://img.shields.io/badge/TraceLens-SOC%20Dashboard-blue?style=for-the-badge&logo=shield)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-EF4444?style=flat)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂 **Incident Navigation Panel** | Browse & search incidents with severity badges, status tags, and analyst info |
| 📊 **Severity Indicator** | Animated threat-level meter with incident metadata and affected systems |
| ⚔️ **MITRE ATT&CK Kill Chain** | Visual attack stage progress bar mapping events to MITRE tactics |
| 📅 **Interactive Attack Timeline** | Expandable event cards with IOC indicators, stage labels, and MITRE technique refs |
| 📚 **Education Panel** | Collapsible explanations of attack techniques with curated references |
| 🛡 **Response Playbook** | Three-phase (Immediate / Short-Term / Long-Term) checklist with progress tracking |
| 📱 **Mobile Responsive** | Slide-in hamburger nav for mobile with full functionality |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/Ojas37/tracelens-cyber-incident-autopsy.git
cd tracelens-cyber-incident-autopsy
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗 Tech Stack

- **React 18** + **TypeScript** — Component architecture
- **Vite** — Lightning-fast build tool
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Smooth animations & transitions
- **Lucide React** — Crisp SVG icons

---

## 📁 Project Structure

```
src/
├── data/
│   └── incidents.ts          # Sample incidents with full timeline data
├── components/
│   ├── IncidentNavPanel.tsx  # Left sidebar navigation
│   ├── SeverityIndicator.tsx # Header with threat meter
│   ├── AttackStageVisualization.tsx  # MITRE kill chain bar
│   ├── AttackTimeline.tsx    # Central event timeline
│   ├── EducationPanel.tsx    # Right sidebar: learning content
│   └── RecommendedResponsePanel.tsx  # Right sidebar: playbook
├── utils/
│   └── helpers.tsx           # Color utilities + SeverityBadge
├── App.tsx                   # Root layout
├── main.tsx                  # Entry point
└── index.css                 # Global dark SOC theme
```

---

## 🎨 Design Philosophy

TraceLens uses a **dark SOC aesthetic** with:
- Deep navy/midnight blue palette (`#040d1a` → `#0d2545`)
- Severity-coded color system (Critical → Red, High → Orange, Medium → Yellow, Low → Green)
- Scanline CRT texture overlay for authentic SOC terminal feel
- Animated threat indicators with glow effects
- JetBrains Mono for all technical data (IDs, timestamps, IOCs)

---

## 📄 License

MIT — See [LICENSE](LICENSE)
