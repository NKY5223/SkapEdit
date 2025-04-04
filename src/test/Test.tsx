import { ThemeProvider } from "../theme/theme.tsx";

import { IconProvider } from "../components/icon/Icon.tsx";
import { aliases, icons } from "../components/icon/icons.ts";

import { Layout, LayoutDesc, LayoutDescSplit, LayoutDescView } from "../components/layout/Layout.tsx";
import { TestIcon } from "./TestIcon.tsx";

import { Inspector } from "../components/view/inspector/Inspector.tsx";
import { TestSwatch } from "./TestSwatch.tsx";
import { TestIcons } from "./TestIcons.tsx";
import { ErrorBoundary } from "../components/error/ErrorBoundary.tsx";
import { toMap, Translate, Translation, TranslationProvider } from "../components/translate/Translate.tsx";
import { ViewFC } from "../components/layout/LayoutView.tsx";
import { Viewport } from "../components/view/viewport/Viewport.tsx";
import { mapContext } from "../components/editor/map.ts";
import { Bounds } from "../components/editor/bounds.ts";
import { zero } from "../common/vec2.ts";
import { TestError } from "./TestError.tsx";
import { Translations, translations } from "./translations.tsx";
import { ContextMenuProvider } from "../components/contextmenu/ContextMenu.tsx";

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

const views = {
	"test.icon": TestIcon,
	"test.icons": TestIcons,
	"test.swatch": TestSwatch,
	"test.error": TestError,
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
	// wow that's a lot of providers!!!
	return (
		<ErrorBoundary location="Test">
			<ContextMenuProvider>
				<mapContext.Provider value={{
					objects: [
						{ type: "obstacle", bounds: new Bounds({ left: 0, top: 0, right: 10, bottom: 10 }) },
						{ type: "obstacle", bounds: new Bounds({ left: 10, top: 10, right: 20, bottom: 20 }) },
						{ type: "text", pos: zero, text: "test    uwu" },
					]
				}}>
					<Translations>
						<ThemeProvider>
							<IconProvider icons={icons} aliases={aliases}>
								<Layout layout={defaultLayout} views={toMap(views)} />
							</IconProvider>
						</ThemeProvider>
					</Translations>
				</mapContext.Provider>
			</ContextMenuProvider>
		</ErrorBoundary >
	);
}
