// One place for brand details, so renaming the product is a one-line change.
export const site = {
  name: "Rankly",
  tagline: "See if AI recommends your business — or your competitor.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rankly.world",
  price: 9,
  // Dodo Payments link goes here once it's created.
  checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL || "#pricing",
};
