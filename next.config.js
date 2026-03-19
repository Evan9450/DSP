/** @type {import('next').NextConfig} */

const nextConfig = {
	output: 'standalone',
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
		],
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/:path*`,
			},
		];
	},
	//no-cache for HTML, immutable for static assets
	async headers() {
		return [
			{
				source: '/_next/static/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable', // 静态资源永久缓存（因为文件名带 hash）
					},
				],
			},
			{
				source: '/:path*', // HTML 页面不缓存
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate',
					},
				],
			},
		];
	},
};

module.exports = nextConfig;
