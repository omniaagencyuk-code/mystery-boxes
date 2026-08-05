import type { SVGProps } from 'react';

/**
 * Small inline icon set for the review template. Inline SVG keeps the page
 * dependency-free and lets icons inherit currentColor. All are decorative by
 * default (aria-hidden); wrap in a labelled element when meaning matters.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const GiftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    <path d="M12 8S10.5 4 8 4a2 2 0 0 0 0 4h4zM12 8s1.5-4 4-4a2 2 0 0 1 0 4h-4z" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const XIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const StarIcon = (p: IconProps) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z" />
  </svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const GlobeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </svg>
);

export const ExternalLinkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 3h6v6M21 3l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
  </svg>
);

export const VerifiedIcon = (p: IconProps) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}>
    <path d="M12 2l2.2 1.6 2.7-.2 1.1 2.5 2.3 1.4-.6 2.6.6 2.6-2.3 1.4-1.1 2.5-2.7-.2L12 22l-2.2-1.6-2.7.2-1.1-2.5-2.3-1.4.6-2.6-.6-2.6 2.3-1.4 1.1-2.5 2.7.2L12 2z" />
    <path d="M8.5 12.5l2.2 2.2 4.3-4.3" fill="none" stroke="#04120A" strokeWidth={2} />
  </svg>
);
