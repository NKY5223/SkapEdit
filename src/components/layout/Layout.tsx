import { ReactNode, useState } from "react";
import css from "./Layout.module.css";
import { Button } from "../form/Button.tsx";
import { Inspector } from "../inspector/Inspector.tsx";

/* 
Goal:
Be able to edit some arbitrary data with multiple views
tagged data?

data
| Layout
|	> split
|		> view
|-----------> viewport (map)
|		> view
|-----------> inspector (map)
|	> floating
|		> view
|-----------> stats (all)
|	> floating
|	 	> view
|-----------> ??? (some other field in data)
*/

// almost top-level component
export function Layout() {
	return (
		<div className={css.layout}>
			<ViewSplit axis="y" ratio={.6}>
				<div><Button>test</Button></div>
				<Inspector></Inspector>
			</ViewSplit>
		</div>
	);
}

type ViewSplitProps = {
	ratio: number;
	axis: "x" | "y"
	children: [ReactNode, ReactNode];
};
export function ViewSplit({
	ratio: initialRatio,
	axis,
	children: [child0, child1],
}: ViewSplitProps) {
	const [ratio, setRatio] = useState(initialRatio);
	const [resizing, setResizing] = useState(false);
	function handleMove(e: React.PointerEvent<HTMLDivElement>) {
		if (!resizing) return;
		e.preventDefault();
		const pos = axis === "x" ? e.clientX : e.clientY;
		const size = axis === "x" ? e.currentTarget.clientWidth : e.currentTarget.clientHeight;
		setRatio(Math.min(Math.max(0, pos / size), 1));
	}
	return (
		<div className={`${css.split} ${css[`split-${axis}`]}`}
			style={{ "--ratio": `${ratio * 100}%` }}
			onPointerMove={handleMove}
		>
			{child0}
			<div className={`${css.handle} ${resizing ? css.resizing : ""}`} 
				onPointerDown={e => (e.preventDefault(), setResizing(true))} 
				onPointerUp={() => setResizing(false)}>
				<div className={css.interaction}></div>
				<div className={css.visual}></div>
			</div>
			{child1}
		</div>
	);
}