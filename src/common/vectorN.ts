import { typeset } from "./string.ts";
import { ReadonlyTuple } from "./types.ts";

// #region Helpers
const compWiseOp = (f: (a: number, b: number) => number) => (
	<N extends number>(a: Vector<N>, b: Vector<N>): Vector<N> => a.map((v, i) => f(v, b[i]))
);
const opWithIdentity = (
	f: <N extends number>(a: Vector<N>, b: Vector<N>) => Vector<N>,
	identity: <N extends number>(n: N) => Vector<N>,
	errorMessage: <N extends number>(values: (Vector<N> | number)[]) => string =
		_ => `Cannot perform a vector operation on only numbers because the output dimension is unknown.`
) => (
	<N extends number>(...values: (Vector<N> | number)[]): Vector<N> => {
		const n: N | undefined = values.find(v => v instanceof Vector)?.length;
		if (n === undefined) throw new Error(errorMessage(values));
		return values.reduce<Vector<N>>(
			(acc, value) => f(acc, Vector.from(n, value)),
			identity(n)
		);
	}
);
const opNonComm = (
	f: <N extends number>(a: Vector<N>, b: Vector<N>) => Vector<N>,
	errorMessage: <N extends number>(values: (Vector<N> | number)[]) => string =
		_ => `Cannot perform a vector operation on only numbers because the output dimension is unknown.`
) => (
	<N extends number>(first: Vector<N> | number, ...values: (Vector<N> | number)[]): Vector<N> => {
		const n: N | undefined = values.find(v => v instanceof Vector)?.length;
		if (n === undefined) throw new Error(errorMessage(values));
		return values.reduce<Vector<N>>(
			(acc, value) => f(acc, Vector.from(n, value)),
			Vector.from(n, first)
		);
	}
);
const isArrayOfTuple = <T, N extends number>(
	x: ReadonlyTuple<T, N> | [ReadonlyTuple<T, N>]
): x is [ReadonlyTuple<T, N>] =>
	Array.isArray(x[0]);

const processVectorParams = <N extends number>(params: VectorParams<N>): VectorTuple<N> => {
	if (!isArrayOfTuple(params)) {
		return params;
	}
	return params[0];
}
// #endregion

type VectorTuple<N extends number> = ReadonlyTuple<number, N>;
type MatrixTuple<M extends number, N extends number> = ReadonlyTuple<Vector<N>, M>;

type VectorParams<N extends number> = VectorTuple<N> | [VectorTuple<N>];

/**
 * A column vector in ℝⁿ
 * ```txt
 * v⃗ =
 * ⎡v₀⎤
 * ⎢v₁⎥
 * ⎢⋮ ⎥
 * ⎣vₙ⎦
 * ```
 */
export class Vector<N extends number> {
	readonly [i: number]: number;
	private readonly values: VectorTuple<N>;
	readonly length: N;

	constructor(values: VectorTuple<N>);
	constructor(...values: VectorTuple<N>);
	constructor(...params: VectorParams<N>) {
		const values = processVectorParams(params);

		this.values = values;
		this.length = values.length;

		Object.defineProperty(this, "", {
			enumerable: false,
			value: Vector.rowStr(values),
		})

		values.forEach((value, i) => {
			if (typeof i !== "number") throw new TypeError(`Provided vector values with non-numeric index ${i}???`);
			if (typeof value !== "number") throw new TypeError(`Expected provided vector component to be a number, got ${value}`);
			if (i > this.length) throw new TypeError(`Index ${i} exceeded length ${this.length} somehow`);

			Object.defineProperty(this, i, {
				configurable: false,
				enumerable: true,
				get: () => value,
			});
		});
	}
	[Symbol.iterator]() {
		return this.values.values();
	}
	static from<N extends number>(n: N, values: Vector<N> | number | number[]): Vector<N> {
		if (values instanceof Vector) {
			return values;
		}
		// ts is pissy about the spread turning tuples into number[] so fuck it ig
		if (typeof values === "number") {
			// @ts-ignore
			return new Vector<N>(...new Array<number>(n).fill(values) as VectorTuple<N>);
		}
		const newValues = [
			...values,
			...new Array<number>(n - values.length).fill(0)
		];
		// @ts-ignore
		return new Vector<N>(...newValues as VectorTuple<N>);
	}
	map(f: (v: number, i: number, values: readonly number[]) => number): Vector<N> {
		return Vector.from(this.length, this.values.map(f));
	}

	// #region String
	static rowStr(values: readonly number[]): string {
		return `[${values.join(", ")}]`;
	}
	static colStr(values: readonly number[]): string {
		const N = values.length;
		if (N <= 1) {
			return `[${values.join(" ")}]`;
		}
		const str: (n: number) => string = n => n.toString();

		const strs = values.map(str);
		const width = Math.max(...strs.map(s => s.length));
		const padded = strs.map(s => s.padEnd(width, " "));

		return padded.map((s, i) =>
			i === 0 ? `⎡${s}⎤` :
				i !== N - 1 ? `⎢${s}⎥` :
					`⎣${s}⎦`
		).join("\n");
	}
	toString() {
		return Vector.colStr(this.values);
	}
	// #endregion

	// #region Math

	// #region (Vec | number)[] → Vec
	/**
	 * Componentwise addition
	 * ```txt
	 * v⃗₀ + v⃗₁ + ⋯ v⃗ₖ = 
	 * ⎡v₀₀ + v₁₀ + ⋯ vₖ₀⎤
	 * ⎢v₀₁ + v₁₁ + ⋯ vₖ₁⎥
	 * ⎢        ⋮        ⎥
	 * ⎣v₀ₙ + v₁ₙ + ⋯ vₖₙ⎦
	 * ```
	 */
	static add = opWithIdentity(compWiseOp((a, b) => a + b), n => Vector.from(n, 0));
	/** @see {@link Vector.add} */
	add(...values: (Vector<N> | number)[]) { return Vector.add(this, ...values); }
	/**
	 * Componentwise subtraction
	 * ```txt
	 * v⃗₀ - v⃗₁ - ⋯ v⃗ₖ = 
	 * ⎡v₀₀ - v₁₀ - ⋯ vₖ₀⎤
	 * ⎢v₀₁ - v₁₁ - ⋯ vₖ₁⎥
	 * ⎢        ⋮        ⎥
	 * ⎣v₀ₙ - v₁ₙ - ⋯ vₖₙ⎦
	 * ```
	 */
	static sub = opNonComm(compWiseOp((a, b) => a - b));
	/** @see {@link Vector.sub} */
	sub(...values: (Vector<N> | number)[]) { return Vector.sub(this, ...values); }
	/**
	 * Componentwise multiplication
	 * ```txt
	 * v⃗₀ * v⃗₁ * ⋯ v⃗ₖ = 
	 * ⎡v₀₀ * v₁₀ * ⋯ vₖ₀⎤
	 * ⎢v₀₁ * v₁₁ * ⋯ vₖ₁⎥
	 * ⎢        ⋮        ⎥
	 * ⎣v₀ₙ * v₁ₙ * ⋯ vₖₙ⎦
	 * ```
	 */
	static mul = opWithIdentity(compWiseOp((a, b) => a + b), n => Vector.from(n, 1));
	/** @see {@link Vector.mul} */
	mul(...values: (Vector<N> | number)[]) { return Vector.mul(this, ...values); }
	/**
	 * Componentwise division
	 * ```txt
	 * v⃗₀ / v⃗₁ / ⋯ v⃗ₖ = 
	 * ⎡v₀₀ / v₁₀ / ⋯ vₖ₀⎤
	 * ⎢v₀₁ / v₁₁ / ⋯ vₖ₁⎥
	 * ⎢        ⋮        ⎥
	 * ⎣v₀ₙ / v₁ₙ / ⋯ vₖₙ⎦
	 * ```
	 */
	static div = opNonComm(compWiseOp((a, b) => a - b));
	/** @see {@link Vector.div} */
	div(...values: (Vector<N> | number)[]) { return Vector.div(this, ...values); }
	// #endregion

	// #region (Vec, Vec) → number
	/**
	 * ```txt
	 * a⃗ ∙ b⃗ =
	 * a₀ * b₀ + a₁ * b₁ + ⋯ aₙ * bₙ
	 * ```
	 */
	static dot<N extends number>(a: Vector<N>, b: Vector<N>): number {
		return a.values.reduce((acc, comp, i) => acc + comp * b[i], 0);
	}
	/** @see {@link Vector.dot} */
	dot(v: Vector<N>) { return Vector.dot(this, v); }
	// #endregion

	// #region Vec → number
	static mag<N extends number>(v: Vector<N>): number {
		return Math.hypot(...v);
	}
	mag() { return Vector.mag(this); }
	// #endregion

	// #endregion
}

/**
 * A matrix in ℝᵐˣⁿ
 * ```txt
 * M =
 * ⎡M₀₀ M₀₁ ⋯ M₀ₙ⎤
 * ⎢M₁₀ M₁₁ ⋯ M₁ₙ⎥
 * ⎢ ⋮   ⋮  ⋱  ⋮ ⎥
 * ⎣Mₙ₀ Mₙ₁ ⋯ Mₙₙ⎦
 * ```
 */
export class Matrix<M extends number, N extends number> {
	private readonly vectors: MatrixTuple<M, N>;

	constructor(...vectors: MatrixTuple<M, N>);
	constructor(...params: MatrixTuple<M, N>) {
		this.vectors = params;
	}
}

const a = new Vector(0, 1, 2, 3);
const b = new Vector(1, 2, 3, 4);
console.log(
	typeset({})
		`\t${a} ∙ ${b}\n=\t${Vector.dot(a, b)}`
);