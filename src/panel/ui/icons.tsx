import { BarChart3, CalendarDays, ClipboardCheck, FileText, FolderKanban, Gauge, Globe, Home, Image, Inbox, Kanban, MessageCircle, Settings, Users } from "lucide-react";
import type { NavIcon } from "../nav";

const MAP: Record<NavIcon, React.ComponentType<{ className?: string }>> = {
  home: Home,
  inbox: Inbox,
  calendar: CalendarDays,
  deals: Kanban,
  people: Users,
  quotes: FileText,
  projects: FolderKanban,
  tasks: ClipboardCheck,
  load: Gauge,
  report: BarChart3,
  chat: MessageCircle,
  web: Globe,
  media: Image,
  settings: Settings,
};

export function NavGlyph({ name, className }: { name: NavIcon; className?: string }) {
  const C = MAP[name];
  return <C className={className} aria-hidden />;
}
