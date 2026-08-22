
// Cute vector Memoji profile helpers (Offline, SVG-based, looks extremely premium)
export const MemojiAvatar = ({
  id,
  className = 'w-10 h-10',
}: {
  id: number;
  className?: string;
}) => {
  switch (id) {
    case 1: // Brown hair girl
      return (
        <svg
          className={`${className} rounded-full border border-white/80 shadow-md`}
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="50" fill="#ffd6e0" />
          <circle cx="50" cy="54" r="28" fill="#ffd0db" />
          <path
            d="M25 45 C25 25, 75 25, 75 45 C75 52, 70 56, 50 56 C30 56, 25 52, 25 45 Z"
            fill="#471018"
          />
          <circle cx="40" cy="46" r="3.5" fill="#471018" />
          <circle cx="60" cy="46" r="3.5" fill="#471018" />
          <path
            d="M44 54 Q50 58 56 54"
            stroke="#471018"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 2: // Cap boy
      return (
        <svg
          className={`${className} rounded-full border border-white/80 shadow-md`}
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="50" fill="#fef08a" />
          <circle cx="50" cy="54" r="28" fill="#fde047" />
          <path d="M30 40 C30 25, 70 25, 70 40 L70 50 L30 50 Z" fill="#2563eb" />
          <path d="M20 40 L80 40 L80 46 L20 46 Z" fill="#ef4444" />
          <circle cx="40" cy="54" r="3.5" fill="#1e3a8a" />
          <circle cx="60" cy="54" r="3.5" fill="#1e3a8a" />
          <path
            d="M44 62 Q50 66 56 62"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 3: // Hat girl
      return (
        <svg
          className={`${className} rounded-full border border-white/80 shadow-md`}
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="50" fill="#ffedd5" />
          <circle cx="50" cy="54" r="28" fill="#fed7aa" />
          <path d="M22 55 C22 35, 78 35, 78 55 Z" fill="#ca8a04" />
          <path d="M26 38 C32 24, 68 24, 74 38 Z" fill="#b45309" />
          <path d="M16 38 L84 38 L84 44 L16 44 Z" fill="#78350f" />
          <circle cx="40" cy="56" r="3.5" fill="#78350f" />
          <circle cx="60" cy="56" r="3.5" fill="#78350f" />
          <path
            d="M44 64 Q50 68 56 64"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 4: // Glass girl
      return (
        <svg
          className={`${className} rounded-full border border-white/80 shadow-md`}
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="50" fill="#bfdbfe" />
          <circle cx="50" cy="54" r="28" fill="#93c5fd" />
          <path d="M22 50 C22 30, 78 30, 78 50 Z" fill="#1e3a8a" />
          <circle cx="38" cy="52" r="10" stroke="#ef4444" strokeWidth="3.5" fill="none" />
          <circle cx="62" cy="52" r="10" stroke="#ef4444" strokeWidth="3.5" fill="none" />
          <line x1="48" y1="52" x2="52" y2="52" stroke="#ef4444" strokeWidth="3.5" />
          <circle cx="38" cy="52" r="3.5" fill="#1e3a8a" />
          <circle cx="62" cy="52" r="3.5" fill="#1e3a8a" />
          <path
            d="M44 65 Q50 69 56 65"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    default: // Pink hat boy
      return (
        <svg
          className={`${className} rounded-full border border-white/80 shadow-md`}
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="50" fill="#fbcfe8" />
          <circle cx="50" cy="54" r="28" fill="#f472b6" />
          <path d="M30 42 C30 28, 70 28, 70 42 Z" fill="#db2777" />
          <circle cx="40" cy="54" r="3.5" fill="#831843" />
          <circle cx="60" cy="54" r="3.5" fill="#831843" />
          <path
            d="M44 62 Q50 66 56 62"
            stroke="#831843"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};
