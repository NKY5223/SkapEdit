import { useRef } from "react"

export const useTimeout = (ms: number): [timeout: (f: () => void) => void, cancel: () => void] => {
	const id = useRef(-1);

	const timeout = (f: () => void) => {
		cancel();
		id.current = setTimeout(f, ms);
	}
	const cancel = () => {
		clearTimeout(id.current);
	}

	return [timeout, cancel];
}