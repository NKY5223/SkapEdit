import { ReactNode, useState, useRef, useEffect } from "react";
import css from "./LayoutSplit.module.css";
import { LayoutDescSplit, LayoutFC } from "./Layout.tsx";
import { useDrag } from "../../hooks/drag.ts";
import { classList } from "../utils.tsx";
import { clamp } from "../../common/number.ts";

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
	return (
		<div ref={wrapperRef} className={`${css.split} ${css[`split-${axis}`]}`}
			style={{ "--ratio": `${ratio * 100}%` }}
		>
			<div className={css["split-child"]}>{first}</div>
			<div className={css["split-child"]}>{second}</div>
			<div className={handleClassName} onPointerDown={startDrag} >
				<div className={css.interaction}></div>
				<div className={css.visual}></div>
			</div>
		</div>
	);
}