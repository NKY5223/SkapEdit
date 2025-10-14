import { Layout } from "@components/layout/Layout.tsx";

const normalize = (str: string) => str
	.replaceAll("--", "-")
	.replace(/^theme-/, "")
	.replaceAll(/^-+/g, "")
	.replaceAll(/-+$/g, "");
const getName = (bg: string) => {
	const bgW = normalize(bg.replaceAll("bg", ""));
	return bgW
}

export const TestSwatch: Layout.ViewComponent = ({
	viewSwitch,
}) => {
	const colors: string[][] = [
		["theme-bg-0", "theme-bg-1", "theme-selection-bg",],
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
			{viewSwitch}
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
								padding: "0.5em",
								borderRadius: "var(--theme-border-radius, .5em)",

								display: "grid",
								gridTemplateAreas: "\"a b\"",
								gridTemplateColumns: "auto min-content",
								gap: ".5em",
								textAlign: "center",
								fontFamily: "'Consolas', monospace",

								backgroundColor: `var(--${bg})`,
								color: `var(--${fg})`,
								border: `1px solid var(--${bd})`,
							}}>{getName(bg)}
								<div style={{
									height: "100%",
									borderLeft: `1px solid var(--${bd})`,
									aspectRatio: "1",
								}}></div>
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}

export const TestSwatchVP: Layout.ViewProvider = {
	name: "test.swatch",
	Component: TestSwatch,
	icon: "palette",
};