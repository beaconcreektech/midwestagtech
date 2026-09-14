export const catalogCategories = [
  {
    slug: "drones",
    label: "Drones",
    navLabel: "Drones",
    intro: "Agricultural drones and complete drone kits.",
    types: ["Drone", "Drone Kit"],
  },
  {
    slug: "trailers",
    label: "Trailers",
    navLabel: "Trailers",
    intro: "Spray-ready and standalone trailers.",
    types: ["Trailer"],
  },
  {
    slug: "accessories",
    label: "Drone & Trailer Accessories",
    navLabel: "Accessories",
    intro: "Chargers, covers, RTK, nozzles, trailer add-ons, and other field accessories.",
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
