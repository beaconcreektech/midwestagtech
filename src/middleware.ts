import { defineMiddleware } from "astro:middleware";
import { site } from "./config/site";

/** Collapse www onto the public apex so Google does not index two hosts. */
export const onRequest = defineMiddleware(({ request }, next) => {
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();

  if (host.startsWith("www.")) {
    const url = new URL(request.url);
    return Response.redirect(`${site.url}${url.pathname}${url.search}`, 301);
  }

  return next();
});
