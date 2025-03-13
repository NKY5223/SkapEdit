export type Vector = readonly [number, number] & { /** Vector.toString */ toString: () => string; __brand: "vector" };
export type Matrix = readonly [Vector, Vector] & { /** Matrix.toString */ toString: () => string; __brand: "matrix" };
export type Vector3 = readonly [number, number, number];
export type Matrix3 = readonly [Vector3, Vector3, Vector3];

// prototype extension! probably bad!
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
export const vec = (x: number, y?: number): Vector => Object.setPrototypeOf([x, y ?? x] as const, VectorPrototype);
export function mat(x: Vector, y: Vector): Matrix;
export function mat(xx: number, xy: number, yx: number, yy: number): Matrix;
export function mat(xx: number | Vector, xy: number | Vector, yx?: number, yy?: number) {
	if (isVec(xx) && isVec(xy)) {
		return Object.setPrototypeOf([xx, xy] as const, MatrixPrototype);
	}
	if (typeof xx === "number" && typeof xy === "number" && typeof yx === "number" && typeof yy === "number") {
		return mat(vec(xx, xy), vec(yx, yy));
	}
	throw new TypeError(`mat() takes 2 Vectors or 4 numbers.`);
}
export const isVec = (v: unknown): v is Vector => typeof v === "object" && !!v && ({}).isPrototypeOf.call(VectorPrototype, v);
export const isMat = (m: unknown): m is Vector => typeof m === "object" && !!m && ({}).isPrototypeOf.call(MatrixPrototype, m);
const typeOf = (x: unknown): string => (
	isVec(x) ? "Vector" :
		isMat(x) ? "Matrix" :
			x === null ? "null" :
				typeof x
);
const toVec = (v: Vector | number): Vector => isVec(v) ? v : vec(v);
/** can't use 0⃗ because it starts with 0 */
export const zeroVec = vec(0);
export const î = vec(1, 0);
export const ĵ = vec(0, 1);
export const leftMat = mat(0, -1, 1, 0);
export const rightMat = mat(0, 1, -1, 0);
export const orthMat: (v: Vector) => Matrix = ([x, y]) => mat(x, y, -y, x);

// #region Simple functions
type VectorFunc = (a: Vector, b: Vector) => Vector;
type VectorReducer = (...vectors: (Vector | number)[]) => Vector;
const reduce: (reducer: VectorFunc, empty: Vector, useFirstAsInitial?: boolean) => VectorReducer = (
	(reducer, empty, useFirstAsInitial = false) =>
		(...vectors) => useFirstAsInitial
			? vectors.length > 0
				? vectors.slice(1).reduce<Vector>((acc, curr) => reducer(acc, toVec(curr)), toVec(vectors[0]))
				: empty
			: vectors.reduce<Vector>((acc, curr) => reducer(acc, toVec(curr)), empty)
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

export const dot: (a: Vector, b: Vector) => number = ([ax, ay], [bx, by]) => ax * bx + ay * by;
export const dotNorm = (a: Vector, b: Vector) => dot(a, b) / (mag(a) * mag(b));
export const equal: (a: Vector, b: Vector) => boolean = ([ax, ay], [bx, by]) => ax === bx && ay === by;
export const parallel = (a: Vector, b: Vector, ε: number = 0.001) => Math.abs(dotNorm(a, b)) > 1 - ε;

export const neg: (v: Vector) => Vector = ([x, y]) => vec(-x, -y);
export const mag = (v: Vector) => Math.hypot(...v);
export const arg = (v: Vector) => Math.atan2(v[1], v[0]);
export const swap: (v: Vector) => Vector = ([x, y]) => vec(y, x);
export const norm: (v: Vector, size?: number) => Vector = (v, size = 1) => mul(v, vec(size / mag(v)));
export const safeNorm = (v: Vector, d: Vector = î): Vector => (
	equal(v, zeroVec)
		? d
		: div(v, vec(mag(v)))
);
export const polar: (theta: number, r?: number) => Vector = (theta, r = 1) => vec(r * Math.cos(theta), r * Math.sin(theta));
export const map: (f: (x: number) => number) => (v: Vector) => Vector = f => v => vec(f(v[0]), f(v[1]));
// #endregion

export function lerp(a: number, b: number, t: number): number;
export function lerp(a: Vector, b: Vector, t: number): Vector;
export function lerp(a: number | Vector, b: number | Vector, t: number) {
	if (typeof a === "number" && typeof b === "number") {
		return a + (b - a) * t;
	} else if (isVec(a) && isVec(b)) {
		return add(a, mul(sub(b, a), vec(t)));
	}
	throw new TypeError(`Type mismatch: Expected ${a}: ${typeOf(a)} and ${b}: ${typeOf(b)} to be of the same type.`);
}

export function curriedLerp(a: number, b: number): (t: number) => number;
export function curriedLerp(a: Vector, b: Vector): (t: number) => Vector;
export function curriedLerp(a: number | Vector, b: number | Vector) {
	if (typeof a === "number" && typeof b === "number") {
		return (t: number) => lerp(a, b, t);
	} else if (isVec(a) && isVec(b)) {
		return (t: number) => lerp(a, b, t);
	}
}

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
export const det: (m: Matrix) => number = ([[xx, xy], [yx, yy]]) => xx * yy - xy * yx;

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
/** @returns value in [-π, π] */
export const angleBetween = (a: Vector, b: Vector) => sign(det(mat(a, b))) * Math.acos(dotNorm(a, b));