export type Vector = readonly [number, number] & { /** Vector.toString */ toString: () => string; __brand: "vector" };
export type Matrix = readonly [Vector, Vector] & { /** Matrix.toString */ toString: () => string; __brand: "matrix" };
export type Vector3 = readonly [number, number, number];
export type Matrix3 = readonly [Vector3, Vector3, Vector3];

// prototype extension! it's bad!
const VectorPrototype = {
	__proto__: Array.prototype,
	[Symbol.toStringTag]: "Vector",
	toString(this: Vector) {
		return `${this[0]} ${this[1]}`;
	},
	__brand: "vector",
} as const;
const MatrixPrototype = {
	__proto__: Array.prototype,
	[Symbol.toStringTag]: "Matrix",
	toString(this: Matrix) {
		return `${this[0]} ${this[1]}`;
	},
	__brand: "matrix",
} as const;
export const vec: (x: number, y?: number) => Vector = (x, y) => Object.setPrototypeOf([x, y ?? x] as const, VectorPrototype);
export const mat: (xx: number, xy: number, yx: number, yy: number) => Matrix = (
	(xx, xy, yx, yy) => Object.setPrototypeOf([vec(xx, xy), vec(yx, yy)] as const, MatrixPrototype)
);

export const zeroVec = vec(0);
export const leftMat = mat(0, -1, 1, 0);
export const rightMat = mat(0, 1, -1, 0);

type VectorFunc = (a: Vector, b: Vector) => Vector;
type VectorReducer = (...vectors: Vector[]) => Vector;
const reduce: (reducer: VectorFunc, empty: Vector, useFirstAsInitial?: boolean) => VectorReducer = (
	(reducer, empty, useFirstAsInitial = false) =>
		(...vectors) => useFirstAsInitial
			? vectors.length > 0
				? vectors.slice(1).reduce((acc, curr) => reducer(acc, curr), vectors[0])
				: empty
			: vectors.reduce((acc, curr) => reducer(acc, curr), empty)
);

const functions = {
	add: ([ax, ay], [bx, by]) => vec(ax + bx, ay + by),
	sub: ([ax, ay], [bx, by]) => vec(ax - bx, ay - by),
	mul: ([ax, ay], [bx, by]) => vec(ax * bx, ay * by),
	div: ([ax, ay], [bx, by]) => vec(ax / bx, ay / by),
} satisfies Record<string, VectorFunc>;

export const add = reduce(functions.add, vec(0, 0));
export const sub = reduce(functions.sub, vec(0, 0), true);
export const mul = reduce(functions.mul, vec(1, 1));
export const div = reduce(functions.div, vec(1, 1), true);

export const map: (f: (x: number) => number) => (v: Vector) => Vector = f => v => vec(f(v[0]), f(v[1]));
export const neg: (v: Vector) => Vector = ([x, y]) => vec(-x, -y);
export const dot: (a: Vector, b: Vector) => number = ([ax, ay], [bx, by]) => ax * bx + ay * by;
export const equal: (a: Vector, b: Vector) => boolean = ([ax, ay], [bx, by]) => ax === bx && ay === by;
export const mag: (v: Vector) => number = v => Math.hypot(...v);
export const swap: (v: Vector) => Vector = ([x, y]) => vec(y, x);
export const lerp: (a: Vector, b: Vector, t: number) => Vector = (a, b, t) => add(a, mul(sub(b, a), vec(t)));
export const norm: (v: Vector) => Vector = v => div(v, vec(mag(v)));
export const safeNorm: (v: Vector) => Vector = v => (
	v[0] === 0 && v[1] === 0
		? vec(1, 0)
		: div(v, vec(mag(v)))
);
export const polar: (theta: number, r?: number) => Vector = (theta, r = 1) => vec(r * Math.cos(theta), r * Math.sin(theta));


export const matTranspose: (m: Matrix) => Matrix = ([[xx, xy], [yx, yy]]) => mat(xx, yx, xy, yy);
/**
 * 
 * ```
 * [mxx myx][vx]
 * [mxy myy][vy]
 * ```
 */
export const matMul: (m: Matrix, v: Vector) => Vector = ([[mxx, mxy], [myx, myy]], [vx, vy]) =>
	vec(vx * mxx + vy * myx, vx * mxy + vy * myy);

/**
 * clockwise rotation
 * 
 * ```
 * [cos -sin]  
 * [sin  cos]
 * ```
 */
export const rotMat: (angle: number) => Matrix = angle => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	return mat(cos, sin, -sin, cos);
}

// actual sign, including ±0
const sign = (x: number) => Math.sign(x === 0 ? 1 / x : x);
export const angle: (a: Vector, b: Vector) => number = (a, b) =>
	sign(a[0] * b[1] - a[1] * b[0]) * Math.acos(dot(a, b) / (mag(a) * mag(b)));