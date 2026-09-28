import Link from "next/link";
import { ICONS, type IconName } from "@/components/Icons";

export function TemplateCard({
  label,
  caption,
  icon,
  accent,
  href = "/shop",
}: {
  label: string;
  caption: string;
  icon: IconName;
  accent: string;
  href?: string;
}) {
  const Icon = ICONS[icon];
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl border border-mist bg-cloud transition-transform hover:-translate-y-0.5"
    >
      <div
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(130% 130% at 15% 10%, ${accent}35, transparent 65%), linear-gradient(160deg, var(--art-from), var(--art-to))`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(59,66,41,0.9) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        />
        <Icon
          className="h-16 w-16 transition-transform duration-200 group-hover:scale-110"
          style={{ color: accent }}
        />
        <div
          className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full opacity-30"
          style={{ background: accent }}
        />
      </div>
      <div className="p-3">
        <p className="font-display text-sm text-pine">{label}</p>
        <p className="text-xs text-pine/50">{caption}</p>
      </div>
    </Link>
  );
}
