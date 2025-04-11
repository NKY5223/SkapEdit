import { ReactNode, useRef } from "react";
import css from "./LayoutSplit.module.css";
import { LayoutDesc, LayoutDescSplit, LayoutFC } from "./Layout.tsx";
import { useDrag } from "../../hooks/useDrag.ts";
import { classList } from "../utils.tsx";
import { clamp } from "../../common/number.ts";
import { createId } from "../../common/uuid.ts";
import { single } from "@components/contextmenu/ContextMenu.tsx";
import { useContextMenu } from "@components/contextmenu/context.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { NewIcon } from "@components/icon/NewIcon.tsx";

type LayoutSplitProps = {
	children: [ReactNode, ReactNode];
};
export const LayoutSplit: LayoutFC<LayoutDescSplit, LayoutSplitProps> = ({
	dispatch,
	desc,
	children: [first, second],
}) => {
	const { ratio, axis } = desc;
	const setRatio = (ratio: number) => dispatch({
		type: "set_ratio",
		ratio,
		target: desc
	});
	const wrapperRef = useRef<HTMLDivElement>(null);

	const { handlePointerDown: startDrag, dragging: resizing } = useDrag(0, wrapperRef, curr => {
		setRatio(clamp(0, 1)(axis === "x" ? curr[0] : curr[1]));
	});

	const handleClassName = classList(
		css["handle"],
		resizing && css["resizing"],
	);

	const handleContextMenu = useContextMenu(desc.axis === "x" ? [
		single("dissolve-left",
			<Translate k="layout.split.dissolve-left" />, "chevron-left",
			() => dispatch({
				type: "replace",
				target: desc,
				desc: desc.second,
			})),
		single("dissolve-right",
			<Translate k="layout.split.dissolve-right" />, "chevron-right",
			() => dispatch({
				type: "replace",
				target: desc,
				desc: desc.first,
			})),
	] : [
		single("dissolve-up",
			<Translate k="layout.split.dissolve-up" />, "chevron-up",
			() => dispatch({
				type: "replace",
				target: desc,
				desc: desc.second,
			})),
		single("dissolve-down",
			<Translate k="layout.split.dissolve-down" />, "chevron-down",
			() => dispatch({
				type: "replace",
				target: desc,
				desc: desc.first,
			})),
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
export const makeLayoutSplit = (axis: "x" | "y", first: LayoutDesc, second: LayoutDesc, ratio: number): LayoutDescSplit => ({
	type: "split",
	id: createId(),
	axis,
	first,
	second,
	ratio,
});