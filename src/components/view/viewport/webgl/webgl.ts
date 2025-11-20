import { Vec2 } from "@common/vec2.ts";
import { Vector } from "../../../../common/vector.ts";
import { Bounds } from "../../../../editor/bounds.ts";
import { saveFile } from "@common/save.ts";

type WebGLValueType = {
	size: number;
	type: WebGL2RenderingContext["BYTE" | "SHORT" | "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "FLOAT" | "INT"];
};
const GL_FLOAT = 5126;
// const GL_INT = 5124;

export abstract class WebGlRenderer<T extends unknown[]> {
	info?: {
		gl: WebGL2RenderingContext;
		program: WebGLProgram;

		buffers: Map<string, WebGLBuffer>;
		textures: Map<string, WebGLTexture>;
		uniformLocationCache: Map<string, WebGLUniformLocation>;
		attribLocationCache: Map<string, number>;
	};

	constructor(public shaderSource: {
		vert: string;
		frag: string;
	}) {
	}

	init(gl: WebGL2RenderingContext) {
		if (gl.isContextLost()) throw new Error("WebGL2 context is lost.");

		const vertShader = this.createShader(gl, gl.VERTEX_SHADER, this.shaderSource.vert);
		const fragShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.shaderSource.frag);

		const program = this.createProgram(gl, vertShader, fragShader);

		this.info = {
			gl,
			program,
			buffers: new Map(),
			textures: new Map(),
			attribLocationCache: new Map(),
			uniformLocationCache: new Map(),
		};

		this.load(gl);
	}
	cleanup() {
		if (!this.info) return;
		this.info = undefined;
	}
	protected createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
		const name = type === gl.VERTEX_SHADER ? "vertex" : type === gl.FRAGMENT_SHADER ? "fragment" : "???";
		const shader = gl.createShader(type);
		if (!shader) throw new Error(`Could not create WebGL2 ${name} shader.`);

		gl.shaderSource(shader, source);

		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const message = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw new Error(`WebGL2 ${name} shader failed to compile: ${message}`);
		}

		return shader;
	}
	protected createProgram(gl: WebGL2RenderingContext, vert: WebGLShader, frag: WebGLShader): WebGLProgram {
		const program = gl.createProgram();
		if (!program) throw new Error("Could not create WebGL2 program.");

		gl.attachShader(program, vert);
		gl.attachShader(program, frag);

		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const message = gl.getProgramInfoLog(program);
			gl.deleteProgram(program);
			throw new Error(`WebGL2 program failed to link: ${message}`);
		}

		gl.detachShader(program, vert);
		gl.detachShader(program, frag);
		gl.deleteShader(vert);
		gl.deleteShader(frag);

		return program;
	}

	protected setBuffer(gl: WebGL2RenderingContext, name: string, target: GLenum, data: ArrayBuffer, usage: GLenum): WebGLBuffer {
		const buffer = this.getBuffer(gl, name);

		gl.bindBuffer(target, buffer);
		gl.bufferData(target, data, usage);

		return buffer;
	}
	static readonly TYPES = {
		float: { size: 1, type: GL_FLOAT },
		vec2: { size: 2, type: GL_FLOAT },
		vec3: { size: 3, type: GL_FLOAT },
		vec4: { size: 4, type: GL_FLOAT },
	} satisfies Record<string, WebGLValueType>;

	// #region setUniformX
	protected setUniformFloat(gl: WebGL2RenderingContext, name: string, value: number) {
		return this.setUniform1f(gl, name, value);
	}
	protected setUniform1f(gl: WebGL2RenderingContext, name: string, value: number) {
		const location = this.getUniformLocation(gl, name);

		gl.uniform1f(location, value);
	}
	protected setUniform2f(gl: WebGL2RenderingContext, name: string, value: Vector<2>) {
		const location = this.getUniformLocation(gl, name);

		gl.uniform2f(location, value[0], value[1]);
	}
	protected setUniform3f(gl: WebGL2RenderingContext, name: string, value: Vector<3>) {
		const location = this.getUniformLocation(gl, name);

		gl.uniform3f(location, value[0], value[1], value[2]);
	}
	protected setUniform4f(gl: WebGL2RenderingContext, name: string, value: Vector<4>) {
		const location = this.getUniformLocation(gl, name);

		gl.uniform4f(location, value[0], value[1], value[2], value[3]);
	}
	// #endregion
	// #region setAttributeX
	private setAttribute(gl: WebGL2RenderingContext, name: string, values: number[], size: number, type: GLenum, target: GLenum = 34962, usage: GLenum = 35048) {
		const location = this.getAttribLocation(gl, name);

		const buffer = this.setBuffer(gl, name, target, new Float32Array(values).buffer, usage);

		gl.bindBuffer(target, buffer);
		gl.vertexAttribPointer(location, size, type, false, 0, 0);
		gl.enableVertexAttribArray(location);
	}
	protected setAttribute1f(gl: WebGL2RenderingContext, name: string, values: number[], target: GLenum = 34962, usage: GLenum = 35048) {
		this.setAttribute(gl, name, values, 1, gl.FLOAT, target, usage);
	}
	protected setAttribute2f(gl: WebGL2RenderingContext, name: string, values: Vector<2>[], target: GLenum = 34962, usage: GLenum = 35048) {
		this.setAttribute(gl, name, values.map(v => v.components).flat(), 2, gl.FLOAT, target, usage);
	}
	protected setAttribute3f(gl: WebGL2RenderingContext, name: string, values: Vector<3>[], target: GLenum = 34962, usage: GLenum = 35048) {
		this.setAttribute(gl, name, values.map(v => v.components).flat(), 3, gl.FLOAT, target, usage);
	}
	protected setAttribute4f(gl: WebGL2RenderingContext, name: string, values: Vector<4>[], target: GLenum = 34962, usage: GLenum = 35048) {
		this.setAttribute(gl, name, values.map(v => v.components).flat(), 4, gl.FLOAT, target, usage);
	}
	// #endregion

	protected getBuffer(gl: WebGL2RenderingContext, name: string): WebGLBuffer {
		if (!this.info) throw new Error(`WebGLRenderer is not initialised.`);
		const existing = this.info.buffers.get(name);
		if (existing) return existing;

		const buffer = gl.createBuffer();
		if (!buffer) throw new Error("Could not create buffer.");

		this.info.buffers.set(name, buffer);

		return buffer;
	}
	protected getUniformLocation(gl: WebGL2RenderingContext, name: string): WebGLUniformLocation {
		if (!this.info) throw new Error(`WebGLRenderer is not initialised.`);
		const cached = this.info.uniformLocationCache.get(name);
		if (cached) return cached;

		const location = gl.getUniformLocation(this.info.program, name);
		if (!location) throw new Error(`Could not get uniform location for ${name}.`);
		this.info.uniformLocationCache.set(name, location);

		return location;
	}
	protected getAttribLocation(gl: WebGL2RenderingContext, name: string): GLint {
		if (!this.info) throw new Error(`WebGLRenderer is not initialised.`);
		const cached = this.info.attribLocationCache.get(name);
		if (cached) return cached;

		const location = gl.getAttribLocation(this.info.program, name);
		this.info.attribLocationCache.set(name, location);

		return location;
	}

	protected createTexture(gl: WebGL2RenderingContext, imageSource: Promise<TexImageSource>) {
		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);

		/** mipmap level */
		const level = 0;
		const format = gl.RGBA;
		const type = gl.UNSIGNED_BYTE;
		gl.texImage2D(gl.TEXTURE_2D,
			level,
			format,
			1, 1, 0,
			format, type,
			new Uint8Array([0xff, 0x00, 0xff, 0xff])
		);

		imageSource.then(src => {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D,
				level,
				format, format, type,
				src,
			);

			const doMipmap = "width" in src && isPowerOf2(src.width) && isPowerOf2(src.height);
			if (doMipmap) {
				// enable mipmap
				gl.generateMipmap(gl.TEXTURE_2D);
			} else {
				// disable mipmap
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			}
		}).catch(console.error);

		return texture;
	}
	protected loadTexture(gl: WebGL2RenderingContext, name: string, url: string, width: number, height: number) {
		if (!this.info) throw new Error(`WebGLRenderer is not initialised.`);
		const image = new Image();
		const { promise, resolve, reject } = Promise.withResolvers<OffscreenCanvas>();
		image.addEventListener("load", () => {
			const canvas = new OffscreenCanvas(width, height);
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Could not get offscreen canvas context for image loading.");

			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(image, 0, 0, width, height);
			resolve(canvas);

			if (import.meta.env.DEV) {
				const webglTextures = "webglTextures" in window && typeof window.webglTextures === "object" && window.webglTextures
					? window.webglTextures
					: Object.assign(window, { webglTextures: {} }).webglTextures;
				// @ts-expect-error
				webglTextures[name] = canvas;
			}
		});
		const texture = this.createTexture(gl, promise);
		this.info.textures.set(name, texture);
		image.src = url;
	}
	protected getTexture(name: string) {
		if (!this.info) throw new Error(`WebGLRenderer is not initialised.`);
		const texture = this.info.textures.get(name);
		if (!texture) throw new Error(`No texture with name ${name}.`);
		return texture;
	}
	protected setUniformTexture(gl: WebGL2RenderingContext, name: string, textureName: string, unit: number) {
		if (unit !== Math.trunc(unit)) throw new Error(`unit must be an integer.`);
		const max: number = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
		if (unit >= max) throw new Error(`Not enough texture image units (max index ${max - 1}). Use at most 7.`);
		const key = `TEXTURE${unit}` as keyof typeof gl & `TEXTURE${number}`;

		const location = this.getUniformLocation(gl, name);
		const texture = this.getTexture(textureName);

		gl.activeTexture(gl[key]);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(location, unit);
	}

	/** This method is called in `init()`. You may call `loadTexture()` in here to load textures before they are drawn. */
	load(gl: WebGL2RenderingContext): void {}
	abstract render(...data: T): void;

	get canvas() { return this.info?.gl.canvas; }
}

const isPowerOf2 = (n: number) => (n & (n - 1)) === 0;

Object.assign(window, {
	saveOffscreenCanvas: (canvas: OffscreenCanvas) => {
		saveFile("canvas.png", () => canvas.convertToBlob(), {
			id: "skapedit-saveOffscreenCanvas",
		});
	}
});

export function rect(bounds: Bounds): Vec2[] {
	const { topLeft, topRight, bottomLeft, bottomRight, } = bounds;
	return [
		topLeft,
		topRight,
		bottomRight,
		topLeft,
		bottomLeft,
		bottomRight,
	];
}