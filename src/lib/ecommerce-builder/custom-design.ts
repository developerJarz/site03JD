/**
 * Custom store design request — the visitor names their store type and a
 * website they'd like theirs to look like, for a flat design fee on top of
 * the base package. Client-safe: the builder and the server price it alike.
 */
import type { Cents } from "./types";

/** Flat one-time fee for designing the store after a reference website. */
export const CUSTOM_DESIGN_FEE: Cents = 10000;

/** Breakdown line id for the fee (never a pricebook feature id). */
export const CUSTOM_DESIGN_LINE_ID = "custom-design";

export const STORE_TYPE_GROUPS: { label: string; types: { id: string; label: string }[] }[] = [
  {
    label: "Fashion & lifestyle",
    types: [
      { id: "fashion-apparel", label: "Fashion & Apparel" },
      { id: "mens-clothing", label: "Men’s Clothing" },
      { id: "womens-clothing", label: "Women’s Clothing" },
      { id: "kids-baby", label: "Kids & Baby Clothing" },
      { id: "saree-traditional", label: "Saree & Traditional Wear" },
      { id: "modest-islamic", label: "Modest & Islamic Fashion" },
      { id: "lingerie-innerwear", label: "Lingerie & Innerwear" },
      { id: "shoes-footwear", label: "Shoes & Footwear" },
      { id: "bags-accessories", label: "Bags & Accessories" },
      { id: "jewellery-watches", label: "Jewellery & Watches" },
      { id: "eyewear", label: "Eyewear & Sunglasses" },
    ],
  },
  {
    label: "Beauty & health",
    types: [
      { id: "beauty-cosmetics", label: "Beauty & Cosmetics" },
      { id: "skincare", label: "Skincare" },
      { id: "perfume", label: "Perfume & Fragrance" },
      { id: "health-wellness", label: "Health & Wellness" },
      { id: "pharmacy", label: "Pharmacy & Medicine" },
      { id: "medical-equipment", label: "Medical Equipment" },
      { id: "maternity-baby-care", label: "Maternity & Baby Care" },
    ],
  },
  {
    label: "Food & grocery",
    types: [
      { id: "grocery", label: "Grocery & Supermarket" },
      { id: "organic-food", label: "Organic & Natural Food" },
      { id: "meat-fish", label: "Fresh Meat & Fish" },
      { id: "bakery-sweets", label: "Bakery, Cakes & Sweets" },
      { id: "restaurant-delivery", label: "Restaurant & Food Delivery" },
      { id: "tea-coffee", label: "Tea, Coffee & Beverages" },
      { id: "agro-farm", label: "Agro & Farm Products" },
    ],
  },
  {
    label: "Electronics & tech",
    types: [
      { id: "electronics-gadgets", label: "Electronics & Gadgets" },
      { id: "mobile-accessories", label: "Mobile Phones & Accessories" },
      { id: "computers", label: "Computers & Laptops" },
      { id: "home-appliances", label: "Home Appliances" },
      { id: "cctv-security", label: "CCTV & Security Systems" },
    ],
  },
  {
    label: "Home & living",
    types: [
      { id: "furniture", label: "Furniture" },
      { id: "home-decor", label: "Home Decor & Interior" },
      { id: "kitchen-dining", label: "Kitchen & Dining" },
      { id: "bedding-textiles", label: "Bedding & Home Textiles" },
      { id: "gardening-plants", label: "Gardening & Plants" },
      { id: "hardware-tools", label: "Hardware & Tools" },
      { id: "building-materials", label: "Building Materials" },
    ],
  },
  {
    label: "Hobbies & gifts",
    types: [
      { id: "books-stationery", label: "Books & Stationery" },
      { id: "toys-games", label: "Toys & Games" },
      { id: "sports-fitness", label: "Sports & Fitness" },
      { id: "outdoor-travel", label: "Outdoor & Travel Gear" },
      { id: "gifts-flowers", label: "Gifts & Flowers" },
      { id: "handicrafts", label: "Handicrafts & Handmade" },
      { id: "art-supplies", label: "Art & Craft Supplies" },
      { id: "pet-supplies", label: "Pet Supplies" },
    ],
  },
  {
    label: "Automotive",
    types: [
      { id: "car-parts", label: "Car Parts & Accessories" },
      { id: "motorbike", label: "Motorbike & Accessories" },
    ],
  },
  {
    label: "Business models",
    types: [
      { id: "multi-vendor", label: "Multi-vendor Marketplace" },
      { id: "wholesale-b2b", label: "Wholesale & B2B" },
      { id: "dropshipping", label: "Dropshipping Store" },
      { id: "print-on-demand", label: "Print-on-Demand & Custom Merch" },
      { id: "digital-products", label: "Digital Products & Downloads" },
      { id: "online-courses", label: "Online Courses" },
      { id: "subscription-box", label: "Subscription Box" },
      { id: "tickets-events", label: "Event Tickets & Bookings" },
      { id: "other", label: "Other store type" },
    ],
  },
];

export const STORE_TYPES = STORE_TYPE_GROUPS.flatMap((g) => g.types);

export const storeTypeLabel = (id: string) => STORE_TYPES.find((t) => t.id === id)?.label ?? "";

/**
 * Normalizes a reference link to an absolute http(s) URL ("shop.com/x" →
 * "https://shop.com/x"), or "" when it isn't a usable public address.
 */
export function normalizeReferenceUrl(raw: string): string {
  const text = raw.trim();
  if (!text || text.length > 300 || /\s/.test(text)) return "";
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (!/^[a-z\d-]+(\.[a-z\d-]+)*\.[a-z]{2,}$/i.test(url.hostname) || url.username || url.password) return "";
    return url.toString();
  } catch {
    return "";
  }
}

/** Short form of a reference link for line items, e.g. "shop.com/collections". */
export function referenceLabel(url: string): string {
  const short = url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
  return short.length > 48 ? `${short.slice(0, 47)}…` : short;
}
