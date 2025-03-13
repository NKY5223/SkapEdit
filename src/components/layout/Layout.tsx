import { FC, ReactNode, useEffect, useRef, useState } from "react";
import css from "./Layout.module.css";
import { ViewSplit } from "./ViewSplit.tsx";


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
	children: ReactNode[]
};

// almost top-level component
export const Layout: FC<LayoutProps> = ({
	children: [child0, child1, child2, child3]
}) => {
	return (
		<div className={css.layout}>
			<ViewSplit axis="y" ratio={.8}>
				{child0}
				<ViewSplit axis="x" ratio={.4}>
					{child1}
					<ViewSplit axis="y" ratio={.4}>
						{child2}
						{child3}
					</ViewSplit>
				</ViewSplit>
			</ViewSplit>
		</div>
	);
}
