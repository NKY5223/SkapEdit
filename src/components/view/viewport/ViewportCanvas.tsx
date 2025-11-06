import { FC } from "react";
import css from "./Viewport.module.css";
import { ViewportLayerFC, ViewportInfo } from "./Viewport.tsx";

type ViewportCanvasProps = {
	layers: ViewportLayerFC[];
	viewportInfo: ViewportInfo;
} & React.HTMLAttributes<HTMLDivElement>;

export const ViewportCanvas: FC<ViewportCanvasProps> = ({
	layers, viewportInfo,
	...attrs
}) => {
	return (
		<div className={css["viewport-canvas"]} {...attrs}>
			{
				layers.map((Layer, i) => (
					<Layer key={i} viewportInfo={viewportInfo} />
				))
			}
		</div>
	);
}