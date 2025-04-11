import { ThemeProvider } from "../theme/theme.tsx";

import { IconInfo, IconName, IconProvider as NIconProvider } from "@components/icon/NewIcon.tsx";
import { IconProvider } from "@components/icon/Icon.tsx";
import { aliases, icons } from "@components/icon/icons.ts";

import { Layout, LayoutDesc, LayoutDescSplit, LayoutDescView } from "@components/layout/Layout.tsx";
import { TestIcon } from "./TestIcon.tsx";

import { ContextMenuProvider } from "@components/contextmenu/context.tsx";
import { Bounds } from "../common/editor/bounds.ts";
import { mapContext } from "../common/editor/map.ts";
import { zero } from "../common/vec2.ts";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { ViewFC } from "@components/layout/LayoutView.tsx";
import { toMap, Translate } from "@components/translate/Translate.tsx";
import { Inspector } from "@components/view/inspector/Inspector.tsx";
import { Viewport } from "@components/view/viewport/Viewport.tsx";
import { TestError } from "./TestError.tsx";
import { TestIcons } from "./TestIcons.tsx";
import { TestSwatch } from "./TestSwatch.tsx";
import { Translations } from "./translations.tsx";
import { stringifyPath } from "@components/icon/stringify.tsx";
import { chevronRight } from "@components/icon/icon/chevron.ts";
import { path } from "@components/icon/path.tsx";

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
		<Translate k="lorem" />
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
declare global {
	namespace Registry {
		interface Icon {
			"chevron-right": "whatever"
		}
	}
}
const nicons = new Map<IconName, IconInfo>([
	["chevron-right", {
		content: path(chevronRight),
	}],
]);

export function Test() {
	// wow that's a lot of providers!!!
	return (
		<ErrorBoundary location="Test">
			<mapContext.Provider value={{
				objects: [
					{ type: "obstacle", bounds: new Bounds({ left: 0, top: 0, right: 10, bottom: 10 }) },
					{ type: "obstacle", bounds: new Bounds({ left: 10, top: 10, right: 20, bottom: 20 }) },
					{ type: "text", pos: zero, text: "test    uwu" },
				]
			}}>
				<Translations>
					<ThemeProvider>
						<NIconProvider value={nicons}>
							<IconProvider icons={icons} aliases={aliases}>
								<ContextMenuProvider>
									<Layout layout={defaultLayout} views={toMap(views)} />
								</ContextMenuProvider>
							</IconProvider>
						</NIconProvider>
					</ThemeProvider>
				</Translations>
			</mapContext.Provider>
		</ErrorBoundary >
	);
}
