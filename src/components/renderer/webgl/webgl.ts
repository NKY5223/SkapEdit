import { ViewportBounds, ViewportLayer } from "../layer.ts";

type WebGLLayerData = {
	canvas: HTMLCanvasElement;
	gl: WebGL2RenderingContext;
	/**
	 * First WebGLLayer to use this canvas, 
	 * responsible for initialising the frame
	 */
	first: WebGLLayer;
};

function createWebGLLayerData(first: WebGLLayer): WebGLLayerData {
	const canvas = document.createElement("canvas");
	const gl = canvas.getContext("webgl2");
	if (!gl) throw new Error("Could not create WebGL2 context.");
	return {
		canvas,
		gl,
		first,
	};
}
type WebGLValueType = {
	size: number;
	type: WebGL2RenderingContext["BYTE" | "SHORT" | "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "FLOAT" | "INT"];
};
const GL_FLOAT = 5126;
const GL_INT = 5124;

export abstract class WebGLLayer<T = unknown> implements ViewportLayer<T, WebGLLayer<unknown>> {
	ready: boolean;
	data!: WebGLLayerData;

	element!: HTMLCanvasElement;
	program!: WebGLProgram;
	
	buffers: Map<string, WebGLBuffer>;
	uniformLocationCache: Map<string, WebGLUniformLocation>;
	attribLocationCache: Map<string, number>;

	constructor(public zIndex: number, public shaderSource: {
		vert: string;
		frag: string;
	}) {
		this.ready = false;

		this.uniformLocationCache = new Map<string, WebGLUniformLocation>();
		this.attribLocationCache = new Map<string, GLint>();

		this.buffers = new Map<string, WebGLBuffer>();
	}

	canInitWith(layer: unknown): layer is WebGLLayer<unknown> {
		return layer instanceof WebGLLayer;
	}
	init(layer?: WebGLLayer<unknown>) {
		const data = layer?.data ?? createWebGLLayerData(this);

		this.data = data;
		this.element = data.canvas;

		const gl = data.gl;
		if (!gl) throw new Error("Could not find WebGL2 context.");
		if (gl.isContextLost()) throw new Error("WebGL2 context lost context.");

		const vertShader = this.createShader(gl, gl.VERTEX_SHADER, this.shaderSource.vert);
		const fragShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.shaderSource.frag);

		const program = this.createProgram(gl, vertShader, fragShader);

		this.program = program;

		this.buffers.clear();
		this.uniformLocationCache.clear();
		this.attribLocationCache.clear();

		this.ready = true;
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
	protected setUniform(gl: WebGL2RenderingContext, type: WebGLValueType, name: string, ...values: number[]) {
		const location = this.getUniformLocation(name);
		
		switch (type.type) {
			case GL_FLOAT: {
				switch (type.size) {
					case 1: {
						gl.uniform1f(location, values[0]);
						break;
					}
					case 2: {
						gl.uniform2f(location, values[0], values[1]);
						break;
					}
					case 3: {
						gl.uniform3f(location, values[0], values[1], values[2]);
						break;
					}
					case 4: {
						gl.uniform4f(location, values[0], values[1], values[2], values[3]);
						break;
					}
				}
				break;
			}
			case GL_INT: {
				switch (type.size) {
					case 1: {
						gl.uniform1i(location, values[0]);
						break;
					}
					case 2: {
						gl.uniform2i(location, values[0], values[1]);
						break;
					}
					case 3: {
						gl.uniform3i(location, values[0], values[1], values[2]);
						break;
					}
					case 4: {
						gl.uniform4i(location, values[0], values[1], values[2], values[3]);
						break;
					}
				}
				break;
			}
		}
	}
	protected setAttribute(gl: WebGL2RenderingContext, target: GLenum, name: string, type: WebGLValueType, buffer: WebGLBuffer) {
		const location = this.getAttribLocation(name);

		gl.bindBuffer(target, buffer);

		gl.vertexAttribPointer(location, type.size, type.type, false, 0, 0);
		gl.enableVertexAttribArray(location);
	}

	protected getBuffer(gl: WebGL2RenderingContext, name: string): WebGLBuffer {
		const existing = this.buffers.get(name);
		if (existing) return existing;

		const buffer = gl.createBuffer();
		if (!buffer) throw new Error("Could not create buffer.");

		this.buffers.set(name, buffer);

		return buffer;
	}
	protected getUniformLocation(name: string): WebGLUniformLocation {
		const cached = this.uniformLocationCache.get(name);
		if (cached) return cached;

		const location = this.gl.getUniformLocation(this.program, name);
		if (!location) throw new Error(`Could not get uniform location for ${name}.`);
		this.uniformLocationCache.set(name, location);

		return location;
	}
	protected getAttribLocation(name: string): GLint {
		const cached = this.attribLocationCache.get(name);
		if (cached) return cached;

		const location = this.gl.getAttribLocation(this.program, name);
		this.attribLocationCache.set(name, location);

		return location;
	}

	setup(viewport: ViewportBounds) {
		const gl = this.gl;

		if (this.data.first === this) {
			const w = viewport.width;
			const h = viewport.height;

			const updateWidth = this.canvas.width !== w;
			const updateHeight = this.canvas.height !== h;
			if (updateWidth) this.canvas.width = w;
			if (updateHeight) this.canvas.height = h;

			if (updateWidth || updateHeight) gl.viewport(0, 0, this.canvas.width, this.canvas.height);

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
	}

	abstract render(viewport: ViewportBounds, things: T[]): void;

	abstract canRender(thing: unknown): thing is T;

	get canvas() { return this.data.canvas; }
	get gl() { return this.data.gl; }
	set gl(gl) { this.data.gl = gl; }
}