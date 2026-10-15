// A tiny AI robot that walks along the top of the hero headline.
// Pure CSS animation (see globals.css); hidden from screen readers.
export default function Mascot() {
  return (
    <span aria-hidden className="mascot-track pointer-events-none absolute inset-x-0 -top-15 h-15 sm:-top-17 sm:h-17">
      <span className="mascot-walker absolute bottom-0 left-0 block">
        <span className="mascot-facing block">
          <span className="mascot-hop block">
            <svg viewBox="0 0 48 56" className="h-14 w-12 sm:h-16 sm:w-14" xmlns="http://www.w3.org/2000/svg">
              {/* antenna */}
              <line x1="24" y1="4" x2="24" y2="12" stroke="var(--foreground)" strokeWidth="2.5" strokeLinecap="round" />
              <circle className="mascot-antenna" cx="24" cy="4" r="3.5" fill="var(--accent)" />
              {/* head */}
              <rect x="6" y="12" width="36" height="28" rx="10" fill="var(--foreground)" />
              {/* screen + eyes */}
              <rect x="11" y="17" width="26" height="17" rx="6" fill="var(--card)" />
              <g className="mascot-eyes">
                <circle cx="19" cy="25.5" r="2.8" fill="var(--foreground)" />
                <circle cx="29" cy="25.5" r="2.8" fill="var(--foreground)" />
              </g>
              <circle cx="15" cy="30" r="1.6" fill="var(--accent)" opacity="0.6" />
              <circle cx="33" cy="30" r="1.6" fill="var(--accent)" opacity="0.6" />
              {/* legs */}
              <rect className="mascot-leg-a" x="15" y="40" width="5" height="10" rx="2.5" fill="var(--foreground)" />
              <rect className="mascot-leg-b" x="28" y="40" width="5" height="10" rx="2.5" fill="var(--foreground)" />
            </svg>
          </span>
        </span>
      </span>
    </span>
  );
}
