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
			const [left, top] = mapToViewport(viewportInfo, selectedObject.bounds.topLeft);
			const [width, height] = selectedObject.bounds.size.mul(viewportInfo.camera.scale);
			return (
				<div className={toClassName(css["selection"], css["rect"])} style={{
					left, top, width, height,
				}}></div>
			);
		}
		case "text": {
			const [left, top] = mapToViewport(viewportInfo, selectedObject.pos);
			return (
				<div className={toClassName(css["selection"], css["circle"])} style={{
					left, top, "--r": `${5 * viewportInfo.camera.scale}px`
				}}></div>
			);
		}
	}
}