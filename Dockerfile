# Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines PUBLIC_* at build. Coolify: mark these Available at Buildtime.
ARG PUBLIC_SHOPIFY_SHOP
ARG PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
ARG PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN
ENV PUBLIC_SHOPIFY_SHOP=$PUBLIC_SHOPIFY_SHOP
ENV PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=$PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
ENV PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=$PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN

RUN npm run build
RUN npm prune --omit=dev

# Runtime — Astro SSR (Shopify Storefront). Not nginx-static.
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 80

CMD ["node", "./dist/server/entry.mjs"]
