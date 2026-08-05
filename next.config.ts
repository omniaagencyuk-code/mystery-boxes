import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Review hero and editorial images are CMS driven, so their host is not
    // known ahead of time (Supabase storage, or an admin-pasted https URL).
    // Allow any https host to be optimised. Images are admin-controlled content.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
