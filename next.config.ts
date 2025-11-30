import type { NextConfig } from "next";

const repoBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const normalizedBasePath =
  repoBasePath && repoBasePath !== "/"
    ? `/${repoBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";

const nextConfig: NextConfig = {
  // Use static export so the site can be hosted on GitHub Pages.
  output: "export",
  // Base path is needed when serving under https://<user>.github.io/<repo>/.
  basePath: normalizedBasePath || undefined,
  assetPrefix: normalizedBasePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
