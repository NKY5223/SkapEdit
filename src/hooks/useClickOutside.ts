import { RefObject, useEffect } from "react";

export const useClickOutside = <T extends Element>(
	targetRef: RefObject<T | null>,
	condition: boolean,
	handleClickOutside: (event: MouseEvent) => void,
) => {
	useEffect(() => {
		if (!condition) {
			return;
		}
		const handleClick = (e: MouseEvent) => {
			const parent = targetRef.current;
			if (!parent) return;
			const child = e.target;
			if (!(child instanceof Node)) return;
			if (parent.contains(child)) return;
			handleClickOutside(e);
		}
		window.addEventListener("click", handleClick);
		return () => window.removeEventListener("click", handleClick);
	}, [condition]);
}