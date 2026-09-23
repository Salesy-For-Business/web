import type { MetadataRoute } from "next";
import { appOrigin } from "@/lib/storefront";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api"],
    },
    sitemap: `${appOrigin()}/sitemap.xml`,
  };
}
