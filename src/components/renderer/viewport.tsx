import { useEffect, useRef } from "react";
import { ViewportLayer } from "./layer.ts";
import "./viewport.css";

export function Viewport({ renderers }: { renderers: ViewportLayer[] }) {
	const viewportRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) throw new Error("Viewport element is null.");

		viewport.replaceChildren();
		renderers.sort((a, b) => a.zIndex - b.zIndex);
		renderers.forEach((renderer, i) => {
			const prev = renderers[i - 1];
			if (renderer.canInitWith(prev)) {
				renderer.init(prev);
			} else {
				renderer.init();
			}
		}, null);
		viewport.append(...renderers.map(renderer => renderer.element));
		renderers.forEach(renderer => renderer.render([]));
	}, []);
	return (
		<div className="viewport" ref={viewportRef}>
		</div>
	);
}