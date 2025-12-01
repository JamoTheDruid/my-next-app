// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://druidic-llc";

    return [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
        },
        // Add more important routes
    ];
}