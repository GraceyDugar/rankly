import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Tells search engines and AI crawlers what they may index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/auth/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
