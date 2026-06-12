import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nigerian Restaurants in England",
    short_name: "Naija Food",
    description:
      "A mobile-friendly guide to Nigerian and West African restaurants across Kent and London.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#1f2a24",
    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
