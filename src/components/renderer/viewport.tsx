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

		const cameraX = 0;
		const cameraY = 0;
		const cameraW = viewport.clientWidth;
		const cameraH = viewport.clientHeight;
		const scale = 10;

		renderers.forEach(renderer => renderer.render(
			{
				x: cameraX,
				y: cameraY, 
				width: cameraW, 
				height: cameraH, 
				scale,
			},
			[]
		));
	}, []);
	return (
		<div className="viewport" ref={viewportRef}>
		</div>
	);
}