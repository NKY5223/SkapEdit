import { clamp } from "@common/number.ts";
import { createId } from "@common/uuid.ts";
import { makeSection, Sections, makeSingle } from "@components/contextmenu/ContextMenu.ts";
import { useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { toClassName } from "@components/utils.tsx";
import { useDrag } from "@hooks/useDrag.ts";
import { KeyboardEventHandler, ReactNode, useRef } from "react";
import { Layout, LayoutFC, useDispatchLayout } from "./layout.ts";
import css from "./LayoutSplit.module.css";
import { elementIsRtl } from "@hooks/elementIsRtl.ts";

const KeyMap = {
	x: ["ArrowLeft", "ArrowRight"],
	y: ["ArrowUp", "ArrowDown"],
} as const;

type LayoutSplitProps = {
	children: [ReactNode, ReactNode];
};
export const LayoutSplit: LayoutFC<Layout.NodeSplit, LayoutSplitProps> = ({
	node,
	children: [first, second],
}) => {
	const { ratio, axis } = node;
	const dispatch = useDispatchLayout();
	const setRatio = (ratio: number) => dispatch({
		type: "set_ratio",
		targetNode: node.id,
		ratio: clamp(0, 1)(ratio),
	});
	const splitRef = useRef<HTMLDivElement>(null);

	const { handlePointerDown: startDrag, dragging: resizing } = useDrag(0, splitRef, curr => {
		setRatio(axis === "x" ? curr[0] : curr[1]);
	});

	const handleClassName = toClassName(
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
			ratio: node.ratio,
		}
	});
	const layoutItems = axis === "x"
		? [
			makeSingle("layout.dissolve-left", "keyboard_tab_rtl",
				() => dispatch({
					type: "replace",
					targetNode: node.id,
					replacement: node.second,
				})),
			makeSingle("layout.dissolve-right", "keyboard_tab",
				() => dispatch({
					type: "replace",
					targetNode: node.id,
					replacement: node.first,
				})),
			makeSingle("layout.swap-x", "swap_horiz", swap),
		]
		: [
			makeSingle("layout.dissolve-up", "vertical_align_top",
				() => dispatch({
					type: "replace",
					targetNode: node.id,
					replacement: node.second,
				})),
			makeSingle("layout.dissolve-down", "vertical_align_bottom",
				() => dispatch({
					type: "replace",
					targetNode: node.id,
					replacement: node.first,
				})),
			makeSingle("layout.swap-y", "swap_vert", swap),
		];
	const contextMenu = useContextMenu([
		makeSection(Sections.layout, layoutItems),
	]);
	const handleKeyDown: KeyboardEventHandler = e => {
		const [less, more] = KeyMap[axis];
		const dir =
			(e.code === less ? -1 : e.code === more ? 1 : 0)
			* (axis === "x" && splitRef.current && elementIsRtl(splitRef.current) ? -1 : 1);
		
		setRatio(ratio + 0.025 * dir);
	}

	return (
		<div ref={splitRef} className={`${css.split} ${css[`split-${axis}`]}`}
			style={{ "--ratio": `${ratio * 100}%` }}
		>
			<div className={css["split-child"]}>{first}</div>
			<div className={handleClassName} {...contextMenu}
				onPointerDown={startDrag}
				onKeyDown={handleKeyDown}
				tabIndex={0}>
				<div className={css.interaction}></div>
				<div className={css.visual}></div>
			</div>
			<div className={css["split-child"]}>{second}</div>
		</div>
	);
}

export const makeSplit = (axis: "x" | "y", ratio: number, first: Layout.Node, second: Layout.Node): Layout.NodeSplit => ({
	type: "split",
	id: createId("layout.split"),
	axis,
	first,
	second,
	ratio,
});
export const makeSplitX = (ratio: number, left: Layout.Node, right: Layout.Node) =>
	makeSplit("x", ratio, left, right);
export const makeSplitY = (ratio: number, top: Layout.Node, bottom: Layout.Node) =>
	makeSplit("y", ratio, top, bottom);