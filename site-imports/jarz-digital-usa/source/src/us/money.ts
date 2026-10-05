// Currency formatting shared by the calculator, growth sections and pages. The active site sets the currency once per
// render (setMoney), so the same components show US$, CA$, £, € or Tk without any other change.
export const MONEY = { sym: '$', locale: 'en-US' }
export function setMoney(sym: string, locale = 'en-US') { MONEY.sym = sym; MONEY.locale = locale }

const num = (n: number, d = 0) => n.toLocaleString(MONEY.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
/** Whole currency amount, e.g. $1,500 · £1,500 · Tk 1,500 */
export const money = (n: number) => (n < 0 ? '-' : '') + MONEY.sym + num(Math.round(Math.abs(n)))
/** Two decimals, e.g. $12.42 */
export const money2 = (n: number) => (Number.isFinite(n) ? MONEY.sym + num(n, 2) : '—')
/** Short axis labels, e.g. $40K · £1.2M */
export const moneyShort = (n: number) => { const a = Math.abs(n); return (n < 0 ? '-' : '') + MONEY.sym + (a >= 1e6 ? (a / 1e6).toFixed(1) + 'M' : a >= 1e3 ? Math.round(a / 1e3) + 'K' : Math.round(a)) }
export const int = (n: number) => num(Math.round(n))
