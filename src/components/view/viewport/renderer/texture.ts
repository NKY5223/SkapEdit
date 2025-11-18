import { ID } from "@common/uuid.ts";
import { mat2, polar, rotationMat, Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { rect } from "../webgl/webgl.ts";
import textureFrag from "./shader/texture.frag?raw";
import textureVert from "./shader/texture.vert?raw";

export type TextureRect = {
	center: Vec2;
	bounds: Bounds;
	rotation: number;
};

export abstract class TextureWebGLRenderer extends WebGLLayerRenderer {
	constructor() {
		super({
			vert: textureVert,
			frag: textureFrag,
		});
	}
	abstract textures(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): [
		texture: string,
		rects: TextureRect[],
	][];
	
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
	}

	render(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);
		this.enableDefaultBlend(gl);

		const {
			cameraSize,
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const textures = this.textures(viewportInfo, webGlViewportInfo);

		this.preRender(gl, viewportInfo, webGlViewportInfo);
		for (const [texture, rects] of textures) {
			const pos: Vec2[] = rects.flatMap(({ center, bounds, rotation }) => rotatedBounds(center, bounds, rotation));
			const uvs: Vec2[] = rects.flatMap(() => unitSquareUvs);

			this.setUniformTexture(gl, "uSampler", texture, 0);
			this.setAttribute2f(gl, "aPosition", pos);
			this.setAttribute2f(gl, "aUv", uvs);

			gl.drawArrays(gl.TRIANGLES, 0, pos.length);
		}
		this.postRender(gl, viewportInfo, webGlViewportInfo);
		
		this.disableBlend(gl);
	}
}

export const unitSquareUvs = rect(new Bounds({ left: 0, top: 0, right: 1, bottom: 1 }));

export const rotatedBounds = (pos: Vec2, bounds: Bounds, rotation: number): Vec2[] => {
	const mat = rotationMat(rotation);
	return rect(bounds).map(v => mat.mulVec(v).add(pos));
}