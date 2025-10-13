import { Color } from "@common/color.ts";
import { toMap } from "@common/toMap.tsx";
import { ContextMenuProvider } from "@components/contextmenu/context.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { DefaultIconProvider } from "@components/icon/icons.tsx";
import { Layout } from "@components/layout/Layout.tsx";
import { makeSplitX, makeSplitY } from "@components/layout/LayoutSplit.tsx";
import { makeView } from "@components/layout/LayoutView.tsx";
import { DefaultTranslationProvider } from "@components/translate/translations.tsx";
import { mkLava, objectWithIdArrayToMap, mkObstacle, mkRoom, SkapMap, SkapMapProvider, SkapRoom, mkText } from "@editor/map.ts";
import { FC } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";

import { ID } from "@common/uuid.ts";
import { vec2 } from "@common/vec2.ts";
import { views } from "../layout/views.tsx";
import { createReducerContext } from "@hooks/createReducerContext.tsx";


// #region defaults
const actualLayout = makeSplitX(0.75,
	makeView("map.viewport"),
	makeView("map.inspector"),
);
const testLayout = makeSplitY(0.6,
	makeView("test.icon"),
	makeSplitX(0.4,
		makeView("map.viewport"),
		makeSplitY(0.6,
			makeView("map.inspector"),
			makeView("test.swatch")
		)
	)
);
const defaultLayout: Layout.Node = false ? testLayout : actualLayout;
const defaultLayoutRoot: Layout.Root = {
	tree: {
		node: defaultLayout
	}
}
const obj1 = mkObstacle(0, 0, 10, 10);
const defaultRoom: SkapRoom = mkRoom(
	"Default",
	{ left: 0, top: 0, right: 50, bottom: 25 },
	Color.hex(0x000a57, 0.8),
	Color.hex(0xe6e6e6),
	[
		obj1,
		mkObstacle(10, 10, 20, 20),
		mkLava(15, 15, 25, 50),
		mkLava(-10, 15, 40, 25),
		// i can't even read that
		// also the windows 10 sc IME interprets "biang" as "bi'ang" so i had to google it
		mkText(15, 10, "a,    M_²[ℤ𰻞乙a"),
	]
);
const defaultMap: SkapMap = {
	spawn: {
		room: defaultRoom.id,
		position: vec2(5, 5),
	},
	rooms: objectWithIdArrayToMap([
		defaultRoom,
	])
};
// #endregion

export const [useSelection, useDispatchSelection, SelectionProvider] = createReducerContext<ID | null, {}>("Selection", x => x);

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	return (
		<ErrorBoundary location="Editor">
			<ThemeProvider>
				<DefaultTranslationProvider>
					<DefaultIconProvider>
						<ContextMenuProvider>
							<SkapMapProvider initialValue={defaultMap}>
								<SelectionProvider initialValue={obj1.id}>
									<Layout layout={defaultLayoutRoot} viewProviders={toMap(views)} />
								</SelectionProvider>
							</SkapMapProvider>
						</ContextMenuProvider>
					</DefaultIconProvider>
				</DefaultTranslationProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}