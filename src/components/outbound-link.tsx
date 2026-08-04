import type { AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * Outbound AFFILIATE/tracking link. Always rel="sponsored nofollow" and opens in
 * a new tab, per the monetisation rules. Use this for every tracking_url CTA.
 */
export function OutboundLink({
  href,
  children,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}
