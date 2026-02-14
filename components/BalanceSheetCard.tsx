// components/BalanceSheetCard.tsx
import Link from "next/link";
import db from "@/lib/db";
import styles from "@/components/BalanceSheetCard.module.css";

type BalanceSheetCardProps = {
  orgId: string;
  /** Where the card should link to when clicked */
  href?: string;
  /** Optional title override */
  title?: string;
};

/**
 * Balance Sheet summary card.
 *
 * Uses AccountBalance snapshot rows for fast reads (ledger remains source of truth).
 * All accounting queries must be scoped by orgId.
 */
export default async function BalanceSheetCard({
  orgId,
  href = `/finance/balance-sheet?orgId=${encodeURIComponent(orgId)}`,
  title = "Balance Sheet",
}: BalanceSheetCardProps) {
  const balances = await db.accountBalance.findMany({
    where: { orgId },
    select: {
      balanceCents: true,
      account: {
        select: {
          type: true, // ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
          isActive: true,
        },
      },
    },
  });

  // Only include active accounts in the summary card
  const active = balances.filter((b) => b.account.isActive);

  const totals = active.reduce(
    (acc, row) => {
      const cents = BigInt(row.balanceCents as unknown as bigint);

      // Balance Sheet only: A/L/E
      switch (row.account.type) {
        case "ASSET":
          acc.assets += cents;
          break;
        case "LIABILITY":
          acc.liabilities += cents;
          break;
        case "EQUITY":
          acc.equity += cents;
          break;
        default:
          break;
      }
      return acc;
    },
    { assets: BigInt(0), liabilities: BigInt(0), equity: BigInt(0) }
  );

  // Display magnitudes for credit-balance categories if stored negative
  const assetsDisplay = totals.assets;
  const liabilitiesDisplay = absBigInt(totals.liabilities);
  const equityDisplay = absBigInt(totals.equity);

  const netWorth = assetsDisplay - liabilitiesDisplay;

  return (
    <Link
      href={href}
      className={styles.cardLink}
      aria-label={`${title} (opens details)`}
    >
      <div className={styles.headerRow}>
        <div>
          <div className={styles.title}>{title}</div>
          <div className={styles.netWorthValue}>{formatUSD(netWorth)}</div>
          <div className={styles.subtitle}>Net worth</div>
        </div>

        <div className={styles.badge}>Up to date</div>
      </div>

      <div className={styles.metricsGrid}>
        <Metric label="Assets" value={formatUSD(assetsDisplay)} />
        <Metric label="Liabilities" value={formatUSD(liabilitiesDisplay)} />
        <Metric label="Equity" value={formatUSD(equityDisplay)} />
      </div>

      <div className={styles.footerHint}>Click to open full balance sheet</div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
}

function absBigInt(n: bigint) {
  return n < BigInt(0) ? -n : n;
}

function formatUSD(cents: bigint) {
  const sign = cents < BigInt(0) ? "-" : "";
  const abs = absBigInt(cents);
  const dollars = abs / BigInt(100);
  const remainder = abs % BigInt(100);

  return `${sign}$${withCommas(dollars)}.${remainder.toString().padStart(2, "0")}`;
}

function withCommas(n: bigint) {
  const s = n.toString();
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const fromEnd = s.length - i;
    out += s[i];
    if (fromEnd > 1 && fromEnd % 3 === 1) out += ",";
  }
  return out;
}
