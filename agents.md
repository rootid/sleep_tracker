# DreamTracker: Architecture and Best Practices

This document outlines the architecture of the DreamTracker application and the React best practices employed during its development. It serves as a guide for AI agents and developers working on this codebase.

## 🏗 Architecture Overview

DreamTracker is a client-side, offline-first gamified sleep tracking application.

### Tech Stack
*   **Framework:** React 18 with Vite for fast HMR and optimized builds.
*   **Language:** TypeScript for static typing and improved developer experience.
*   **Styling:** Tailwind CSS (v4) for utility-first, responsive, and maintainable styling.
*   **State & Storage:** React hooks combined with Browser `LocalStorage` for persistent, offline-first data storage. No external backend is required initially.
*   **Visualizations:** `recharts` for trend line graphs and custom grid layouts for the consistency heatmap.
*   **Animations:** `framer-motion` for smooth UI transitions and `canvas-confetti` for rewarding gamification moments.
*   **Testing:** `vitest` alongside `@testing-library/react` for unit and integration testing.

### Folder Structure (Feature-Sliced Design)
The codebase is organized by feature rather than file type. This modular approach scales better as the application grows:

```text
src/
├── features/
│   ├── sleep/                  # Core sleep tracking domain
│   │   ├── components/         # UI components specific to sleep (Forms, Charts)
│   │   ├── hooks/              # Custom hooks (e.g., useSleepData) managing local state
│   │   └── utils/              # Pure functions for time math and score calculations
│   └── gamification/           # Gamification domain
│       └── utils/              # Pure functions for XP, levels, and badges logic
├── types/                      # Global TypeScript interfaces (SleepEntry, UserStats)
├── lib/                        # Shared utility functions (e.g., cn for Tailwind classes)
├── App.tsx                     # Main dashboard layout and composition root
└── main.tsx                    # React entry point
```

## ⚛️ React & Code Best Practices Followed

### 1. Separation of Concerns (Custom Hooks)
State management and side effects (like reading/writing to LocalStorage) are extracted out of the UI components into custom hooks (`useSleepData.ts`). This keeps UI components focused strictly on rendering and makes the state logic reusable.

### 2. Pure Functions for Business Logic
Core business logic (calculating sleep scores, XP, streaks, and levels) is completely decoupled from React components and hooks. They are pure TypeScript functions located in the `utils` folders. 
*   **Benefit:** This makes the most critical parts of the app 100% predictable and incredibly easy to unit test without needing a React DOM environment.

### 3. Strict TypeScript Typing
Interfaces (`SleepEntry`, `UserStats`, `Badge`) are defined centrally in `src/types/index.ts`. All components declare strict `Props` interfaces.
*   **Benefit:** Catches errors at compile-time, enables robust autocomplete, and serves as self-documenting code.

### 4. Component Composition
The main `App.tsx` acts as an orchestrator. It fetches the data via hooks and passes it down to smaller, focused presentational components (`PlayerBanner`, `TrendChart`, `SleepEntryForm`). 
*   **Benefit:** Prevents massive "prop-drilling" and keeps components under 150 lines of code on average.

### 5. Accessible and Controlled Forms
Forms are managed using controlled React state. Inputs use proper `htmlFor` and `id` linking for labels, ensuring screen reader accessibility.

### 6. Utility-First Styling with Tailwind
Instead of writing custom CSS classes, styling is handled directly in the component using Tailwind utility classes. The `cn` (clsx + tailwind-merge) utility is used to conditionally apply classes and merge Tailwind classes without conflicts.

### 7. Automated Testing
*   **Unit Tests:** Pure functions in `utils/` are heavily tested using Vite's fast test runner (`vitest`).
*   **Integration Tests:** Complex components like `SleepEntryForm` are tested using React Testing Library to simulate user interactions (typing, submitting) and verify the correct callbacks are fired.
