import { ThemeProvider } from "../theme/theme.tsx";

import { IconProvider } from "../components/icon/Icon.tsx";
import { aliases, icons } from "../components/icon/icons.ts";

import { Layout, LayoutDesc, LayoutDescSplit, LayoutDescView } from "../components/layout/Layout.tsx";
import { TestIcon } from "./TestIcon.tsx";

import { Inspector } from "../components/view/inspector/Inspector.tsx";
import { TestSwatch } from "./TestSwatch.tsx";
import { TestIcons } from "./TestIcons.tsx";
import { ErrorBoundary } from "../components/error/ErrorBoundary.tsx";
import { delegate, toMap, Translate, Translation, TranslationProvider } from "../components/translate/Translate.tsx";
import { ViewFC } from "../components/layout/LayoutView.tsx";
import { Viewport } from "../components/view/viewport/Viewport.tsx";
import { mapContext } from "../components/editor/map.ts";
import { Bounds } from "../components/editor/bounds.ts";
import { vec2 } from "../common/vector.ts";

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
const view = (view: ViewAutocomplete) => ({
	type: "view",
	id: uuid(),
	view,
} satisfies LayoutDescView);

const translations = {
	"error.layout.view.unknown": ["Unknown view: ", { value: "view" }],

	"layout.view.name": delegate("layout.view.name", "view"),
	"layout.view.category.name": delegate("layout.view.category.name", "category"),
	"layout.view.category.name.test": "Testing",
	"layout.view.name.test.icon": "Icon Test",
	"layout.view.name.test.icons": "Icons Test",
	"layout.view.name.test.swatch": "Theme Test",
	"layout.view.name.test.lorem": "Lorem ipsum...",
	"layout.view.category.name.map": "Map",
	"layout.view.name.map.inspector": "Inspector",
	"layout.view.name.map.viewport": "Viewport",

	"lorem": "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, culpa possimus fuga, veritatis harum autem dolore ipsam provident, id praesentium distinctio ullam similique! Earum praesentium repudiandae magnam ipsum et nihil!",
} as const satisfies Record<string, Translation>;
export type TranslationAutocomplete = keyof typeof translations;
const views = {
	"test.icon": TestIcon,
	"test.icons": TestIcons,
	"test.swatch": TestSwatch,
	"map.inspector": Inspector,
	"test.lorem": ({ children }) => (<div>
		{children}
		<Translate>lorem</Translate>
	</div>),
	"map.viewport": Viewport,
} as const satisfies Record<string, ViewFC>;

type ViewAutocomplete = keyof typeof views;
const defaultLayout: LayoutDesc = (
	splitY(0.6,
		view("test.icon"),
		splitX(0.4,
			view("map.viewport"),
			splitY(0.6,
				view("map.inspector"),
				view("test.swatch")
			)
		)
	)
);

export function Test() {
	return (
		<ErrorBoundary location="Test">
			<mapContext.Provider value={{
				objects: [
					{ type: "obstacle", bounds: new Bounds({ left: 0, top: 0, right: 10, bottom: 10 }) },
					{ type: "obstacle", bounds: new Bounds({ left: -10, top: -10, right: 0, bottom: 5 }) },
					{ type: "text", pos: vec2(0), text: "test    uwu" },
				]
			}}>
				<TranslationProvider translations={toMap<Translation>(translations)}>
					<ThemeProvider>
						<IconProvider icons={icons} aliases={aliases}>
							<Layout layout={defaultLayout} views={toMap(views)} />
						</IconProvider>
					</ThemeProvider>
				</TranslationProvider>
			</mapContext.Provider>
		</ErrorBoundary >
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