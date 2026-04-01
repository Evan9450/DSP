'use client';

import { useState } from 'react';

interface LazyImgProps {
	src: string;
	alt: string;
	className?: string;
	onClick?: () => void;
}

/**
 * 带 loading 动画的懒加载图片组件。
 * 图片加载期间显示旋转 spinner，加载完成后以 opacity 过渡淡入。
 */
export function LazyImg({ src, alt, className, onClick }: LazyImgProps) {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div className='relative w-full h-full' onClick={onClick}>
			{isLoading && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
					<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500' />
				</div>
			)}
			<img
				src={src}
				alt={alt}
				loading='lazy'
				className={`${className} transition-opacity duration-300 ${
					isLoading ? 'opacity-0' : 'opacity-100'
				}`}
				onLoad={() => setIsLoading(false)}
				onError={() => setIsLoading(false)}
			/>
		</div>
	);
}
