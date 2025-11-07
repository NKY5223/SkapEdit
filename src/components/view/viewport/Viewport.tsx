import { ID } from "@common/uuid.ts";
import { vec2, Vec2 } from "@common/vec2.ts";
import "@common/vector.ts";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { Layout, makeViewProvider } from "@components/layout/layout.ts";
import { Bounds } from "@editor/bounds.ts";
import { useSkapMap } from "@editor/reducer.ts";
import { FC, useRef } from "react";
import { SkapRoom } from "../../../editor/map.ts";
import { ViewToolbar } from "../../layout/LayoutViewToolbar.tsx";
import { Camera } from "./camera.ts";
import { RealViewport } from "./RealViewport.tsx";
import css from "./Viewport.module.css";
import { ViewportRoomSwitcher } from "./ViewportRoomSwitcher.tsx";
import { Translate } from "@components/translate/Translate.tsx";

export type ViewportInfo = {
	camera: Camera;
	/** viewport size, in css px */
	viewportSize: Vec2;
	/** viewport position relative to screen, in css px */
	viewportPos: Vec2;
	/** camera bounds, in map units */
	viewportBounds: Bounds;
	room: SkapRoom;
}
export type ViewportLayerFC = FC<{
	viewportInfo: ViewportInfo;
}>;

/** multiplier for wheel event "mode"
 * will almost always be 0
 */
export const wheelMult = (mode: number): number => {
	switch (mode) {
		case 0: return 1;
		case 1: return 2;
		case 2: return 5;
		default: return 1;
	}
};
export const scaleBase = 5;
// one "tick" of the mouse wheel is 100 units, and -1 to flip directions
export const scaleMul = -1 / 100;
export const scaleExp = 1.25;
export const calcScale = (i: number) => scaleBase * scaleExp ** (scaleMul * i);

export type ViewportState = {
	camera: Camera;
	scaleIndex: number;

	currentRoomId: ID | null;
};
export type ViewportAction = (
	| {
		type: "set_camera_pos";
		pos: Vec2;
	}
	| {
		type: "set_camera_scale";
		scaleIndex: number;
	}
	| {
		type: "set_current_room_id";
		currentRoomId: ID | null;
	}
);

const Viewport: Layout.ViewComponent<ViewportState, ViewportAction> = ({
	viewSwitcher, state, dispatchView,
}) => {
	const elRef = useRef<HTMLDivElement>(null);

	const map = useSkapMap();

	const toolbarContents = (
		<>
			{viewSwitcher}
			<ViewportRoomSwitcher selectedRoom={null} {...{ dispatchView }} />
		</>
	);

	if (state.currentRoomId === null) {
		return (
			<div ref={elRef} className={css["viewport"]}
				tabIndex={0}>
				<ViewToolbar>
					{toolbarContents}
				</ViewToolbar>
				<div className={css["viewport-empty"]}>
					<Translate k="viewport.no_room_selected" />
				</div>
			</div>
		);
	}

	const room = map.rooms.get(state.currentRoomId);
	if (!room) {
		return (
			<div ref={elRef} className={css["viewport"]}
				tabIndex={0}>
				<ViewToolbar>
					{toolbarContents}
				</ViewToolbar>
				<div className={css["viewport-empty"]}>
					<Translate k="viewport.no_room_with_id" id={state.currentRoomId} />
				</div>
			</div>
		);
	}

	return <RealViewport
		{...{ state, dispatchView, room, viewSwitcher }}
	/>;
};

export const ViewportVP = makeViewProvider<ViewportState, ViewportAction>({
	name: "map.viewport",
	Component: Viewport,
	icon: "monitor",
	reducer: (state, action) => {
		switch (action.type) {
			case "set_camera_pos": {
				return {
					...state,
					camera: state.camera.set({ pos: action.pos }),
				};
			}
			case "set_camera_scale": {
				return {
					...state,
					scaleIndex: action.scaleIndex,
					camera: state.camera.set({ scale: calcScale(action.scaleIndex) }),
				};
			}
			case "set_current_room_id": {
				return {
					...state,
					currentRoomId: action.currentRoomId,
				};
			}
		}
	},
	newState: () => ({
		camera: new Camera({ pos: vec2(0), scale: calcScale(0) }),
		scaleIndex: 0,

		currentRoomId: null,
	}),
});
