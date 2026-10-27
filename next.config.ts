import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Supabase uploads (foto profil & lampiran) lewat Server Action.
      // Vercel membatasi body request; 4 MB aman untuk file maksimal 3 MB.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
