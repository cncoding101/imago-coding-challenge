import { useEffect, type ReactNode } from 'react';
import Swal from 'sweetalert2';

interface GlobalErrorHandlerProps {
	children: ReactNode;
}

export const GlobalErrorHandler = ({ children }: GlobalErrorHandlerProps) => {
	useEffect(() => {
		const handleRejection = (event: PromiseRejectionEvent) => {
			const error = event.reason;
			const message = error instanceof Error ? error.message : 'An unknown error occurred';

			Swal.fire({
				icon: 'error',
				text: message,
				confirmButtonText: 'OK',
				heightAuto: false
			});
		};

		const handleError = (event: ErrorEvent) => {
			const message = event.message || 'An unknown error occurred';

			Swal.fire({
				icon: 'error',
				title: 'Application Error',
				text: message,
				confirmButtonText: 'OK',
				heightAuto: false
			});
		};

		window.addEventListener('unhandledrejection', handleRejection);
		window.addEventListener('error', handleError);

		return () => {
			window.removeEventListener('unhandledrejection', handleRejection);
			window.removeEventListener('error', handleError);
		};
	}, []);

	return children;
};
