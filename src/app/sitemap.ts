import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// The list of public pages search engines should find.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: "2026-10-25",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/ai-crawler-checker`,
      lastModified: "2026-10-25",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...["start", "terms", "privacy", "refund"].map((page) => ({
      url: `${site.url}/${page}`,
      lastModified: "2026-10-13",
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
