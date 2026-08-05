import type { PaymentMethodView } from '@/lib/reviews/types';

// Brand tint for well-known methods, used only as a small colour dot so we never
// hotlink or embed third-party logos. Unknown methods render as a neutral chip.
const BRAND_TINT: Record<string, string> = {
  visa: '#1A1F71',
  mastercard: '#EB6A2B',
  amex: '#2E77BC',
  discover: '#E8730E',
  paypal: '#0070BA',
  skrill: '#862165',
  neteller: '#83BA3B',
  applepay: '#A8B2CC',
  googlepay: '#4285F4',
  bitcoin: '#F7931A',
  ethereum: '#627EEA',
  litecoin: '#345D9D',
  tron: '#EF0027',
  usdt: '#26A17B',
  crypto: '#F7931A',
};

function tintFor(method: PaymentMethodView): string | null {
  const key = (method.slug ?? method.name).toLowerCase().replace(/[^a-z]/g, '');
  return BRAND_TINT[key] ?? null;
}

/** Compact inline chips, used in the quick-facts card. */
export function PaymentMethodChips({
  methods,
  limit,
}: {
  methods: PaymentMethodView[];
  limit?: number;
}) {
  if (methods.length === 0) return null;
  const shown = limit ? methods.slice(0, limit) : methods;
  const rest = methods.length - shown.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((m, i) => {
        const tint = tintFor(m);
        return (
          <span
            key={`${m.name}-${i}`}
            className="rv-chip inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[var(--rv-text-2)]"
          >
            {tint && (
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tint }}
                aria-hidden
              />
            )}
            {m.name}
          </span>
        );
      })}
      {rest > 0 && <span className="text-xs text-[var(--rv-muted)]">and {rest} more</span>}
    </div>
  );
}

/** Full payments panel, used by the PAYMENT_PANEL block and payments section. */
export function PaymentMethodsPanel({
  methods,
  heading = 'Payment methods',
}: {
  methods: PaymentMethodView[];
  heading?: string;
}) {
  if (methods.length === 0) return null;
  const deposits = methods.filter((m) => m.kind === 'deposit' || m.kind === 'both');
  const withdrawals = methods.filter((m) => m.kind === 'withdrawal' || m.kind === 'both');

  return (
    <div className="rv-panel p-5">
      <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--rv-blue)]">
        {heading}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-xs text-[var(--rv-muted)]">Deposits</div>
          <PaymentMethodChips methods={deposits} />
        </div>
        <div>
          <div className="mb-2 text-xs text-[var(--rv-muted)]">Withdrawals</div>
          {withdrawals.length > 0 ? (
            <PaymentMethodChips methods={withdrawals} />
          ) : (
            <span className="text-xs text-[var(--rv-muted)]">Not specified</span>
          )}
        </div>
      </div>
    </div>
  );
}
