import { Vec2 } from "../../../../common/vector.ts";
import { Bounds } from "../../../editor/Bounds.ts";

type WebGLValueType = {
	size: number;
	type: WebGL2RenderingContext["BYTE" | "SHORT" | "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "FLOAT" | "INT"];
};
const GL_FLOAT = 5126;
const GL_INT = 5124;

export abstract class WebGLRenderer<T extends unknown[]> {
	ready: boolean;

	gl!: WebGL2RenderingContext;

	program!: WebGLProgram;
	
	buffers: Map<string, WebGLBuffer>;
	uniformLocationCache: Map<string, WebGLUniformLocation>;
	attribLocationCache: Map<string, number>;

	constructor(public shaderSource: {
		vert: string;
		frag: string;
	}) {
		this.ready = false;

		this.uniformLocationCache = new Map<string, WebGLUniformLocation>();
		this.attribLocationCache = new Map<string, GLint>();

		this.buffers = new Map<string, WebGLBuffer>();
	}

	init(gl: WebGL2RenderingContext) {
		if (gl.isContextLost()) throw new Error("WebGL2 context is lost.");

		this.gl = gl;

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
	// #region setUniformX
	protected setUniformFloat(gl: WebGL2RenderingContext, name: string, value: number) {
		const location = this.getUniformLocation(name);

		gl.uniform1f(location, value);
	}
	protected setUniformFloat2(gl: WebGL2RenderingContext, name: string, value: Vec2) {
		const location = this.getUniformLocation(name);

		gl.uniform2f(location, value[0], value[1]);
	}
	// #endregion

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

	abstract render(...data: T): void;

	get canvas() { return this.gl.canvas; }
}

export function quad(bounds: Bounds): number[] {
	const { left: l, top: t, right: r, bottom: b } = bounds;
	return [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 0],
		[1, 1],
		[0, 1],
	].flatMap(([x, y]) => [x ? r : l, y ? b : t]);
}