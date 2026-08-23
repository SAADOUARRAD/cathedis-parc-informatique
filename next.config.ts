import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['nodemailer', 'bcryptjs'],
};

export default nextConfig;
