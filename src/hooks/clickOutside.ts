import { RefObject, useEffect } from "react";

export const useClickOutside = <T extends Element>(
	targetRef: RefObject<T>,
	handleClickOutside: (event: MouseEvent) => void,
) => {
	useEffect(() => {
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
	}, []);
}