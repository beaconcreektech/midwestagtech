import { site } from "../config/site";

/** Always the public host. Coolify Node origin is localhost; www must not split canonicals. */
export function publicOrigin(_request?: Request): string {
  return site.url.replace(/\/$/, "");
}
