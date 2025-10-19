import { toClassName } from "@components/utils.tsx";
import { ViewportLayerFC } from "../Viewport.tsx";
import { mapToViewport, mapToViewportCenter } from "../utils.tsx";
import css from "./text.module.css";

export const TextLayer: ViewportLayerFC = ({ viewportInfo }) => {
	const { 
		camera, 
		room: map
	} = viewportInfo;

	const objs = map.objects.values().filter(o => o.type === "text").toArray();
	const bgClass = toClassName(
		css["text"],
		css["bg"],
	);
	const bg = objs.map(obj => {
		const pos = mapToViewportCenter(viewportInfo, obj.pos);
		return (
			<span key={obj.id} className={bgClass} aria-hidden style={{
				"--text-x": `${pos[0]}px`,
				"--text-y": `${pos[1]}px`,
			}}>{obj.text}</span>
		);
	});
	const fgClass = toClassName(
		css["text"],
		css["fg"],
	);
	const fg = objs.map(obj => {
		const pos = mapToViewportCenter(viewportInfo, obj.pos);
		return (
			<span key={obj.id} className={fgClass} style={{
				"--text-x": `${pos[0]}px`,
				"--text-y": `${pos[1]}px`,
			}}>{obj.text}</span>
		);
	});
	const textSize = 5 * camera.scale;

	const className = toClassName(
		css["text-container"]
	);
	return (
		<div className={className} style={{
			"--text-size": `${textSize}px`,
		}}>
			{bg}
			{fg}
		</div>
	);
}