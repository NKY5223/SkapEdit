import { Color } from "@common/color.ts";
import { toMap } from "@common/toMap.tsx";
import { ContextMenuProvider } from "@components/contextmenu/context.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { Icons } from "@components/icon/icons.tsx";
import { Layout } from "@components/layout/Layout.tsx";
import { makeSplitX, makeSplitY } from "@components/layout/LayoutSplit.tsx";
import { makeView } from "@components/layout/LayoutView.tsx";
import { Translations } from "@components/translate/translations.tsx";
import { Bounds } from "@editor/bounds.ts";
import { lava, MapProvider, obstacle, SkapMap, SkapRoom, text } from "@editor/map.ts";
import { FC, Reducer, useReducer } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";

import { createId } from "@common/uuid.ts";
import { vec2 } from "@common/vec2.ts";
import { views } from "../layout/views.tsx";


// #region defaults
const actualLayout = makeSplitX(0.75,
	makeView("map.viewport"),
	makeView("map.inspector"),
)
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
const defaultLayout: Layout.Node = actualLayout;
const defaultLayoutRoot: Layout.Root = {
	tree: {
		node: defaultLayout
	}
}
const defaultRoom: SkapRoom = {
	id: createId(),
	name: "Default",
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
const defaultMap: SkapMap = {
	spawn: {
		room: defaultRoom.id,
		position: vec2(5, 5),
	},
	rooms: [
		defaultRoom,
	]
};
// #endregion

type MapAction = (
	{
		type: string;
	}
);
const mapReducer: Reducer<SkapMap, MapAction> = (map, action) => {
	switch(action.type) {
	}
	return map;
}

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	const [map, dispatchMap] = useReducer(mapReducer, defaultMap);

	return (
		<ErrorBoundary location="Editor">
			<ThemeProvider>
				<Translations>
					<Icons>
						<ContextMenuProvider>
							<MapProvider value={map}>
								<Layout layout={defaultLayoutRoot} viewProviders={toMap(views)} />
							</MapProvider>
						</ContextMenuProvider>
					</Icons>
				</Translations>
			</ThemeProvider>
		</ErrorBoundary>
	);
}