// One place for brand details, so renaming the product is a one-line change.
export const site = {
  name: "Rankly",
  tagline: "See if AI recommends your business — or your competitor.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rankly.world",
  price: 9,
  supportEmail: "support@rankly.world",
  // "true" = pricing buttons open Dodo checkout; otherwise the early-access form.
  paymentsEnabled: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true",
};
