import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyOS",
    short_name: "MyOS",
    description: "Personal Operating System designed specifically around daily life",
    start_url: "/",
    display: "standalone",
    background_color: "#09090B",
    theme_color: "#5E0ED7",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
