import {
  AppWindow,
  BriefcaseBusiness,
  Building2,
  ChartLine,
  CodeXml,
  Droplets,
  Dumbbell,
  Factory,
  Gavel,
  HardHat,
  HeartPulse,
  House,
  Landmark,
  MapPin,
  MonitorSmartphone,
  MousePointerClick,
  Rocket,
  Scale,
  Search,
  Share2,
  Smile,
  Sparkles,
  ThermometerSnowflake,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * CMS-selectable icons. Content stores the key; components render the icon.
 * Add entries here to make new icons available in the admin.
 */
export const ICONS: Record<string, LucideIcon> = {
  "monitor-smartphone": MonitorSmartphone,
  search: Search,
  "map-pin": MapPin,
  "share-2": Share2,
  "mouse-pointer-click": MousePointerClick,
  "briefcase-business": BriefcaseBusiness,
  "app-window": AppWindow,
  "code-xml": CodeXml,
  wrench: Wrench,
  landmark: Landmark,
  "building-2": Building2,
  "hard-hat": HardHat,
  smile: Smile,
  scale: Scale,
  "chart-line": ChartLine,
  dumbbell: Dumbbell,
  "heart-pulse": HeartPulse,
  "thermometer-snowflake": ThermometerSnowflake,
  gavel: Gavel,
  factory: Factory,
  droplets: Droplets,
  "utensils-crossed": UtensilsCrossed,
  house: House,
  rocket: Rocket,
  sparkles: Sparkles,
};

export const ICON_OPTIONS = Object.keys(ICONS).map((value) => ({ value, label: value.replace(/-/g, " ") }));

export function Icon({ name, className, strokeWidth = 1.6 }: { name: string; className?: string; strokeWidth?: number }) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
