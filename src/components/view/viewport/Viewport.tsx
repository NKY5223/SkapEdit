import { FC, useMemo, useRef, useState } from "react";
import { Camera, useCamera } from "./camera.ts";
import { ViewFC } from "../../layout/LayoutView.tsx";
import { SkapRoom, useMap } from "../../../editor/map.ts";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import css from "./Viewport.module.css";
import { ViewToolbar } from "../../layout/LayoutViewToolbar.tsx";
import "../../../common/vector.ts";
import { Vec2, zero } from "../../../common/vec2.ts";
import { useDrag } from "../../../hooks/useDrag.ts";
import { TextLayer } from "./renderer/text.tsx";
import { useElementSize } from "@hooks/useElementSize.ts";
import { LavaWebGLRenderer } from "./renderer/lava.ts";
import { Bounds } from "@editor/bounds.ts";
import { BackgroundObstacleWebGLRenderer, BackgroundWebGLRenderer } from "./renderer/background.ts";
import { Layout } from "@components/layout/Layout.tsx";

export type ViewportInfo = {
	camera: Camera;
	/** canvas size, in css px */
	viewportSize: Vec2;
	/** camera bounds, in map units */
	viewportBounds: Bounds;
	room: SkapRoom;
}
export type ViewportLayerFC = FC<{
	viewportInfo: ViewportInfo;
}>;

type ViewportCanvasProps = {
	layers: ViewportLayerFC[];
	viewportInfo: ViewportInfo;
};
export const ViewportCanvas: FC<ViewportCanvasProps> = ({
	layers, viewportInfo
}) => {
	/* 
	Desired structure:
	layers:
		webgl {
			gl
			renderer { shared gl, shaders, program, buffers etc... }
			renderer { shared gl, shaders, program, buffers etc... }
			renderer { shared gl, shaders, program, buffers etc... }
			renderer { shared gl, shaders, program, buffers etc... }
			gl and renderers **MUST** persist across renders
			else contexts will probably be lost all the time idk
		}
		text {
			probably just a regular React.FC
		}
		webgl {
			gl
			renderer { ... }
		}
	*/
	return (
		<div className={css["viewport-canvas"]}>
			{
				layers.map((Layer, i) => (
					<Layer key={i} viewportInfo={viewportInfo} />
				))
			}
		</div>
	);
}


const wheelMult = (mode: number): number => {
	switch (mode) {
		case 0x00: return 1;
		case 0x01: return 2;
		case 0x02: return 5;
		default: return 1;
	}
};
const scaleBase = 5;
// one "tick" of the mouse wheel is 100 units, and -1 to flip directions
const scaleMul = -1 / 100;
const scaleExp = 1.25;

export const Viewport: ViewFC = ({
	children,
}) => {
	const layers = useMemo(() => [
		WebGLLayer(
			new BackgroundObstacleWebGLRenderer(),
			new BackgroundWebGLRenderer(),
			new ObstacleWebGLRenderer(),
			new LavaWebGLRenderer(),
		),
		TextLayer
	], []);

	const elRef = useRef<HTMLDivElement>(null);
	const map = useMap();
	const [scaleIndex, setScaleIndex] = useState(0);
	const [camera, setCamera] = useCamera({ pos: zero, scale: scaleBase });
	const { handlePointerDown } = useDrag(1, null, (curr, prev) => {
		setCamera(camera => {
			const diff = curr.sub(prev).div(camera.scale);
			return {
				pos: camera.pos.sub(diff),
			};
		});
	});
	const handleWheel: React.WheelEventHandler<HTMLElement> = e => {
		const d = e.deltaY * wheelMult(e.deltaMode);
		const newIndex = scaleIndex + d;
		const newScale = scaleBase * scaleExp ** (scaleMul * newIndex);

		setScaleIndex(newIndex);
		setCamera({
			scale: newScale
		});
	}

	const viewportSize = useElementSize(elRef);
	const viewportBounds = camera.getBounds(viewportSize);

	const room = map.rooms[0];
	if (!room) {
		throw new Error("Map has no rooms");
	}
	const viewportInfo: ViewportInfo = {
		camera,
		viewportSize,
		room,
		viewportBounds,
	};

	return (
		<div ref={elRef} className={css["viewport"]}
			onPointerDown={handlePointerDown} onWheel={handleWheel}>
			<ViewportCanvas viewportInfo={viewportInfo} layers={layers} />
			<ViewToolbar classes={[css["viewport-topbar"]]}>
				{children}
			</ViewToolbar>
		</div>
	);
}

export namespace Viewport {
	export type State = {
		camera: Camera;
		scaleIndex: number;
	};
	export type Action = (
		| {
			type: "set_pos";
			pos: Vec2;
		}
		| {
			type: "set_scale";
			scaleIndex: number;
		}
		| {
			type: "change_scale";
			scaleIndexChange: number;
		}
	);
}
const calcScale = (i: number) => scaleBase * scaleExp ** (scaleMul * i);
const ViewportComp: (typeof ViewportView)["Component"] = ({
	state,
	viewSwitch,
}) => {
	return (
		<div>
			<ViewToolbar>
				{viewSwitch}
			</ViewToolbar>
			State: {JSON.stringify(state)}<br />
		</div>
	);
};
const ViewportView: Layout.ViewProvider<Viewport.State, Viewport.Action> = {
	name: "viewport",
	new: () => {
		return {
			camera: new Camera({
				pos: zero,
				scale: scaleBase,
			}),
			scaleIndex: 0,
		};
	},
	reducer: (state, action) => {
		const { camera, scaleIndex } = state;
		switch (action.type) {
			case "set_pos": {
				return {
					...state,
					camera: camera.set({ pos: action.pos }),
				};
			}
			case "set_scale": {
				return {
					...state,
					camera: camera.set({ scale: calcScale(action.scaleIndex) }),
				};
			}
			case "change_scale": {
				const newIndex = scaleIndex + action.scaleIndexChange;
				return {
					...state,
					camera: camera.set({ scale: calcScale(newIndex) }),
				};
			}
		}
		return state;
	},
	Component: ViewportComp,
};