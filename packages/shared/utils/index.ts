// ──────────────────────────────────────────────
// Shared utilities — Tu Potencial
// ──────────────────────────────────────────────

/**
 * Format a date string or Date object using the es-MX locale.
 *
 * @param value - ISO date string or Date instance
 * @param options - Intl.DateTimeFormat options (defaults to medium date)
 * @returns Formatted date string, e.g. "24 feb 2026"
 */
export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('es-MX', options).format(date);
}

/**
 * Format a number as MXN currency using the es-MX locale.
 *
 * @param amount - Numeric amount (e.g. 299.00)
 * @param options - Override Intl.NumberFormat options if needed
 * @returns Formatted string, e.g. "$299.00"
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    ...options,
  }).format(amount);
}
