import { site } from "../config/site";

/** Public site origin for canonical, OG, sitemap, JSON-LD. */
export function publicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost || request.headers.get("host") || "")
    .split(",")[0]
    .trim();
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = (forwardedProto || "https").split(",")[0].trim();

  if (host && !/^localhost\b/i.test(host) && !/^127\.0\.0\.1\b/.test(host)) {
    return `${proto}://${host}`;
  }

  return site.url;
}
