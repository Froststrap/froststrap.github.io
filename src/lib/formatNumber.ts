export function formatCompactNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "0";

  const n = Number(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  // Units ordered high -> low
  const units: { limit: number; value: number; symbol: string }[] = [
    { limit: 1e12, value: 1e9, symbol: "B" }, // billions (for very large numbers)
    { limit: 1e9, value: 1e9, symbol: "B" },
    { limit: 1e6, value: 1e6, symbol: "M" },
    { limit: 1e3, value: 1e3, symbol: "K" },
  ];

  for (const unit of units) {
    if (abs >= unit.value) {
      const num = abs / unit.value;

      // Decide decimals:
      // - If the compacted number is >= 100 -> no decimals (e.g. 186.054 -> 186K)
      // - Else show 1 decimal (e.g. 54.322 -> 54.3K, 1.234 -> 1.2K)
      const decimals = num >= 100 ? 0 : 1;
      const rounded =
        decimals === 0
          ? String(Math.round(num))
          : (Math.round(num * 10) / 10).toFixed(1).replace(/\.0$/, "");

      return `${sign}${rounded}${unit.symbol}`;
    }
  }

  // Fallback: small numbers, show as normal integer with separators
  return `${sign}${abs.toLocaleString()}`;
}

export default formatCompactNumber;
