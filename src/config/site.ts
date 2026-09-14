export const site = {
  name: "Midwest Ag Technologies",
  legalName: "Midwest Ag Technologies, LLC",
  tagline: "New technology. Practical solutions. Local support.",
  headline: "Technology Built for Today's Agriculture.",
  description:
    "At Midwest Ag Technologies, we help farmers and ag businesses adopt new technology with confidence. From agricultural drones and robotics to service, parts, and training, we provide practical solutions built for real-world operations.",
  location: "Creighton, NE",
  logo: "/logo.png",
  people: [
    { name: "Brady Wortman", phone: "402-360-3371", tel: "tel:+14023603371" },
    { name: "Tate Thoene", phone: "402-841-4458", tel: "tel:+14028414458" },
  ],
  services: [
    "Agricultural Drone Sales",
    "Agricultural Robotics",
    "Parts & Accessories",
    "Service & Repair",
    "Equipment Training",
    "Emerging Ag Technology",
  ],
  nav: [
    { href: "/products", label: "Products" },
    { href: "/solutions", label: "Solutions" },
    { href: "/support", label: "Support" },
    { href: "/about", label: "About Us" },
  ],
} as const;
