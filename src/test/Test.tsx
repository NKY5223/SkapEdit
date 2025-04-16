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
import { lava, MapProvider, obstacle, SkapRoom, text } from "../editor/map.ts";
import { Color } from "@common/color.ts";
import { FC } from "react";

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

const defaultRoom: SkapRoom = {
	bounds: new Bounds({ left: 0, top: 0, right: 50, bottom: 25 }),
	obstacleColor: Color.hex(0x000a57, 0.8),
	backgroundColor: Color.hex(0xe6e6e6),
	objects: [
		obstacle(0, 0, 10, 10),
		obstacle(10, 10, 20, 20),
		lava(15, 15, 25, 50),
		lava(-10, 15, 40, 25),
		text(15, 10, "test        a"),
	]
};
export const Test: FC = () => {
	// wow that's a lot of providers!!!
	return (
		<ErrorBoundary location="Test">
			<MapProvider value={defaultRoom}>
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
