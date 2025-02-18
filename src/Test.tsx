import { FC, useState } from "react";

import { Icon, IconName, IconProvider, useIcons } from "./components/icon/Icon.tsx";
import { aliases, icons } from "./components/icon/icons.ts";

import { ThemeProvider } from "./theme/theme.tsx";

import { Layout } from "./components/layout/Layout.tsx";

import { Inspector } from "./components/inspector/Inspector.tsx";
import { reverseMap, unique } from "./test-utils.ts";
import { Slider } from "./components/form/Slider.tsx";

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
						<IconTest icons={["position_top", "position_top2"]} />
					</div>
					<div style={{
						display: "flex",
						flexDirection: "column",
						gap: "20px",
						padding: "20px",
					}}>
						<Inspector />
					</div>
					<div>
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
						Voluptatem praesentium, ut, officiis tenetur molestiae,
						debitis nobis voluptas quibusdam quo eius corrupti facere.
						Labore beatae officiis, qui modi consequatur dolor quibusdam?
					</div>
					<div>
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
						Voluptatem praesentium, ut, officiis tenetur molestiae,
						debitis nobis voluptas quibusdam quo eius corrupti facere.
						Labore beatae officiis, qui modi consequatur dolor quibusdam?
					</div>
				</Layout>
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

	const [fill, setFill] = useState(0);

	const iconAttrs = {
		color: "var(--theme-foreground-0)",
		fill,
	};
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
							...iconAttrs,
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
										...iconAttrs,
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
			<Slider value={fill} min={0} max={1} onChange={setFill} />
		</div>
	);
}