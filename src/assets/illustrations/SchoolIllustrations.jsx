import React from "react";

/** Large school campus scene for login page */
export function SchoolCampusScene({ className = "", width = 340 }) {
  return (
    <svg
      className={className}
      width={width}
      height={width * 0.72}
      viewBox="0 0 340 245"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Sky */}
      <rect width="340" height="245" rx="16" fill="url(#skyGrad)" />
      <circle cx="285" cy="42" r="28" fill="#FDE68A" opacity="0.95" />
      <circle cx="285" cy="42" r="34" fill="#FDE68A" opacity="0.2" />

      {/* Clouds */}
      <ellipse cx="70" cy="48" rx="34" ry="14" fill="white" opacity="0.85" />
      <ellipse cx="95" cy="44" rx="22" ry="11" fill="white" opacity="0.7" />
      <ellipse cx="200" cy="58" rx="28" ry="12" fill="white" opacity="0.6" />

      {/* Ground */}
      <path d="M0 195 Q170 175 340 195 L340 245 L0 245Z" fill="#86EFAC" opacity="0.5" />
      <path d="M0 205 Q170 190 340 205 L340 245 L0 245Z" fill="#4ADE80" opacity="0.35" />

      {/* Trees */}
      <rect x="28" y="168" width="8" height="28" rx="2" fill="#92400E" />
      <circle cx="32" cy="160" r="22" fill="#22C55E" />
      <rect x="298" y="172" width="8" height="24" rx="2" fill="#92400E" />
      <circle cx="302" cy="164" r="20" fill="#16A34A" />

      {/* School building */}
      <rect x="108" y="88" width="124" height="108" rx="4" fill="#EEF0FB" stroke="white" strokeWidth="2" />
      <path d="M98 88 L170 52 L242 88Z" fill="#2D3A8C" stroke="white" strokeWidth="2" />
      <rect x="158" y="62" width="24" height="18" rx="2" fill="#E8541A" />
      {/* Windows */}
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => (
          <rect
            key={`w${col}${row}`}
            x={120 + col * 36}
            y={100 + row * 32}
            width="24"
            height="20"
            rx="3"
            fill="#BFDBFE"
            stroke="#93C5FD"
            strokeWidth="1"
          />
        ))
      )}
      {/* Door */}
      <rect x="152" y="148" width="36" height="48" rx="4" fill="#2D3A8C" />
      <circle cx="180" cy="172" r="3" fill="#FDE68A" />
      {/* Flag */}
      <line x1="170" y1="52" x2="170" y2="30" stroke="#94A3B8" strokeWidth="2" />
      <path d="M170 30 L190 36 L170 42Z" fill="#E8541A" />

      {/* Student left - anime chibi */}
      <g transform="translate(52, 128)">
        <ellipse cx="24" cy="58" rx="20" ry="6" fill="rgba(0,0,0,0.12)" />
        <rect x="14" y="38" width="20" height="22" rx="6" fill="#2D3A8C" />
        <rect x="10" y="48" width="10" height="16" rx="4" fill="#1E3A8C" />
        <rect x="28" y="48" width="10" height="16" rx="4" fill="#1E3A8C" />
        <circle cx="24" cy="24" r="18" fill="#FCD9B6" />
        <path d="M8 18 Q24 4 40 18 L38 28 Q24 16 10 28Z" fill="#3B2314" />
        <circle cx="17" cy="24" r="5" fill="white" />
        <circle cx="31" cy="24" r="5" fill="white" />
        <circle cx="18" cy="24" r="2.5" fill="#1E293B" />
        <circle cx="32" cy="24" r="2.5" fill="#1E293B" />
        <circle cx="19" cy="23" r="1" fill="white" />
        <circle cx="33" cy="23" r="1" fill="white" />
        <path d="M20 32 Q24 36 28 32" stroke="#E8541A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="30" y="42" width="14" height="18" rx="3" fill="#F59E0B" transform="rotate(-15 37 51)" />
        <line x1="30" y1="42" x2="44" y2="60" stroke="#D97706" strokeWidth="1" />
      </g>

      {/* Student right */}
      <g transform="translate(248, 124)">
        <ellipse cx="24" cy="62" rx="20" ry="6" fill="rgba(0,0,0,0.12)" />
        <rect x="12" y="40" width="22" height="24" rx="6" fill="#E8541A" />
        <rect x="8" y="50" width="10" height="16" rx="4" fill="#D44A14" />
        <rect x="28" y="50" width="10" height="16" rx="4" fill="#D44A14" />
        <circle cx="24" cy="26" r="18" fill="#FDDCB5" />
        <path d="M8 20 Q24 6 40 20 L38 30 Q24 18 10 30Z" fill="#1A1A2E" />
        <circle cx="17" cy="26" r="5" fill="white" />
        <circle cx="31" cy="26" r="5" fill="white" />
        <circle cx="18" cy="26" r="2.5" fill="#1E293B" />
        <circle cx="32" cy="26" r="2.5" fill="#1E293B" />
        <path d="M20 34 Q24 38 28 34" stroke="#E8541A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="4" y="44" width="14" height="18" rx="3" fill="#2D3A8C" transform="rotate(12 11 53)" />
      </g>

      {/* Books stack */}
      <rect x="148" y="210" width="22" height="6" rx="1" fill="#2D3A8C" />
      <rect x="150" y="204" width="18" height="6" rx="1" fill="#E8541A" />
      <rect x="152" y="198" width="14" height="6" rx="1" fill="#22C55E" />

      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="340" y2="245" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD" stopOpacity="0.35" />
          <stop offset="1" stopColor="#EEF0FB" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Small mascot for dashboard welcome banner */
export function StudentMascot({ className = "", width = 140 }) {
  return (
    <svg
      className={className}
      width={width}
      height={width * 0.85}
      viewBox="0 0 140 119"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="70" cy="108" rx="38" ry="8" fill="rgba(0,0,0,0.15)" />
      <rect x="48" y="68" width="44" height="38" rx="10" fill="#fff" opacity="0.95" />
      <rect x="40" y="78" width="14" height="28" rx="5" fill="#fff" opacity="0.85" />
      <rect x="86" y="78" width="14" height="28" rx="5" fill="#fff" opacity="0.85" />
      <circle cx="70" cy="48" r="32" fill="#FCD9B6" />
      <path d="M38 38 Q70 8 102 38 L98 52 Q70 28 42 52Z" fill="#2D1B0E" />
      <circle cx="56" cy="48" r="9" fill="white" />
      <circle cx="84" cy="48" r="9" fill="white" />
      <circle cx="58" cy="48" r="4.5" fill="#1E293B" />
      <circle cx="86" cy="48" r="4.5" fill="#1E293B" />
      <circle cx="60" cy="46" r="1.8" fill="white" />
      <circle cx="88" cy="46" r="1.8" fill="white" />
      <path d="M58 62 Q70 72 82 62" stroke="#E8541A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Graduation cap */}
      <rect x="48" y="22" width="44" height="8" rx="2" fill="#2D3A8C" />
      <polygon points="70,10 48,22 92,22" fill="#1E2A6E" />
      <line x1="92" y1="22" x2="100" y2="30" stroke="#FDE68A" strokeWidth="2" />
      <circle cx="100" cy="31" r="3" fill="#FDE68A" />
      {/* Backpack */}
      <rect x="88" y="72" width="20" height="26" rx="5" fill="#E8541A" />
      <rect x="92" y="76" width="12" height="8" rx="2" fill="#FED7AA" opacity="0.5" />
    </svg>
  );
}

/** Tiny school icon for sidebar footer */
export function SchoolBellIcon({ className = "", width = 72 }) {
  return (
    <svg
      className={className}
      width={width}
      height={width * 0.9}
      viewBox="0 0 72 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="20" y="28" width="32" height="28" rx="4" fill="#EEF0FB" opacity="0.9" />
      <path d="M16 28 L36 14 L56 28Z" fill="#2D3A8C" opacity="0.9" />
      <circle cx="52" cy="20" r="6" fill="#E8541A" opacity="0.85" />
      <rect x="32" y="40" width="8" height="16" rx="2" fill="#2D3A8C" opacity="0.8" />
      <circle cx="36" cy="58" r="5" fill="#FDE68A" opacity="0.7" />
    </svg>
  );
}

/** Floating page decorations - custom SVG study icons */
export function SchoolAmbience() {
  const items = [
    { type: "book",    top: "8%",  left: "55%", delay: 0 },
    { type: "student", top: "18%", right: "6%",  delay: -1.2 },
    { type: "school",  top: "55%", left: "48%", delay: -2.4 },
    { type: "pencil",  top: "72%", right: "12%", delay: -3.6 },
    { type: "backpack",top: "35%", left: "62%", delay: -4.8 },
    { type: "bus",     top: "82%", left: "8%",  delay: -0.8 },
  ];

  return (
    <div className="school-ambience" aria-hidden="true">
      {items.map((d, i) => (
        <span
          key={i}
          className="school-float-svg"
          style={{ top: d.top, left: d.left, right: d.right, animationDelay: `${d.delay}s` }}
        >
          <StudyFloatIcon type={d.type} />
        </span>
      ))}
    </div>
  );
}

function StudyFloatIcon({ type }) {
  const icons = {
    book: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="8" y="10" width="32" height="28" rx="3" fill="#2D3A8C" opacity="0.9" />
        <path d="M24 10v28" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <rect x="12" y="16" width="8" height="2" rx="1" fill="white" opacity="0.5" />
        <rect x="12" y="21" width="10" height="2" rx="1" fill="white" opacity="0.35" />
      </svg>
    ),
    student: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="9" fill="#FCD9B6" />
        <path d="M12 14 Q24 4 36 14" fill="#2D1B0E" />
        <rect x="16" y="26" width="16" height="14" rx="5" fill="#E8541A" />
        <rect x="28" y="28" width="10" height="12" rx="3" fill="#2D3A8C" transform="rotate(-10 33 34)" />
      </svg>
    ),
    school: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M8 22 L24 10 L40 22Z" fill="#2D3A8C" />
        <rect x="12" y="22" width="24" height="18" rx="2" fill="#EEF0FB" />
        <rect x="20" y="30" width="8" height="10" rx="1" fill="#2D3A8C" />
        <rect x="14" y="26" width="6" height="5" rx="1" fill="#BFDBFE" />
        <rect x="28" y="26" width="6" height="5" rx="1" fill="#BFDBFE" />
      </svg>
    ),
    pencil: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="20" y="6" width="8" height="30" rx="2" fill="#F59E0B" transform="rotate(25 24 21)" />
        <polygon points="26,6 30,2 34,6" fill="#FDE68A" transform="rotate(25 24 21)" />
        <rect x="20" y="32" width="8" height="6" rx="1" fill="#E8541A" transform="rotate(25 24 21)" />
      </svg>
    ),
    backpack: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="14" y="18" width="20" height="24" rx="6" fill="#2D3A8C" />
        <path d="M18 18 V14 Q24 8 30 14 V18" stroke="#E8541A" strokeWidth="3" fill="none" />
        <rect x="20" y="24" width="8" height="8" rx="2" fill="#E8541A" opacity="0.6" />
      </svg>
    ),
    bus: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="6" y="16" width="36" height="18" rx="4" fill="#E8541A" />
        <rect x="10" y="12" width="28" height="8" rx="3" fill="#D44A14" />
        <rect x="12" y="14" width="8" height="4" rx="1" fill="white" opacity="0.5" />
        <rect x="22" y="14" width="8" height="4" rx="1" fill="white" opacity="0.5" />
        <circle cx="14" cy="36" r="4" fill="#1e293b" />
        <circle cx="34" cy="36" r="4" fill="#1e293b" />
      </svg>
    ),
  };
  return icons[type] || null;
}
