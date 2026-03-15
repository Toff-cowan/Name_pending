import { NavLink } from "react-router";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/market", label: "Market & News" },
    { to: "/analytics", label: "Graphs & Analytics" },
    { to: "/lab", label: "Chat" },
  ] as const;

  return (
    <header className="app-header flex items-center justify-end gap-4 bg-background px-4 py-3">
      <nav className="flex items-center gap-4 text-lg">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `font-medium transition-colors hover:text-accent-foreground ${isActive ? "text-accent-foreground" : "text-foreground/80"}`
            }
            end
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  );
}
