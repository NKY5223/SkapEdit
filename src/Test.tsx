import { Icon, IconProvider } from "./components/icon/Icon.tsx";

import templateSVG from "./components/icon/icon/template.svg?raw";
import testSVG from "./components/icon/icon/test.svg?raw";
import { Layout } from "./components/layout/Layout.tsx";
import { ThemeProvider } from "./theme/theme.tsx";

export function Test() {
	return (
		<ThemeProvider>
			<Layout>

			</Layout>
		</ThemeProvider>
	);
}

function IconTest() {
	return <IconProvider icons={{
		template: templateSVG,
		test: testSVG,
	}}>
		<div style={{
			display: "flex",
			flexDirection: "column",
			gap: "20px",
		}}>
			{[24, 48, 60, 200].map((size, i) => (
				<Icon
					key={i}
					icon="test"
					width={size}
					height={size}
					attrs={{ stroke: "#fff4", strokeWidth: (24 / size).toString() }} />
			))}
		</div>
	</IconProvider>;
}