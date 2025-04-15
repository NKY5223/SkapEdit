import { ContextMenuProvider } from "@components/contextmenu/context.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { ThemeProvider } from "../theme/theme.tsx";

import { Inspector } from "@components/view/inspector/Inspector.tsx";
import { Viewport } from "@components/view/viewport/Viewport.tsx";

import { TestError } from "./TestError.tsx";
import { TestIcon } from "./TestIcon.tsx";
import { TestIcons } from "./TestIcons.tsx";
import { TestSwatch } from "./TestSwatch.tsx";

import { Layout, LayoutDesc, LayoutDescSplit, LayoutDescView } from "@components/layout/Layout.tsx";
import { ViewFC } from "@components/layout/LayoutView.tsx";
import { Translate } from "@components/translate/Translate.tsx";

import { toMap } from "@common/toMap.tsx";
import { zero } from "@common/vec2.ts";
import { Icons } from "@components/icon/icons.tsx";
import { Translations } from "@components/translate/translations.tsx";
import { Bounds } from "../editor/bounds.ts";
import { lava, MapProvider, obstacle, SkapMap, text } from "../editor/map.ts";

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
		<Translate k="layout.view.name" />
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
const defaultMap: SkapMap = {
	objects: [
		obstacle(new Bounds({ left: 0, top: 0, right: 10, bottom: 10 })),
		obstacle(new Bounds({ left: 10, top: 10, right: 20, bottom: 20 })),
		lava(new Bounds({ left: 0, top: 15, right: 15, bottom: 20 })),
		text(zero, "test    test\n\tindent!"),
	]
};
export function Test() {
	// wow that's a lot of providers!!!
	return (
		<ErrorBoundary location="Test">
			<MapProvider value={defaultMap}>
				<Translations>
					<Icons>
						<ThemeProvider>
							<ContextMenuProvider>
								<Layout layout={defaultLayout} views={toMap(views)} />
							</ContextMenuProvider>
						</ThemeProvider>
					</Icons>
				</Translations>
			</MapProvider>
		</ErrorBoundary >
	);
}
