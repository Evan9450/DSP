'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const [isReloading, setIsReloading] = useState(false);

	useEffect(() => {
		// 静默截获并自动恢复部署过渡期因前后端包不一致导致的报错
		const errorMessage = error.message?.toLowerCase() || '';
		if (
			errorMessage.includes('server action mismatch') ||
			errorMessage.includes('fetch failed') ||
			errorMessage.includes('next.js server action') ||
			errorMessage.includes('failed to fetch') ||
			errorMessage.includes('loading chunk')
		) {
			setIsReloading(true);
			window.location.reload();
		}
	}, [error]);

	if (isReloading) {
		// 若识别为过渡期报错且正在重载，则不渲染错误页面
		return null;
	}

	return (
		<div className='flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-4 text-center'>
			<div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6'>
				<AlertCircle className='w-8 h-8 text-destructive' />
			</div>

			{process.env.NODE_ENV === 'development' && (
				<div className='mb-8 p-4 bg-muted text-left text-xs rounded-md w-full max-w-2xl overflow-auto text-muted-foreground whitespace-pre-wrap'>
					{error.message}
					{'\n\n'}
					{error.stack}
				</div>
			)}
		</div>
	);
}
