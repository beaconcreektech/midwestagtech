import type { APIRoute } from "astro";
import { publicOrigin } from "../utils/origin";

export const GET: APIRoute = ({ request }) => {
  const origin = publicOrigin(request);
  const body = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
