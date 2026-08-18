import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "stasks",
    short_name: "stasks",
    description: "Plan tonight. Do it tomorrow. Be kind to misses.",
    start_url: "/today",
    display: "standalone",
    background_color: "#F7F7F7",
    theme_color: "#F7F7F7",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
