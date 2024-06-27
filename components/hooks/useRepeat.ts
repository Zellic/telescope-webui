import {MutableRefObject, useEffect, useRef} from "react";

/**
 * A custom hook that repeatedly calls a callback function based on specified conditions.
 *
 * @param {boolean} on_mount - Whether to run the callback immediately on mount.
 * @param {number} good_interval - The interval (in milliseconds) to use when shouldInvoke returns true.
 * @param {number} bad_interval - The interval (in milliseconds) to use when shouldInvoke returns false.
 * @param {() => boolean} shouldInvoke - A function that determines whether the callback should be invoked.
 * @param {() => void} callback - The function to be called repeatedly.
 * @param {Array<any>} deps - An array of dependencies that trigger the effect when changed.
 */
export function useRepeatChecked(on_mount: boolean, good_interval: number, bad_interval: number, shouldInvoke: () => boolean, callback: () => void, deps: Array<any>) {
	const interval_id: MutableRefObject<number | NodeJS.Timeout | null> = useRef(null)

	// we use setTimeout here so setInterval doesn't start multiple async calls before the first finishes
	useEffect(() => {
		function wrapped() {
			const c = shouldInvoke()
			if(c) {
				callback()
			}
			interval_id.current = setTimeout(wrapped, c ? good_interval : bad_interval)
		}
		interval_id.current = setTimeout(wrapped, shouldInvoke() ? good_interval : bad_interval)

		return function cleanup() {
			if(interval_id.current !== null) {
				clearTimeout(interval_id.current)
				interval_id.current = null
			}
		}

		// TODO: https://stackoverflow.com/a/68416645
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...deps, good_interval, bad_interval])

	// run once on-mount
	useEffect(() => {
		if(on_mount) {
			callback()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}

/**
 * A custom hook that repeatedly calls a callback function at a specified interval.
 *
 * @param {number | {interval: number, onMount?: boolean}} cfg - The configuration object or interval in milliseconds.
 *   If a number is provided, it's treated as the interval.
 *   If an object is provided:
 *     - interval: The interval in milliseconds between each callback invocation.
 *     - onMount: Whether to run the callback immediately on mount (default: true).
 * @param {() => void} callback - The function to be called repeatedly.
 * @param {Array<any>} deps - An array of dependencies that trigger the effect when changed.
 */
export function useRepeatEvery(cfg: number | {interval: number, onMount?: boolean}, callback: () => void, deps: Array<any>) {
	if(typeof(cfg) === "number")
		cfg = {interval: cfg}
	return useRepeatChecked(cfg.onMount ?? true, cfg.interval, cfg.interval, () => true, callback, deps)
}

/**
 * A custom hook that repeatedly calls a callback function at a specified interval,
 * but only when the document is visible (foreground tab).
 *
 * @param {number | {interval: number, idle_interval?: number, onMount?: boolean}} cfg - The configuration object or interval in milliseconds.
 *   If a number is provided, it's treated as the interval.
 *   If an object is provided:
 *     - interval: The interval in milliseconds between each callback invocation when the document is visible.
 *     - idle_interval: The interval in milliseconds to check visibility when the document is hidden (default: 250).
 *     - onMount: Whether to run the callback immediately on mount (default: true).
 * @param {() => void} callback - The function to be called repeatedly.
 * @param {Array<any>} deps - An array of dependencies that trigger the effect when changed.
 */
export function useRepeatEveryForeground(cfg: number | {interval: number, idle_interval?: number, onMount?: boolean}, callback: () => void, deps: Array<any>) {
	if(typeof(cfg) === "number")
		cfg = {interval: cfg}
	return useRepeatChecked(cfg.onMount ?? true, cfg.interval, cfg.idle_interval ?? 250, () => !document.hidden, callback, deps)
}