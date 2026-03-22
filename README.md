# DreamTracker

DreamTracker is a modern, full-stack, gamified sleep tracking application designed to help you build better sleep habits.

By logging your sleep and wake times, you earn Experience Points (XP), build daily streaks, and unlock achievements. The app tracks your consistency and sleep duration over time using intuitive visualizations like GitHub-style heatmaps and trend lines.

## 🚀 Features

*   **Gamified Logging:** Earn XP for logging sleep, hitting your 7-9 hour "sweet spot", and maintaining a streak.
*   **Leveling System:** Watch your "Player Banner" level up as you consistently build better sleep habits.
*   **Visual Insights:** 
    *   **Trend Chart:** View your sleep duration and score trends over the last 14 days.
    *   **Consistency Heatmap:** Visualize your 30-day sleep consistency, color-coded by sleep quality.
*   **Achievements:** Unlock badges for reaching milestones like a 7-day streak or being an "Early Bird".
*   **Persistent Storage:** Data is securely stored using a lightweight local SQLite database.

## 🛠 Tech Stack

**Frontend:**
*   React 18 & Vite
*   TypeScript
*   Tailwind CSS (Utility-first styling)
*   Recharts (Data visualization)
*   Framer Motion & Canvas Confetti (Animations & Rewards)
*   React Testing Library & Vitest (Testing)

**Backend:**
*   Node.js & Express
*   better-sqlite3 (Fast, synchronous SQLite)
*   date-fns (Time and date calculations)

## 🏗 Architecture

The project follows a Feature-Sliced Design pattern to keep the codebase modular and scalable.

```text
.
├── server/                     # Express Backend & SQLite setup
│   ├── index.ts                # API Routes & server initialization
│   ├── db.ts                   # SQLite schema and connection
│   └── gamification.ts         # Core logic for XP, levels, and scores
├── src/                        # React Frontend
│   ├── features/               
│   │   └── sleep/              # Sleep domain feature
│   │       ├── components/     # UI components (Banner, Forms, Charts)
│   │       └── hooks/          # React hooks for API data fetching
│   ├── types/                  # Shared TypeScript interfaces
│   └── App.tsx                 # Main layout orchestrator
├── Containerfile               # Podman/Docker image configuration
└── Makefile                    # Development and build task runner
```

## 💻 Getting Started

### Prerequisites
*   Node.js (v20+)
*   npm
*   Podman (Optional, for containerized running)

### Local Development

1.  **Install Dependencies:**
    ```bash
    make install
    ```
    *(or `npm install`)*

2.  **Start the Development Servers:**
    This command will spin up both the Vite frontend (port 5173) and the Express backend (port 3001) concurrently, proxying API requests automatically.
    ```bash
    make dev
    ```

3.  **Run Tests:**
    Run the unit and integration tests (Vitest).
    ```bash
    make test
    ```

### Production Build

To build the static React assets and prepare the server for production:
```bash
make build
```

## 🐳 Running with Podman (Containerized)

You can easily run DreamTracker as a container using Podman (or Docker). The `Containerfile` uses a multi-stage build to compile the app and run it in a lightweight Node.js Alpine environment.

1.  **Build the Image:**
    ```bash
    make podman-build
    ```

2.  **Run the Container:**
    This command will run the app on port 3000 and create a local volume mount (`./data`) to persist your SQLite database.
    ```bash
    make podman-run
    ```
    The application will be accessible at `http://localhost:3000`.

## 🔌 API Endpoints

The Express backend provides the following endpoints:

*   `GET /api/data`: Returns all sleep entries and the current user stats (level, XP, etc.).
*   `POST /api/entries`: Accepts `{ date, sleepTime, wakeTime }`. Calculates the score, updates the database, re-calculates user stats, and returns the earned XP and any new level/badge data.
*   `POST /api/reset`: Clears all sleep entries and resets user stats back to Level 1.
