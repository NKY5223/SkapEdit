import { FC } from "react";

import { ThemeProvider } from "../theme/theme.tsx";

import { Icon, IconName, IconProvider, useIcons } from "../components/icon/Icon.tsx";
import { aliases, icons } from "../components/icon/icons.ts";

import { Layout, LayoutDesc, LayoutDescSplit, LayoutDescView } from "../components/layout/Layout.tsx";
import { TestIcon } from "./TestIcon.tsx";

import { Inspector } from "../components/inspector/Inspector.tsx";
import { reverseMap, unique } from "../utils.ts";
import { TestSwatch } from "./TestSwatch.tsx";
import { viewRegistry } from "../components/layout/LayoutView.tsx";

viewRegistry.set("test.icon", TestIcon);
viewRegistry.set("test.swatch", TestSwatch);
viewRegistry.set("inspector", Inspector);
viewRegistry.set("test.lorem", ({ viewSelector }) => (<div>
	{viewSelector}
	<p>
		Lorem ipsum dolor, sit amet consectetur adipisicing elit.
		Esse, culpa possimus fuga, veritatis harum autem dolore ipsam provident,
		id praesentium distinctio ullam similique!
		Earum praesentium repudiandae magnam ipsum et nihil!
	</p>
</div>));

const uuid = () => crypto.randomUUID();
const splitX = (ratio: number, a: LayoutDesc, b: LayoutDesc) => ({
	type: "split",
	axis: "x",
	ratio,
	id: uuid(),
	first: a,
	second: b,
} satisfies LayoutDescSplit);
const splitY = (ratio: number, a: LayoutDesc, b: LayoutDesc) => ({
	type: "split",
	axis: "y",
	ratio,
	id: uuid(),
	first: a,
	second: b,
} satisfies LayoutDescSplit);
const view = (view: string) => ({
	type: "view",
	id: uuid(),
	view,
} satisfies LayoutDescView);

const defaultLayout: LayoutDesc = (
	splitY(0.8,
		view("test.icon"),
		splitX(0.4,
			view("test.swatch"),
			splitY(0.6,
				view("inspector"),
				view("test.lorem")
			)
		)
	)
);

export function Test() {
	return (
		<ThemeProvider>
			<IconProvider icons={icons} aliases={aliases}>
				<Layout layout={defaultLayout} />
			</IconProvider>
		</ThemeProvider>
	);
}

type IconTestProps = {
	icons: IconName[];
};
const IconTest: FC<IconTestProps> = ({ icons }) => {
	const entries = [...useIcons()];
	const allIcons = unique(entries, ([, { id: a }], [, { id: b }]) => a === b);
	const reverse = reverseMap(entries.map(([k, { canonicalName }]) => [k, canonicalName]));

	const iconAttrs = {
		color: "var(--theme-foreground-0)",
	};
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "1em",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					gap: ".5em",
				}}
			>
				{allIcons.map(([icon]) => (<Icon
					key={icon}
					title={(reverse.get(icon) ?? ["err"]).join(" | ")}
					icon={icon}
					width="1.5em"
					height="1.5em"
					vars={{
						...iconAttrs,
						"guide-opacity": 0,
					}}
				/>))}
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: ".75em",
				}}
			>
				{[1.5, 3, 15].map(size => (<div
					key={size}
					style={{
						display: "flex",
						flexDirection: "row",
						gap: ".75em",
					}}>
					{
						icons.map(icon => (<Icon
							key={icon}
							icon={icon}
							width={size + "em"}
							height={size + "em"}
							vars={{
								...iconAttrs,
								"guide-color": "#fff",
								"guide-stroke": (1.5 / size) + "px",
								"guide-opacity": size >= 10 ? 1 : 0,
							}}
						/>))
					}
				</div>))}
			</div>
		</div>
	);
}