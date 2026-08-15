import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "atendeBR";
const basePath = isGitHubPages ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pkcuhoudvkvtunjlpidb.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrY3Vob3Vkdmt2dHVuamxwaWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNDQzNTcsImV4cCI6MjA5OTgyMDM1N30.s9pGnpxszR8sei3JoVEjfmkJ-E6fg3ZnFmsMMDr4um4",
  },
};

export default nextConfig;
