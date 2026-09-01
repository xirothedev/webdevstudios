// Next-page disable rule for admin tables: with a known total trust it; without one
// (API omits it), a short page means the last page.
export function nextDisabledFor(
  page: number,
  total: number | undefined,
  rows: readonly unknown[],
  limit: number,
): boolean {
  if (total != null) return page * limit >= total;
  return rows.length < limit;
}
