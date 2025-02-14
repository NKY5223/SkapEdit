import { FC, ReactNode, useState } from "react";
import css from "./Layout.module.css";


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

type LayoutProps = {
	children: [ReactNode, ReactNode]
};

// almost top-level component
export const Layout: FC<LayoutProps> = ({
	children
}) => {
	return (
		<div className={css.layout}>
			<ViewSplit axis="y" ratio={.6}>
				{children}
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
			<div className={css.view}>{child0}</div>
			<div className={`${css.handle} ${resizing ? css.resizing : ""}`} 
				onPointerDown={e => (e.preventDefault(), setResizing(true))} 
				onPointerUp={() => setResizing(false)}>
				<div className={css.interaction}></div>
				<div className={css.visual}></div>
			</div>
			<div className={css.view}>{child1}</div>
		</div>
	);
}