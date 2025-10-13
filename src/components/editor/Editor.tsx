import { Color } from "@common/color.ts";
import { toMap } from "@common/toMap.tsx";
import { ContextMenuProvider } from "@components/contextmenu/context.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { DefaultIconProvider } from "@components/icon/icons.tsx";
import { Layout } from "@components/layout/Layout.tsx";
import { makeSplitX, makeSplitY } from "@components/layout/LayoutSplit.tsx";
import { makeView } from "@components/layout/LayoutView.tsx";
import { DefaultTranslationProvider } from "@components/translate/translations.tsx";
import { Bounds } from "@editor/bounds.ts";
import { lava, MapProvider, objects, obstacle, SkapMap, SkapObject, SkapRoom, text } from "@editor/map.ts";
import { FC, Reducer, useReducer } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";

import { createId, ID } from "@common/uuid.ts";
import { vec2 } from "@common/vec2.ts";
import { views } from "../layout/views.tsx";
import { createReducerContext } from "@hooks/createReducerContext.tsx";


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
const obj1 = obstacle(0, 0, 10, 10);
const defaultRoom: SkapRoom = {
	id: createId(),
	name: "Default",
	bounds: new Bounds({ left: 0, top: 0, right: 50, bottom: 25 }),
	obstacleColor: Color.hex(0x000a57, 0.8),
	backgroundColor: Color.hex(0xe6e6e6),
	objects: objects([
		obj1,
		obstacle(10, 10, 20, 20),
		lava(15, 15, 25, 50),
		lava(-10, 15, 40, 25),
		text(15, 10, "test        a, MMM²[ℤ永远不会放弃你"),
	])
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

/**
 * @returns If object was successfully replaced, returns `[true, newRoom]`. Else, `[false, oldRoom]`.
*/
const setInRoom = (
	room: SkapRoom,
	targetObject: ID,
	/** function that transforms old object into new object */
	f: (node: SkapObject) => SkapObject,
): [success: boolean, room: SkapRoom] => {
	const obj = room.objects.get(targetObject);
	if (!obj) return [false, room];
	if (obj.id !== targetObject) {
		console.error("An entry in room", room, "'s objects map did not have id matching key.");
		return [false, room];
	}
	const newObj = f(obj);
	const newObjs = new Map(room.objects);
	newObjs.set(newObj.id, newObj);
	return [true, {
		...room,
		objects: newObjs,
	}];
}


type SkapMapAction = (
	{
		type: "replace_object";
		targetObject: ID;
		/** Replacement function that returns new object, given old object. */
		replacement: (prevObject: SkapObject) => SkapObject;
	}
);
const mapReducer: Reducer<SkapMap, SkapMapAction> = (map, action) => {
	switch (action.type) {
		case "replace_object": {
			const { targetObject, replacement } = action;
			for (const [i, room] of map.rooms.entries()) {
				const [success, newRoom] = setInRoom(room, targetObject, replacement);
				if (!success) continue;
				return {
					...map,
					rooms: map.rooms.with(i, newRoom)
				}
			}
			return map;
		}
	}
	return map;
}

const [useSelection, useDispatchSelection, SelectionProvider] = createReducerContext<ID | null, {}>("Selection", x => x);

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	const [map, dispatchMap] = useReducer(mapReducer, defaultMap);
	return (
		<ErrorBoundary location="Editor">
			<ThemeProvider>
				<DefaultTranslationProvider>
					<DefaultIconProvider>
						<ContextMenuProvider>
							<MapProvider value={map}>
								<SelectionProvider initialValue={obj1.id}>
									<Layout layout={defaultLayoutRoot} viewProviders={toMap(views)} />
								</SelectionProvider>
							</MapProvider>
						</ContextMenuProvider>
					</DefaultIconProvider>
				</DefaultTranslationProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}