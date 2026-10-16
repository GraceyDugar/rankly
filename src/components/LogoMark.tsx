// The Rankly mascot logo: the robot head on a terracotta tile.
export default function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="15" fill="var(--accent)" />
      <line x1="32" y1="9" x2="32" y2="17" stroke="var(--foreground)" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="32" cy="8" r="4.6" fill="var(--background)" />
      <rect x="10" y="17" width="44" height="36" rx="13" fill="var(--foreground)" />
      <rect x="16" y="23" width="32" height="22" rx="8" fill="var(--background)" />
      <circle cx="25" cy="34" r="3.6" fill="var(--foreground)" />
      <circle cx="39" cy="34" r="3.6" fill="var(--foreground)" />
      <circle cx="20" cy="40.5" r="2" fill="var(--accent)" opacity="0.7" />
      <circle cx="44" cy="40.5" r="2" fill="var(--accent)" opacity="0.7" />
    </svg>
  );
}
