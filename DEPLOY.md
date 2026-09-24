# Deploy Midwest Ag Technologies (Coolify)

Astro **SSR** (Shopify Storefront) → Node in Docker → Coolify on the BCT DigitalOcean droplet → Cloudflare DNS.

This is **not** a static nginx site. Catalog and cart need a Node process.

**Repo (when pushed):** private GitHub under `beaconcreektech/` — Coolify deploy key or GitHub App, not “Public Repository”.  
**Port:** `80`

---

## Prerequisites

- [ ] Coolify already running on the BCT droplet (same as beaconcreek.tech)
- [ ] GitHub repo exists and `main` has this Dockerfile
- [ ] Shopify Headless channel: public + private Storefront tokens
- [ ] Domain / Cloudflare zone known (or registrar A records)

---

## 1. Coolify application

1. Coolify → **+ New** → **Application**
2. Server: BCT droplet
3. Source: **Private Repository (Deploy Key)** or existing **GitHub App**
4. If deploy key: add Coolify’s public key on **this** repo  
   GitHub → repo → **Settings → Deploy keys** → Title `Coolify` · read-only is fine
5. Settings:

| Setting | Value |
|---------|--------|
| Repository | `git@github.com:beaconcreektech/<slug>.git` (SSH, not HTTPS) |
| Branch | `main` |
| Build pack | **Dockerfile** |
| Port exposes | `80` |

HTTPS URL on a private repo fails with `could not read Username for 'https://github.com'`.

### Environment (required)

Add all three. Enable **Available at Buildtime** — Vite inlines `PUBLIC_*` (and the private token via `import.meta.env`) at `npm run build`. Runtime-only is not enough.

| Key | Notes |
|-----|--------|
| `PUBLIC_SHOPIFY_SHOP` | `something.myshopify.com` |
| `PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Headless channel public token |
| `PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Headless channel private token |
| `SITE_URL` | `https://midwestag.tech` — **runtime** (canonical, sitemap, JSON-LD). Without it, URLs become `https://localhost` and Google will not index. |

Do not bake tokens into git. `.env` is dockerignored.

6. **Deploy** and wait for the image build

### Local Docker smoke (optional)

Daemon must actually be running.

```bash
docker build \
  --build-arg PUBLIC_SHOPIFY_SHOP="$PUBLIC_SHOPIFY_SHOP" \
  --build-arg PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="$PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN" \
  --build-arg PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN="$PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN" \
  -t midwest-ag-tech .

docker run --rm -p 8080:80 midwest-ag-tech
```

Open `http://localhost:8080` — home, `/products`, a product PDP, add-to-cart. Confirm **product titles** in HTML, not just HTTP 200.

---

## 2. Domains in Coolify

Application → **Configuration** → **Domains**:

- apex + `www` once the client domain is confirmed
- Prefer **one** public host: `https://midwestag.tech`. The app 301s `www` → apex. Also add that redirect in Cloudflare if you can (Page Rule / Redirect Rule).

After go-live: Google Search Console property `midwestag.tech` → submit `https://midwestag.tech/sitemap.xml` → URL inspection on `/`. Ranking for “nebraska drones” is not a deploy checkbox.

Coolify issues Let’s Encrypt. If LE fails while Cloudflare is proxied: grey-cloud DNS first, then re-enable proxy.

---

## 3. Cloudflare DNS

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | BCT droplet IP | Proxied (orange) |
| A | `www` | BCT droplet IP | Proxied (orange) |

**SSL/TLS** → **Full (strict)**  
**Always Use HTTPS** on

---

## 4. Go-live verify

- [ ] Site loads over HTTPS
- [ ] Logo + flyer copy on home
- [ ] `/products` shows Shopify categories/counts
- [ ] A PDP loads; cart drawer opens
- [ ] Brady / Tate phone links work
- [ ] Unknown path is a 404, not a 502

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Empty catalog, 200 OK | Token missing at **build** time, or Storefront field/scope error (see Coolify build/runtime logs) |
| 502 | Port **80** exposed; `HOST=0.0.0.0`; check `node ./dist/server/entry.mjs` in logs |
| `Permission denied (publickey)` | Private repo — deploy key / GitHub App, not public source |
| SSL errors | Full (strict); grey-cloud during first cert |
| Build OOM | Droplet ≥2 GB; this SSR image is heavier than brochure nginx |
| Tokens rotated | Redeploy so Vite rebuilds with new build args |

---

## Cost / packaging (internal)

Shares the BCT Coolify droplet. SSR counts closer to a light app than a static brochure (memory for Node + catalog fetch). Quote Host / Host + care per Samba `Plans/2026-08-22_client-hosting-strategy.md`. Domain owner TBD until registrar is confirmed.
