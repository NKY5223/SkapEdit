import { groupEqual } from "@common/array.ts";
import { unknownTexture } from "@common/entityTextures.ts";
import { hatTextures } from "@common/hatTextures.ts";
import { hatNames } from "@editor/object/hatReward.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { rewardBounds } from "./reward.ts";
import { TextureRect, TextureWebGLRenderer } from "./texture.ts";

export class HatRewardWebGLRenderer extends TextureWebGLRenderer {
	load(gl: WebGL2RenderingContext): void {
		for (const name of hatNames) {
			this.loadTexture(gl, name, hatTextures[name], 512, 512);
		}
		this.loadTexture(gl, "unknown", unknownTexture, 512, 512);
	}
	textures(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): [texture: string, rects: TextureRect[]][] {
		const hatRewards = viewportInfo.room.objects.values().filter(obj => obj.type === "hatReward").toArray();

		const hats = groupEqual(
			hatRewards.map(a => ({
				pos: a.pos,
				hat: (hatNames as readonly string[]).includes(a.hatReward)
					? a.hatReward
					: "unknown"
			})),
			(a, b) => a.hat === b.hat,
		).map(a => [a[0].hat, a] as const);

		return hats.map(([hat, rewards]) => [hat, rewards.map(({ pos }) => ({
			center: pos,
			bounds: rewardBounds,
			rotation: 0,
		}))]);
	}
}