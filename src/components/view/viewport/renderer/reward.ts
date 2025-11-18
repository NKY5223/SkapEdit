import { powerTextures } from "@common/powerTextures.ts";
import { TextureRect, TextureWebGLRenderer } from "./texture.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { powerNames, powerNamesArray, rewardRadius } from "@editor/object/reward.tsx";
import { unknownTexture } from "@common/entityTextures.ts";
import { groupEqual } from "@common/array.ts";
import { Bounds } from "@editor/bounds.ts";
import { vec2 } from "@common/vec2.ts";

export const rewardBounds = new Bounds({ topLeft: vec2(-rewardRadius), bottomRight: vec2(rewardRadius) });

export class RewardWebGLRenderer extends TextureWebGLRenderer {
	load(gl: WebGL2RenderingContext): void {
		for (const [, name] of powerNamesArray) {
			this.loadTexture(gl, name, powerTextures[name], 512, 512);
		}
		this.loadTexture(gl, "unknown", unknownTexture, 512, 512);
	}
	textures(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): [texture: string, rects: TextureRect[]][] {
		const rewards = viewportInfo.room.objects.values().filter(obj => obj.type === "reward").toArray();

		const powers = groupEqual(
			rewards.flatMap(reward => reward.reward.map(p => ({
				pos: reward.pos,
				power: powerNames.get(p) ?? "unknown"
			}))),
			(a, b) => a.power === b.power,
		).map(a => [a[0].power, a] as const);
		return powers.map(([power, poss]) => [power, poss.map(({ pos }) => ({
			center: pos,
			bounds: rewardBounds,
			rotation: 0,
		}))]);
	}
}