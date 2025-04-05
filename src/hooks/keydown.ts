import { useEffect } from "react";

export const useKeydown = (keys: string[], handleTrigger: () => void) => {
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent): void => {
			if (keys.includes(e.code)) {
				handleTrigger();
			}
		};
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, []);
}