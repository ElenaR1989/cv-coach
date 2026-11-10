import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/employer/dashboard/"],
    },
    sitemap: "https://www.hire-flow.app/sitemap.xml",
  }
}
