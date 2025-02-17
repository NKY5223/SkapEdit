import { FC } from "react";

import { Icon, IconProvider, useIcons } from "./components/icon/Icon.tsx";
import { aliases, icons } from "./components/icon/icons.ts";

import { ThemeProvider } from "./theme/theme.tsx";

import { Layout } from "./components/layout/Layout.tsx";

import { Inspector } from "./components/inspector/Inspector.tsx";
import { reverseMap, unique } from "./test-utils.ts";

export function Test() {
	return (
		<ThemeProvider>
			<IconProvider icons={icons} aliases={aliases}>
				<Layout>
					<div style={{
						display: "flex",
						flexDirection: "column",
						gap: "20px",
						padding: "20px",
						overflow: "auto",
						maxHeight: "100%",
					}}>
						<IconTest icons={["reset", "reset2"]} />
					</div>
					<div style={{
						display: "flex",
						flexDirection: "column",
						gap: "20px",
						padding: "20px",
					}}>
						<Inspector />
					</div>
				</Layout>
			</IconProvider>
		</ThemeProvider>
	);
}

// console.log(parseSVGElement(parseSVG(templateSVG)));

type IconTestProps = {
	icons: string[];
};
const IconTest: FC<IconTestProps> = ({ icons }) => {
	const entries = [...useIcons()];
	const allIcons = unique(entries, ([, { id: a }], [, { id: b }]) => a === b);
	const reverse = reverseMap(entries.map(([k, { canonicalName }]) => [k, canonicalName]));
	return (
		<div style={{
			display: "flex",
			flexDirection: "column",
			gap: "1em",
		}}>
			<div style={{
				display: "flex",
				flexDirection: "row",
				gap: ".5em",
			}}>
				{allIcons.map(([icon]) => (
					<Icon
						key={icon}
						title={(reverse.get(icon) ?? ["err"]).join(" | ")}
						icon={icon}
						width="1.5em"
						height="1.5em"
						vars={{
							"color": "var(--theme-foreground-0)",
							"template-opacity": 0,
						}}
					/>
				))}
			</div>
			<div style={{
				display: "flex",
				flexDirection: "column",
				gap: ".75em",
			}}>
				{[1.5, 3, 15].map(size => (
					<div
						key={size}
						style={{
							display: "flex",
							flexDirection: "row",
							gap: ".75em",
						}}>
						{
							icons.map(icon => (
								<Icon
									key={icon}
									icon={icon}
									width={size + "em"}
									height={size + "em"}
									vars={{
										"color": "var(--theme-foreground-0)",
										"template-color": "#fff",
										"template-stroke": (1.5 / size) + "px",
										"template-opacity": size >= 10 ? 1 : 0,
									}}
								/>
							))
						}
					</div>
				))}
			</div>
		</div>
	);
}