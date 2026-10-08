import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* Site ve panel iki ayrı kök layout kullanır; eşleşmeyen adresler için
     tek 404 sayfası app/global-not-found.tsx'te. */
  experimental: { globalNotFound: true },
  /* Canlıda panel görselleri Vercel Blob adresinden gelir */
  images: { remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] },
  turbopack: { root: path.resolve(dirname) },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
