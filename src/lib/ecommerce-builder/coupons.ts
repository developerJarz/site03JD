/** Shared by the admin validator, published catalog and customer calculator. */
export const COUPON_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{0,39}$/;

export const normalizeCouponCode = (code: string) => code.trim().toUpperCase();
