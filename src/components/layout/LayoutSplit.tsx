import { clamp } from "@common/number.ts";
import { createId } from "@common/uuid.ts";
import { section, single } from "@components/contextmenu/ContextMenu.tsx";
import { useContextMenu } from "@components/contextmenu/context.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { classList } from "@components/utils.tsx";
import { useDrag } from "@hooks/useDrag.ts";
import { ReactNode, useRef } from "react";
import { Layout, LayoutFC } from "./Layout.tsx";
import css from "./LayoutSplit.module.css";

type LayoutSplitProps = {
	children: [ReactNode, ReactNode];
};
export const LayoutSplit: LayoutFC<Layout.NodeSplit, LayoutSplitProps> = ({
	dispatchLayout: dispatch,
	node,
	children: [first, second],
}) => {
	const { ratio, axis } = node;
	const setRatio = (ratio: number) => dispatch({
		type: "set_ratio",
		targetNode: node.id,
		ratio,
	});
	const wrapperRef = useRef<HTMLDivElement>(null);

	const { handlePointerDown: startDrag, dragging: resizing } = useDrag(0, wrapperRef, curr => {
		setRatio(clamp(0, 1)(axis === "x" ? curr[0] : curr[1]));
	});

	const handleClassName = classList(
		css["handle"],
		resizing && css["resizing"],
	);

	const swap = () => dispatch({
		type: "replace",
		targetNode: node.id,
		replacement: {
			...node,
			first: node.second,
			second: node.first,
			ratio: 1 - node.ratio,
		}
	});
	const layoutItems = node.axis === "x"
		? [
			single("dissolve-left",
				<Translate k="layout.split.dissolve-left" />, "arrowbar-left",
				() => dispatch({
					type: "replace",
					targetNode: node.id,
					replacement: node.second,
				})),
			single("dissolve-right",
				<Translate k="layout.split.dissolve-right" />, "arrowbar-right",
				() => dispatch({
					type: "replace",
					targetNode: node.id,
					replacement: node.first,
				})),
			single("swap", (<Translate k="layout.split.swap-x" />), "arrow-x", swap),
		]
		: [
			single("dissolve-up",
				<Translate k="layout.split.dissolve-up" />, "arrowbar-up",
				() => dispatch({
					type: "replace",
					targetNode: node.id,
					replacement: node.second,
				})),
			single("dissolve-down",
				<Translate k="layout.split.dissolve-down" />, "arrowbar-down",
				() => dispatch({
					type: "replace",
					targetNode: node.id,
					replacement: node.first,
				})),
			single("swap", (<Translate k="layout.split.swap-y" />), "arrow-y", swap),
		];
	const handleContextMenu = useContextMenu([
		section("layout", (<Translate k="layout" />), null, layoutItems),
	]);

	return (
		<div ref={wrapperRef} className={`${css.split} ${css[`split-${axis}`]}`}
			style={{ "--ratio": `${ratio * 100}%` }}
		>
			<div className={css["split-child"]}>{first}</div>
			<div className={css["split-child"]}>{second}</div>
			<div className={handleClassName} onPointerDown={startDrag} onContextMenu={handleContextMenu}>
				<div className={css.interaction}></div>
				<div className={css.visual}></div>
			</div>
		</div>
	);
}

export const makeSplit = (axis: "x" | "y", ratio: number, first: Layout.Node, second: Layout.Node): Layout.NodeSplit => ({
	type: "split",
	id: createId(),
	axis,
	first,
	second,
	ratio,
});
export const makeSplitX = (ratio: number, left: Layout.Node, right: Layout.Node) => 
	makeSplit("x", ratio, left, right);
export const makeSplitY = (ratio: number, top: Layout.Node, bottom: Layout.Node) => 
	makeSplit("y", ratio, top, bottom);