import { classList } from "@components/utils.tsx";
import { mapToViewport, ViewportLayerFC } from "../Viewport.tsx";
import css from "./text.module.css";

export const TextLayer: ViewportLayerFC = ({ viewportInfo }) => {
	const { 
		camera, 
		map
	} = viewportInfo;

	const objs = map.objects.filter(o => o.type === "text");
	const bgClass = classList(
		css["text"],
		css["bg"],
	);
	const bg = objs.map(obj => {
		const pos = mapToViewport(viewportInfo, obj.pos);
		return (
			<span key={obj.id} className={bgClass} style={{
				"--text-x": `${pos[0]}px`,
				"--text-y": `${pos[1]}px`,
			}}>{obj.text}</span>
		);
	});
	const fgClass = classList(
		css["text"],
		css["fg"],
	);
	const fg = objs.map(obj => {
		const pos = mapToViewport(viewportInfo, obj.pos);
		return (
			<span key={obj.id} className={fgClass} style={{
				"--text-x": `${pos[0]}px`,
				"--text-y": `${pos[1]}px`,
			}}>{obj.text}</span>
		);
	});
	const textSize = 5 * camera.scale;

	const className = classList(
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