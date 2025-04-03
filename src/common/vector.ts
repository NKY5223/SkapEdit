type Vec2 = readonly [number, number] & { /** Vector.toString */ toString: () => string; __brand: "vector" };
type Mat2 = readonly [Vec2, Vec2] & { /** Matrix.toString */ toString: () => string; __brand: "matrix" };

// cursed
const VectorPrototype = {
	__proto__: Array.prototype,
	[Symbol.toStringTag]: "Vector",
	toString(this: Vec2) {
		return `${this[0]} ${this[1]}`;
	},
	__brand: "vector",
} as const;
const MatrixPrototype = {
	__proto__: Array.prototype,
	[Symbol.toStringTag]: "Matrix",
	toString(this: Mat2) {
		return `${this[0]} ${this[1]}`;
	},
	__brand: "matrix",
} as const;
const vec2 = (x: number, y?: number): Vec2 => Object.setPrototypeOf([x, y ?? x] as const, VectorPrototype);
function mat2(x: Vec2, y: Vec2): Mat2;
function mat2(xx: number, xy: number, yx: number, yy: number): Mat2;
function mat2(xx: number | Vec2, xy: number | Vec2, yx?: number, yy?: number) {
	if (isVec(xx) && isVec(xy)) {
		return Object.setPrototypeOf([xx, xy] as const, MatrixPrototype);
	}
	if (typeof xx === "number" && typeof xy === "number" && typeof yx === "number" && typeof yy === "number") {
		return mat2(vec2(xx, xy), vec2(yx, yy));
	}
	throw new TypeError(`mat() takes 2 Vectors or 4 numbers.`);
}
const isVec = (v: unknown): v is Vec2 => typeof v === "object" && !!v && ({}).isPrototypeOf.call(VectorPrototype, v);
const isMat = (m: unknown): m is Vec2 => typeof m === "object" && !!m && ({}).isPrototypeOf.call(MatrixPrototype, m);
const typeOf = (x: unknown): string => (
	isVec(x) ? "Vector" :
		isMat(x) ? "Matrix" :
			x === null ? "null" :
				typeof x
);
const toVec = (v: Vec2 | number): Vec2 => isVec(v) ? v : vec2(v);
/** can't use 0⃗ because it starts with 0 */
const zeroVec = vec2(0);
const î = vec2(1, 0);
const ĵ = vec2(0, 1);
const leftMat = mat2(0, -1, 1, 0);
const rightMat = mat2(0, 1, -1, 0);
const orthMat: (v: Vec2) => Mat2 = ([x, y]) => mat2(x, y, -y, x);

// #region Simple functions
type VectorFunc = (a: Vec2, b: Vec2) => Vec2;
type VectorReducer = (...vectors: (Vec2 | number)[]) => Vec2;
const reduce: (reducer: VectorFunc, empty: Vec2, useFirstAsInitial?: boolean) => VectorReducer = (
	(reducer, empty, useFirstAsInitial = false) =>
		(...vectors) => useFirstAsInitial
			? vectors.length > 0
				? vectors.slice(1).reduce<Vec2>((acc, curr) => reducer(acc, toVec(curr)), toVec(vectors[0]))
				: empty
			: vectors.reduce<Vec2>((acc, curr) => reducer(acc, toVec(curr)), empty)
);

const functions = {
	add: ([ax, ay], [bx, by]) => vec2(ax + bx, ay + by),
	sub: ([ax, ay], [bx, by]) => vec2(ax - bx, ay - by),
	mul: ([ax, ay], [bx, by]) => vec2(ax * bx, ay * by),
	div: ([ax, ay], [bx, by]) => vec2(ax / bx, ay / by),
} satisfies Record<string, VectorFunc>;

const add = reduce(functions.add, vec2(0, 0));
const sub = reduce(functions.sub, vec2(0, 0), true);
const mul = reduce(functions.mul, vec2(1, 1));
const div = reduce(functions.div, vec2(1, 1), true);

const dot: (a: Vec2, b: Vec2) => number = ([ax, ay], [bx, by]) => ax * bx + ay * by;
const dotNorm = (a: Vec2, b: Vec2) => dot(a, b) / (mag(a) * mag(b));
const equal: (a: Vec2, b: Vec2) => boolean = ([ax, ay], [bx, by]) => ax === bx && ay === by;
const parallel = (a: Vec2, b: Vec2, ε: number = 0.001) => Math.abs(dotNorm(a, b)) > 1 - ε;

const neg: (v: Vec2) => Vec2 = ([x, y]) => vec2(-x, -y);
const mag = (v: Vec2) => Math.hypot(...v);
const arg = (v: Vec2) => Math.atan2(v[1], v[0]);
const swap: (v: Vec2) => Vec2 = ([x, y]) => vec2(y, x);
const norm: (v: Vec2, size?: number) => Vec2 = (v, size = 1) => mul(v, vec2(size / mag(v)));
const safeNorm = (v: Vec2, d: Vec2 = î): Vec2 => (
	equal(v, zeroVec)
		? d
		: div(v, vec2(mag(v)))
);
const polar: (theta: number, r?: number) => Vec2 = (theta, r = 1) => vec2(r * Math.cos(theta), r * Math.sin(theta));
const map: (f: (x: number) => number) => (v: Vec2) => Vec2 = f => v => vec2(f(v[0]), f(v[1]));
// #endregion

function lerp(a: number, b: number, t: number): number;
function lerp(a: Vec2, b: Vec2, t: number): Vec2;
function lerp(a: number | Vec2, b: number | Vec2, t: number) {
	if (typeof a === "number" && typeof b === "number") {
		return a + (b - a) * t;
	} else if (isVec(a) && isVec(b)) {
		return add(a, mul(sub(b, a), vec2(t)));
	}
	throw new TypeError(`Type mismatch: Expected ${a}: ${typeOf(a)} and ${b}: ${typeOf(b)} to be of the same type.`);
}

function curriedLerp(a: number, b: number): (t: number) => number;
function curriedLerp(a: Vec2, b: Vec2): (t: number) => Vec2;
function curriedLerp(a: number | Vec2, b: number | Vec2) {
	if (typeof a === "number" && typeof b === "number") {
		return (t: number) => lerp(a, b, t);
	} else if (isVec(a) && isVec(b)) {
		return (t: number) => lerp(a, b, t);
	}
}

const matTranspose: (m: Mat2) => Mat2 = ([[xx, xy], [yx, yy]]) => mat2(xx, yx, xy, yy);
/**
 * 
 * ```
 * [mxx myx][vx]
 * [mxy myy][vy]
 * ```
 */
const matMul: (m: Mat2, v: Vec2) => Vec2 = ([[mxx, mxy], [myx, myy]], [vx, vy]) =>
	vec2(vx * mxx + vy * myx, vx * mxy + vy * myy);
const det: (m: Mat2) => number = ([[xx, xy], [yx, yy]]) => xx * yy - xy * yx;

/**
 * clockwise rotation
 * 
 * ```
 * [cos -sin]  
 * [sin  cos]
 * ```
 */
const rotMat: (angle: number) => Mat2 = angle => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	return mat2(cos, sin, -sin, cos);
}


// actual sign, including ±0
const sign = (x: number) => Math.sign(x === 0 ? 1 / x : x);
/** @returns value in [-π, π] */
const angleBetween = (a: Vec2, b: Vec2) => sign(det(mat2(a, b))) * Math.acos(dotNorm(a, b));