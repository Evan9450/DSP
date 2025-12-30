/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://192.168.5.9:8000/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
