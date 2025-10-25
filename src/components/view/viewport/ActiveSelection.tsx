import { FC } from "react";
import { useEditorSelection } from "@components/editor/selection.ts";
import { getObject, useSkapMap } from "@editor/map.ts";
import css from "./ActiveSelection.module.css";
import { ViewportInfo } from "./Viewport.tsx";
import { mapToViewport } from "./utils.tsx";
import { toClassName } from "@components/utils.tsx";

type ActiveSelectionProps = {
	viewportInfo: ViewportInfo;
};
export const ActiveSelection: FC<ActiveSelectionProps> = ({
	viewportInfo,
}) => {
	const selection = useEditorSelection();
	if (!selection) return null;

	const map = useSkapMap();
	const selectedObject = getObject(map, selection);
	if (!selectedObject) return null;

	switch (selectedObject.type) {
		case "obstacle":
		case "lava": {
			const [x, y] = selectedObject.bounds.topLeft;
			const [w, h] = selectedObject.bounds.size;
			return (
				<div className={toClassName(css["selection"], css["rect"])} style={{
					"--x": `${x}px`, 
					"--y": `${y}px`,
					"--w": `${w}px`,
					"--h": `${h}px`,
				}}></div>
			);
		}
		case "text": {
			const [x, y] = selectedObject.pos;
			return (
				<div className={toClassName(css["selection"], css["circle"])} style={{
					"--x": `${x}px`, 
					"--y": `${y}px`,
					"--r": `5px`,
				}}></div>
			);
		}
	}
}