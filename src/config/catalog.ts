export const catalogCategories = [
  {
    slug: "drones",
    label: "Drones",
    navLabel: "Drones",
    intro: "Agricultural drones and complete drone kits for Nebraska and South Dakota operations.",
    seoTitle: "Agricultural Drones in Nebraska & South Dakota",
    seoDescription:
      "Shop agricultural drones and drone kits from Midwest Ag Technologies in Creighton, Nebraska. Spray drones, parts support, and local training for Nebraska and South Dakota farms.",
    types: ["Drone", "Drone Kit"],
  },
  {
    slug: "trailers",
    label: "Trailers",
    navLabel: "Trailers",
    intro: "Spray-ready and standalone trailers for ag drone work in Nebraska and South Dakota.",
    seoTitle: "Ag Drone Trailers in Nebraska & South Dakota",
    seoDescription:
      "Agricultural drone trailers from Midwest Ag Technologies in Creighton, Nebraska. Call to confirm what’s in stock.",
    types: ["Trailer"],
  },
  {
    slug: "accessories",
    label: "Drone & Trailer Accessories",
    navLabel: "Accessories",
    intro: "Chargers, covers, RTK, nozzles, trailer add-ons, and other field accessories.",
    seoTitle: "Ag Drone Accessories in Nebraska & South Dakota",
    seoDescription:
      "Drone and trailer accessories for agricultural spray drones. Midwest Ag Technologies, Creighton, Nebraska — serving Nebraska and South Dakota.",
    types: [
      "Accessory",
      "Drone Accessories",
      "Trailer Add-On",
      "Charger",
      "T60 Parts",
    ],
  },
  {
    slug: "parts",
    label: "Drone service parts",
    navLabel: "Service parts",
    intro: "Replacement parts for Agras airframes, generators, and chargers.",
    seoTitle: "Ag Drone Service Parts in Nebraska & South Dakota",
    seoDescription:
      "Service parts for agricultural drones from Midwest Ag Technologies in Creighton, Nebraska. We support growers in Nebraska and South Dakota.",
    types: [
      "Drone Parts",
      "T60X Parts",
      "Generator Parts",
      "Part",
      "Generator",
      "C12000 Charger Parts",
    ],
  },
] as const;

export type CatalogSlug = (typeof catalogCategories)[number]["slug"];

const typeToSlug = new Map<string, CatalogSlug>();
for (const category of catalogCategories) {
  for (const type of category.types) {
    typeToSlug.set(type, category.slug);
  }
}

export function categorySlugForType(productType: string | undefined | null): CatalogSlug {
  const type = (productType ?? "").trim();
  const exact = typeToSlug.get(type);
  if (exact) return exact;

  const lower = type.toLowerCase();
  if (lower === "drone" || lower === "drone kit") return "drones";
  if (lower === "trailer") return "trailers";
  if (
    lower.includes("accessor") ||
    lower.includes("charger") ||
    lower.includes("add-on") ||
    lower.includes("addon")
  ) {
    return "accessories";
  }
  return "parts";
}

export function getCatalogCategory(slug: string) {
  return catalogCategories.find((category) => category.slug === slug);
}
