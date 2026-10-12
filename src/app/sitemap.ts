import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// The list of public pages search engines should find.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: "2026-10-12",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
