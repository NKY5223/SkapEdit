import { vec2 } from "@common/vec2.ts";
import { RefObject, useEffect, useState } from "react";

export function useElementSize(ref: RefObject<HTMLElement | null>) {
	const [size, setSize] = useState(vec2(1));

	useEffect(() => {
		const el = ref.current;
		if (!el) {
			return;
		}
		const handleWindowResize = (_: UIEvent | ResizeObserverEntry[]) => {
			const newSize = vec2(
				el.offsetWidth,
				el.offsetHeight,
			);
			if (newSize.equal(size)) return;
			setSize(newSize);
		};

		const observer = new ResizeObserver(entries => {
			const last = entries.at(-1);
			if (!last) return;
			const newSize = vec2(
				Math.max(1, ...last.borderBoxSize.map(s => s.inlineSize)),
				Math.max(1, ...last.borderBoxSize.map(s => s.blockSize)),
			);
			if (newSize.equal(size)) return;
			setSize(newSize);
		});

		observer.observe(el);
		window.addEventListener("resize", handleWindowResize);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", handleWindowResize);
		};
	}, [ref.current]);
	return size;
}