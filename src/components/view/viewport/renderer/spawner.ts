import { Color } from "@common/color.ts";
import { entityTextures, unknownTexture } from "@common/entityTextures.ts";
import { ID } from "@common/uuid.ts";
import { polar, vec2, Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { rect } from "../webgl/webgl.ts";
import { RectWebGLRenderer } from "./rect.ts";
import solidFrag from "./shader/solidColor.frag?raw";
import { TextureRect, TextureWebGLRenderer } from "./texture.ts";

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
export class SpawnerEntitiesWebGLRenderer extends TextureWebGLRenderer {
	load(gl: WebGL2RenderingContext) {
		for (const type of knownEntities) {
			this.loadTexture(gl, type, entityTextures[entityToTextureName(type)], 512, 512);
		}
		this.loadTexture(gl, "unknown", unknownTexture, 512, 512);
	}
	textures(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): [
		texture: string, rects: TextureRect[]
	][] {
		const { time } = webGlViewportInfo;
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
		return types.map(t => [t, entitiesToDraw[t].map(entity => ({
			center: entity.pos,
			bounds: new Bounds({ topLeft: vec2(-entity.radius), bottomRight: vec2(entity.radius) }),
			rotation: entity.rotation,
		} satisfies TextureRect))]);
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

export const unitSquareUvs = rect(new Bounds({ left: 0, top: 0, right: 1, bottom: 1 }));

type EntityInitial = {
	pos: Vec2;
	velAngle: number;
	rotation: number;
};
type Entity = {
	pos: Vec2;
	radius: number;
	rotation: number;
};