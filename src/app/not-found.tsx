import { Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className='fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4 z-50'>
			<div className='text-center max-w-md'>
				{/* 404 Large Text */}
				<div className='mb-8'>
					<h1 className='text-9xl font-bold text-blue-700 opacity-20'>
						404
					</h1>
					<div className='-mt-16'>
						<h2 className='text-4xl font-bold text-gray-900 mb-4'>
							Page Not Found
						</h2>
						<p className='text-gray-600 mb-8'>
							The page you're looking for doesn't exist or has
							been moved.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
