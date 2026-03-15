import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Newspaper,
  LineChart,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";

const SCROLL_THRESHOLD = 60;

const links: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/market", label: "Market & News", icon: Newspaper },
  { to: "/analytics", label: "Graphs & Analytics", icon: LineChart },
  { to: "/lab", label: "Chat", icon: MessageCircle },
];

export default function Header({
  scrollRef,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [hidden, setHidden] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const top = el.scrollTop;
      if (top > SCROLL_THRESHOLD) {
        setHidden(top > lastScrollTop.current);
      } else {
        setHidden(false);
      }
      lastScrollTop.current = top;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollRef]);

  return (
    <header
      className={`app-header fixed left-0 right-0 top-0 z-50 flex items-center justify-end gap-2 bg-transparent px-4 py-3 transition-transform duration-300 sm:gap-4 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <nav className="flex items-center gap-2 text-lg sm:gap-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-md p-2 font-medium transition-colors hover:text-accent-foreground md:p-1.5 md:px-2 ${isActive ? "text-accent-foreground" : "text-foreground/80"}`
            }
            end
          >
            <Icon className="h-5 w-5 shrink-0 md:mr-1" aria-hidden />
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  );
}
