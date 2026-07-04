/**
 * AppLayout — shared chrome for every /app/* route. A simple top nav plus an
 * <Outlet/> for the routed content. Uses react-router-dom's nested routes.
 */

import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/app", label: "Home", end: true },
  { to: "/app/lessons", label: "Lessons" },
  { to: "/app/songs", label: "Songs" },
  { to: "/app/ear-training", label: "Ear" },
  { to: "/app/fretboard", label: "Fretboard" },
  { to: "/app/journal", label: "Journal" },
];

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--color-accent-soft)]/30 bg-[var(--color-bg)]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/app" className="font-serif text-lg tracking-tight">
            <span className="text-[var(--color-accent)]">♪</span> Worship Guitar
          </a>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition ${
                    isActive
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/15"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--color-accent-soft)]/30 py-4 text-center text-xs text-[var(--color-muted)]">
        Play skillfully · Psalm 33:3
      </footer>
    </div>
  );
}
