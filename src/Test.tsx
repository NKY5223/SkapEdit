import { FC } from "react";
import { Button } from "./components/form/Button.tsx";
import { Icon, IconProvider } from "./components/icon/Icon.tsx";

import templateSVG from "./components/icon/icon/template.svg?raw";
import { Inspector } from "./components/inspector/Inspector.tsx";
import { Layout } from "./components/layout/Layout.tsx";
import { ThemeProvider } from "./theme/theme.tsx";

const icons = {
	template: templateSVG,
};
export function Test() {
	return (
		<ThemeProvider>
			<IconProvider icons={icons}>
				<Layout>
					<div style={{
						display: "flex",
						flexDirection: "column",
						gap: "20px",
						padding: "20px",
					}}>
						<IconTest icon="template" />
						<div><Button icon="template">test</Button></div>
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
	icon: string;
};
const IconTest: FC<IconTestProps> = ({ icon }) => {
	return (
		<div style={{
			display: "flex",
			flexDirection: "column",
			gap: "20px",
		}}>
			{[24, 48, 60, 240].map((size, i) => (
				<Icon
					key={size}
					icon={icon}
					width={size}
					height={size}
					style={{
						"--color": "#fff",
						"--width": (24 / size) + "px",
					}} />
			))}
		</div>
	);
}