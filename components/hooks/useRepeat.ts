import { useEffect, useRef, useCallback } from 'react';

type AsyncCallback = () => Promise<void>;

/**
 * Calls a callback every N milliseconds.
 *
 * @param delay how often to call the callback
 * @param callback the async callback to be triggered
 * @param dependencies any React dependencies used within the callback
 */
export function useAsyncInterval(
	delay: number,
	callback: AsyncCallback,
	dependencies: any[] = []
) {
	const savedCallback = useRef<AsyncCallback>();
	const isRunning = useRef(false);

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	const tick = useCallback(async () => {
		if (!isRunning.current) {
			isRunning.current = true;
			try {
				await savedCallback.current?.();
			} finally {
				isRunning.current = false;
			}
		}
	}, []);

	useEffect(() => {
		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay, tick, ...dependencies]);
}

function useTabVisibility() {
	const isVisibleRef = useRef(true);

	useEffect(() => {
		const handleVisibilityChange = () => {
			isVisibleRef.current = !document.hidden;
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, []);

	return isVisibleRef;
}

/**
 * Calls a callback every N milliseconds, but only while this tab is active.
 *
 * @param delay how often to call the callback
 * @param callback the async callback to be triggered
 * @param dependencies any React dependencies used within the callback
 */
export function useAsyncIntervalForeground(
	delay: number,
	callback: AsyncCallback,
	dependencies: any[] = []
) {
	const isVisibleRef = useTabVisibility();

	const wrappedCallback = useCallback(async () => {
		if (isVisibleRef.current) {
			await callback();
		}
	}, [callback]);

	useAsyncInterval(delay, wrappedCallback, dependencies);
}