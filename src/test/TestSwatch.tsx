import { ViewFC } from "../components/layout/LayoutView.tsx";

export const TestSwatch: ViewFC = ({
	viewSelector,
}) => {
	const colors: [string, string][][] = [
		[
			["theme-bg-0", "theme-fg-0"],
			["theme-bg-1", "theme-fg-1"],
		],
		[
			["theme-primary-bg-0", "theme-primary-fg-0"],
			["theme-primary-bg-1", "theme-primary-fg-1"],
		],
		[
			["theme-secondary-bg-0", "theme-secondary-fg-0"],
			["theme-secondary-bg-1", "theme-secondary-fg-1"],
		],
		[
			["theme-disabled-bg", "theme-disabled-fg"],
		],
		[
			["theme-positive-bg-0", "theme-positive-fg-0"],
			["theme-positive-bg-1", "theme-positive-fg-1"],
		],
		[
			["theme-warn-bg-0", "theme-warn-fg-0"],
			["theme-warn-bg-1", "theme-warn-fg-1"],
		],
		[
			["theme-negative-bg-0", "theme-negative-fg-0"],
			["theme-negative-bg-1", "theme-negative-fg-1"],
		],
	];
	return (
		<div style={{
			display: "flex",
			flexDirection: "column",
			gap: ".5em",
			maxHeight: "100%",
			overflow: "auto",
			padding: ".5em",
		}}>
			{viewSelector}
			{colors.map((row, i) => (
				<div key={i} style={{
					display: "flex",
					gap: ".5em",
				}}>
					{row.map(([bg, fg]) => (
						<div key={bg} style={{
							width: "10em",
							height: "5em",
							border: "1px solid #fff4",
							borderRadius: "1em",

							display: "grid",
							placeItems: "center",
							textAlign: "center",
							fontFamily: "'Consolas', monospace",

							backgroundColor: `var(--${bg})`,
							color: `var(--${fg})`,
						}}>{getName(fg, bg)}</div>
					))}
				</div>
			))}
		</div>
	);
}

const normalize = (str: string) => str
	.replaceAll("--", "-")
	.replace(/^theme-/, "")
	.replaceAll(/^-+/g, "")
	.replaceAll(/-+$/g, "");
const getName = (fg: string, bg: string) => {
	const fgW = normalize(fg.replaceAll("fg", ""));
	const bgW = normalize(bg.replaceAll("bg", ""));
	if (fgW === bgW) return fgW;
}