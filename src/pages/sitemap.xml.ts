import type { APIRoute } from "astro";
import { catalogCategories } from "../config/catalog";

const staticPaths = [
  "/",
  "/products",
  "/solutions",
  "/support",
  "/about",
  "/service-area",
  ...catalogCategories.map((category) => `/products/${category.slug}`),
];

export const GET: APIRoute = ({ url }) => {
  const origin = url.origin.replace(/\/$/, "");
  const urls = staticPaths
    .map(
      (path) => `  <url>
    <loc>${origin}${path}</loc>
    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
