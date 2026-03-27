// Subtle pastel SVG illustrations for sprint backgrounds
// These are absolute-positioned decorative elements

export function FloatingLeaves({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
    >
      {/* Leaf cluster top-right */}
      <path
        d="M320 40c-20 30-10 60 10 80s50 10 60-20-30-60-60-60c-5 0-8 0-10 0Z"
        fill="var(--color-sage)"
        opacity="0.08"
      />
      <path
        d="M350 30c-10 25-5 50 15 65s40 8 48-15-25-50-48-50h-15Z"
        fill="var(--color-mist)"
        opacity="0.06"
      />
      {/* Floating dot */}
      <circle cx="280" cy="80" r="4" fill="var(--color-sage)" opacity="0.1" />
      <circle cx="370" cy="120" r="3" fill="var(--color-sand)" opacity="0.12" />

      {/* Leaf bottom-left */}
      <path
        d="M60 340c25-15 55-5 70 20s5 50-25 55-55-20-55-50c0-10 2-18 10-25Z"
        fill="var(--color-sage)"
        opacity="0.06"
      />
      <path
        d="M30 360c15-10 35-2 45 13s3 35-15 38-35-13-38-33c0-7 2-12 8-18Z"
        fill="var(--color-mist)"
        opacity="0.05"
      />
      <circle cx="100" cy="370" r="3" fill="var(--color-sage)" opacity="0.08" />
    </svg>
  );
}

export function SoftWaves({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 800 120"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 80C100 60 200 100 400 80S700 40 800 60V120H0Z"
        fill="var(--color-linen)"
        opacity="0.5"
      />
      <path
        d="M0 90C150 70 250 110 450 85S650 50 800 70V120H0Z"
        fill="var(--color-mist)"
        opacity="0.12"
      />
    </svg>
  );
}

export function DottedCircle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        stroke="var(--color-sage)"
        strokeWidth="1"
        strokeDasharray="4 6"
        opacity="0.15"
      />
      <circle
        cx="60"
        cy="60"
        r="35"
        stroke="var(--color-sand)"
        strokeWidth="0.75"
        strokeDasharray="3 5"
        opacity="0.1"
      />
    </svg>
  );
}

export function SoftBlob({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M140 40C170 60 180 100 160 140S100 190 60 170 10 110 30 70 110 20 140 40Z"
        fill="var(--color-sage)"
        opacity="0.05"
      />
    </svg>
  );
}
