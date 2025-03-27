import { ViewFC } from "../components/layout/LayoutView.tsx";

export const TestSwatch: ViewFC = ({
	children,
}) => {
	const colors: string[][] = [
		["theme-bg-0", "theme-bg-1",],
		["theme-primary-bg-0", "theme-primary-bg-1",],
		["theme-secondary-bg-0", "theme-secondary-bg-1",],
		["theme-disabled-bg",], ["theme-positive-bg-0", "theme-positive-bg-1",],
		["theme-warn-bg-0", "theme-warn-bg-1",],
		["theme-negative-bg-0", "theme-negative-bg-1",],
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
			{children}
			{colors.map((row, i) => (
				<div key={i} style={{
					display: "flex",
					gap: ".5em",
				}}>
					{row.map(bg => {
						const fg = bg.replaceAll("bg", "fg");
						const bd = bg.replaceAll("bg", "bd");
						return (
							<div key={bg} style={{
								width: "10em",
								height: "5em",
								borderRadius: "1em",

								display: "grid",
								placeItems: "center",
								textAlign: "center",
								fontFamily: "'Consolas', monospace",

								backgroundColor: `var(--${bg})`,
								color: `var(--${fg})`,
								border: `1px solid var(--${bd})`,
							}}>{getName(bg)}</div>
						);
					})}
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
const getName = (bg: string) => {
	const bgW = normalize(bg.replaceAll("bg", ""));
	return bgW
}