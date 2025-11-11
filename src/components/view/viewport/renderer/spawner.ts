import { Color } from "@common/color.ts";
import { ID } from "@common/uuid.ts";
import { polar, vec2, Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { rect } from "../webgl/webgl.ts";
import { RectWebGLRenderer } from "./rect.ts";
import solidFrag from "./shader/solidColor.frag?raw";
import textureFrag from "./shader/texture.frag?raw";
import textureVert from "./shader/texture.vert?raw";

import { entityTextures } from "@common/entityTextures.ts";

export const knownEntities = [
	"accelerator",
	"bomb",
	"bouncer",
	"contractor",
	"decelerator",
	"disabler",
	"drainer",
	"expander",
	"following",
	"freezer",
	"gravityDown",
	"gravityLeft",
	"gravityRight",
	"gravityUp",
	"harmless",
	"immune",
	"megaAccelerator",
	"megaBouncer",
	"monster",
	"normal",
	"reverse",
	"rotating",
	"shield",
	"shooter",
	"snek",
	"spike",
	"stutter",
	"taker",
	"wavy",
] as const;
export type KnownEntity = typeof knownEntities[number];
// @ts-expect-error includes is not a type guard for some reason
export const isKnownEntityType = (type: string): type is KnownEntity => knownEntities.includes(type);
export const entityToTextureName = (type: KnownEntity): keyof typeof entityTextures => {
	switch (type) {
		case "bomb": return "bomb0";
		case "contractor": return "contractor0";
		case "snek": return "snekHead";
		default: return type;
	}
}

const rgba = Color.SPAWNER_BACKGROUND.rgba();
export class SpawnerBackgroundWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(solidFrag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "spawner")
			.map(o => o.bounds)
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.enableDefaultBlend(gl);
		this.setUniform4f(gl, "uColor", rgba);
	}
	postRender(gl: WebGL2RenderingContext): void {
		this.disableBlend(gl);
	}
}
export class SpawnerEntitiesWebGLRenderer extends WebGLLayerRenderer {
	constructor() {
		super({
			vert: textureVert,
			frag: textureFrag,
		});
	}
	load(gl: WebGL2RenderingContext) {
		for (const type of knownEntities) {
			this.loadTexture(gl, type, entityTextures[entityToTextureName(type)], 512, 512);
		}
		this.loadTexture(gl, "unknown", entityTextures.unknown, 512, 512);
	}
	render(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);
		this.enableDefaultBlend(gl);

		const {
			cameraSize,
			time
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const spawners = viewportInfo.room.objects.values().filter(obj => obj.type === "spawner").toArray();

		const entitiesToDraw: Record<KnownEntity | "unknown", Entity[]> = {
			accelerator: [],
			bomb: [],
			bouncer: [],
			contractor: [],
			decelerator: [],
			disabler: [],
			drainer: [],
			expander: [],
			following: [],
			freezer: [],
			gravityDown: [],
			gravityLeft: [],
			gravityRight: [],
			gravityUp: [],
			harmless: [],
			immune: [],
			megaAccelerator: [],
			megaBouncer: [],
			monster: [],
			normal: [],
			reverse: [],
			rotating: [],
			shield: [],
			shooter: [],
			snek: [],
			spike: [],
			stutter: [],
			taker: [],
			wavy: [],
			
			unknown: [],
		};
		for (const spawner of spawners) {
			const initialses = get(SpawnerEntitiesWebGLRenderer.entityInitials, spawner.id, () => []);
			while (initialses.length < spawner.entities.length) {
				initialses.push([]);
			}
			while (initialses.length > spawner.entities.length) {
				initialses.pop();
			}
			for (const [i, { type, count, speed, radius }] of spawner.entities.entries()) {
				const initials = initialses[i];
				while (initials.length < count) {
					initials.push({
						pos: vec2(
							Math.random() * 1000 - 500,
							Math.random() * 1000 - 500,
						),
						velAngle: Math.random() * 2 * Math.PI,
						rotation: Math.random() * 2 * Math.PI,
					});
				}
				while (initials.length > count) {
					initials.pop();
				}
				const bounds = spawner.bounds.inset(radius);
				const doRotation = type === "rotating" ? 1 : 0;
				const rotationSpeed = type === "rotating"
					// once every 7 seconds??
					? 2 * Math.PI / 7
					: 0;
				// do pool table stuff for each initial
				const entities: Entity[] = initials.map(({ pos, velAngle, rotation }) => ({
					pos: bounds.bounce(pos.add(polar(velAngle, speed * time))),
					radius,
					rotation: doRotation * (rotation + rotationSpeed * time),
				}));

				if (isKnownEntityType(type)) {
					entitiesToDraw[type].push(...entities);
				} else {
					entitiesToDraw.unknown.push(...entities);
				}
			}
		}

		Object.assign(window, { entitiesToDraw });

		const types = [...knownEntities, "unknown"] as const;
		for (const type of types) {
			const entities = entitiesToDraw[type];
			const pos: Vec2[] = entities.flatMap(({ pos, radius, rotation }) => rotatedSquare(pos, radius, rotation));
			const uvs: Vec2[] = entities.flatMap(() => unitSquareUvs);

			this.setUniformTexture(gl, "uSampler", type, 0);
			this.setAttribute2f(gl, "aPosition", pos);
			this.setAttribute2f(gl, "aUv", uvs);

			gl.drawArrays(gl.TRIANGLES, 0, pos.length);
		}

		this.disableBlend(gl);
	}
	static entityInitials = new Map<ID, EntityInitial[][]>();
}

const get = <K, T>(map: Map<K, T>, key: K, create: () => T): T => {
	const value = map.get(key);
	if (value !== undefined) return value;
	const newValue = create();
	map.set(key, newValue);
	return newValue;
}

const unitSquareUvs = rect(new Bounds({ left: 0, top: 0, right: 1, bottom: 1 }));

/** rotated clockwise */
const rotatedSquare = (pos: Vec2, radius: number, rotation: number): Vec2[] => {
	const deg45 = Math.PI / 4;
	const r = radius * Math.SQRT2;
	const topLeft = pos.add(polar(rotation - 1 * deg45, r));
	const topRight = pos.add(polar(rotation - 3 * deg45, r));
	const bottomRight = pos.add(polar(rotation + 3 * deg45, r));
	const bottomLeft = pos.add(polar(rotation + 1 * deg45, r));
	return [
		topLeft,
		topRight,
		bottomRight,
		topLeft,
		bottomLeft,
		bottomRight,
	];
}

type EntityInitial = {
	pos: Vec2;
	velAngle: number;
	rotation: number;
};
type Entity = {
	pos: Vec2;
	radius: number;
	rotation: number;
}