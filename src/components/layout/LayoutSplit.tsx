import { ReactNode, useState, useRef, useEffect } from "react";
import css from "./Layout.module.css";
import { LayoutDescSplit, LayoutFC } from "./Layout.tsx";

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
	const [resizing, setResizing] = useState(false);

	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!resizing) return;
		const handleMove = (e: PointerEvent): void => {
			const wrapper = wrapperRef.current;
			if (!wrapper) return;

			const bounds = wrapper.getBoundingClientRect();

			e.preventDefault();
			const pointerPos = axis === "x" ? e.clientX : e.clientY;
			const wrapperPos = axis === "x" ? bounds.left : bounds.top;
			const wrapperSize = axis === "x" ? bounds.width : bounds.height;
			setRatio(Math.min(Math.max(0, (pointerPos - wrapperPos) / wrapperSize), 1));
		};
		window.addEventListener("pointermove", handleMove);
		return () => window.removeEventListener("pointermove", handleMove);
	}, [resizing]);
	useEffect(() => {
		const handleStop = () => setResizing(false);
		window.addEventListener("pointerup", handleStop);
		window.addEventListener("blur", handleStop);

		return () => {
			window.removeEventListener("pointerup", handleStop);
			window.removeEventListener("blur", handleStop);
		}
	});
	
	return (
		<div ref={wrapperRef} className={`${css.split} ${css[`split-${axis}`]}`}
			style={{ "--ratio": `${ratio * 100}%` }}
		>
			<div className={css["split-child"]}>{first}</div>
			<div className={css["split-child"]}>{second}</div>
			<div className={`${css.handle} ${resizing ? css.resizing : ""}`} 
				onPointerDown={e => (e.preventDefault(), setResizing(true))} 
				onPointerUp={() => setResizing(false)}>
				<div className={css.interaction}></div>
				<div className={css.visual}></div>
			</div>
		</div>
	);
}