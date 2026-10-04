/**
 * Canonical product categories — used by the dashboard product form's
 * category picker and the Marketplace's category filter, so both speak the
 * same vocabulary instead of drifting apart as free-text category names.
 */
export const PRODUCT_CATEGORIES = [
  "Fashion & Apparel",
  "Shoes",
  "Bags & Accessories",
  "Jewelry",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Home & Living",
  "Kitchen & Dining",
  "Electronics",
  "Phones & Accessories",
  "Computers & Office",
  "Food & Groceries",
  "Baby & Kids",
  "Toys & Games",
  "Books & Stationery",
  "Sports & Outdoors",
  "Automotive",
  "Art & Crafts",
  "Pet Supplies",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Shown last in the picker — lets a seller type a category that isn't
 * listed instead of forcing a bad fit. */
export const OTHER_CATEGORY = "Other";

export function isKnownCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}
