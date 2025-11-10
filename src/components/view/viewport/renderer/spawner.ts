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

import textureUrlNormal from "/textures/entity/normal.svg";
import textureUrlReverse from "/textures/entity/reverse.svg";
import textureUrlSpike from "/textures/entity/spike.svg";
import textureUrlBouncer from "/textures/entity/bouncer.svg";
import textureUrlHarmless from "/textures/entity/harmless.svg";
import textureUrlRotating from "/textures/entity/rotating.svg";
import textureUrlUnknown from "/textures/entity/unknown.svg";

const knownEntities = ["normal", "reverse", "spike", "bouncer", "harmless", "rotating"] as const;
// @ts-expect-error includes is not a type guard for some reason
const isKnown = (type: string): type is typeof knownEntities[number] => knownEntities.includes(type);

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
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		this.setUniform4f(gl, "uColor", rgba);
	}
	postRender(gl: WebGL2RenderingContext): void {
		gl.disable(gl.BLEND);
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
		this.loadTexture(gl, "normal", textureUrlNormal, 512, 512);
		this.loadTexture(gl, "reverse", textureUrlReverse, 512, 512);
		this.loadTexture(gl, "spike", textureUrlSpike, 512, 512);
		this.loadTexture(gl, "bouncer", textureUrlBouncer, 512, 512);
		this.loadTexture(gl, "harmless", textureUrlHarmless, 512, 512);
		this.loadTexture(gl, "rotating", textureUrlRotating, 512, 512);

		this.loadTexture(gl, "unknown", textureUrlUnknown, 512, 512);
	}
	render(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		const {
			timeOrigin,
		} = viewportInfo;
		const {
			cameraSize,
		} = webGlViewportInfo;

		const time = (performance.now() - timeOrigin) / 1000;
		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const spawners = viewportInfo.room.objects.values().filter(obj => obj.type === "spawner").toArray();

		const entitiesToDraw: {
			normal: Entity[];
			reverse: Entity[];
			spike: Entity[];
			bouncer: Entity[];
			harmless: Entity[];
			rotating: Entity[];

			unknown: Entity[];
		} = {
			normal: [],
			reverse: [],
			spike: [],
			bouncer: [],
			harmless: [],
			rotating: [],

			unknown: [],
		};
		for (const spawner of spawners) {
			const initialses = get(SpawnerEntitiesWebGLRenderer.entityInitials, spawner.id, () => []);
			while (initialses.length <= spawner.entities.length) {
				initialses.push([]);
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

				if (isKnown(type)) {
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

		gl.disable(gl.BLEND);
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