import { ThemeProvider } from "../theme/theme.tsx";

import { IconProvider } from "../components/icon/Icon.tsx";
import { aliases, icons } from "../components/icon/icons.ts";

import { Layout, LayoutDesc, LayoutDescSplit, LayoutDescView } from "../components/layout/Layout.tsx";
import { TestIcon } from "./TestIcon.tsx";

import { Inspector } from "../components/inspector/Inspector.tsx";
import { TestSwatch } from "./TestSwatch.tsx";
import { TestIcons } from "./TestIcons.tsx";
import { ErrorBoundary } from "../components/error/ErrorBoundary.tsx";
import { toMap, Translation, TranslationProvider } from "../components/translate/Translate.tsx";


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

const translations = {
	"error.layout.view.unknown": ["Unknown view: ", { value: "view" }]
} as const satisfies Record<string, Translation>;
export function Test() {
	return (
		<ErrorBoundary location="Test">
			<TranslationProvider translations={toMap<Translation>(translations)}>
				<ThemeProvider>
					<IconProvider icons={icons} aliases={aliases}>
						<Layout layout={defaultLayout} views={new Map([
							["test.icon", TestIcon],
							["test.icons", TestIcons],
							["test.swatch", TestSwatch],
							["inspector", Inspector],
							["test.lorem", ({ viewSelector }) => (<div>
								{viewSelector}
								<p>
									Lorem ipsum dolor, sit amet consectetur adipisicing elit.
									Esse, culpa possimus fuga, veritatis harum autem dolore ipsam provident,
									id praesentium distinctio ullam similique!
									Earum praesentium repudiandae magnam ipsum et nihil!
								</p>
							</div>)],
						])} />
					</IconProvider>
				</ThemeProvider>
			</TranslationProvider>
		</ErrorBoundary>
	);
}
const TestError = () => {
	throw new Error("Test error", {
		cause: [
			new RangeError("rangeerror"),
			new Error("caused error", { cause: [1] })
		]
	})
	return <></>;
}