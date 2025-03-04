import { useEffect, useRef, useState } from "react";
import { ViewportLayer } from "./layer.ts";
import "./viewport.css";
import { Button } from "../form/Button.tsx";
import { type Bounds } from "../editor/Bounds.ts";
import { cross, range } from "../../utils.ts";
import { Icon } from "../icon/Icon.tsx";

type ViewportProps = {
	renderers: ViewportLayer[];
};
type Camera = {
	x: number;
	y: number;
	scale: number;
}

export function Viewport({ 
	renderers
}: ViewportProps) {
	const rendererWrapperRef = useRef<HTMLDivElement>(null);
	const infoRef = useRef<HTMLPreElement>(null);

	const [cameraX, setCameraX] = useState<number>(0);
	const [cameraY, setCameraY] = useState<number>(0);
	const [cameraScale, setCameraScale] = useState<number>(10);

	const cameraRef = useRef<Camera>();
	cameraRef.current = { x: cameraX, y: cameraY, scale: cameraScale };

	useEffect(() => {
		const viewport = rendererWrapperRef.current;
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


		const abortController = new AbortController();
		
		let prevT = performance.now();
		function render(t: DOMHighResTimeStamp) {
			if (abortController.signal.aborted) return;
			
			const dt = t - prevT;
			if (!viewport) throw new Error("Viewport is null.");
			const camera = cameraRef.current;
			if (!camera) throw new Error("Camera is null.");
			const info = infoRef.current;
			if (!info) throw new Error("Info panel is null.");

			const cameraW = viewport.clientWidth;
			const cameraH = viewport.clientHeight;
			const things = cross<[number, number], Bounds>(
				(x, y) => ({
					left: x,
					right: x + 1.9,
					top: y,
					bottom: y + 1.9,
				}),
				range(10, -10, 2),
				range(10, -10, 2),
			);
			const cameraData = {
				...camera,
				width: cameraW,
				height: cameraH,
			};
			renderers.forEach(renderer => {
				const filtered = things.filter(thing => renderer.canRender(thing));
				renderer.render(cameraData, filtered);
			});

			const end = performance.now();

			const frameTime = end - t;
			prevT = t;
			info.textContent = [
				`frame: ${frameTime.toFixed(3)}ms`,
				`dt: ${dt.toFixed(3)}ms`,
			].join("\n");

			window.requestAnimationFrame(render);
		}
		window.requestAnimationFrame(render);

		return () => {
			abortController.abort();
		}
	}, [rendererWrapperRef.current]);
	return (
		<div className="viewport">
			<div className="renderers" ref={rendererWrapperRef}></div>
			<div className="buttons">
				<Button onClick={() => setCameraX(x => x - Math.PI)}></Button>
				<Button onClick={() => setCameraX(x => x + Math.PI)}></Button>
				<Button onClick={() => setCameraY(y => y - Math.PI)}></Button>
				<Button onClick={() => setCameraY(y => y + Math.PI)}></Button>
				<Button onClick={() => setCameraScale(scale => scale * (Math.PI / 2))}></Button>
				<Button onClick={() => setCameraScale(scale => scale / (Math.PI / 2))}></Button>
			</div>
			<pre className="info" ref={infoRef}></pre>
		</div>
	);
}