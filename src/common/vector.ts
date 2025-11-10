import { interleave } from "./array.ts";
import { mod } from "./number.ts";
import { alignH, bracketPresets, concat, normalize, NormTextBlock } from "./string.ts";
import { map, ReadonlyTuple, tuple } from "./tuple.ts";

// #region Helpers
const toStr = (places = 5) => (n: number) => {
	if (Object.is(n, Infinity)) return `∞`;
	if (Object.is(n, -Infinity)) return `-∞`;
	if (Object.is(n, NaN)) return `NaN`;

	let str = n.toString();
	if (str.includes("e")) return str;
	const [a, b] = str.split(".");
	if (!b) return str;
	return `${a}.${b.slice(0, places)}`;
}

const isNumber = (x: unknown): x is number => typeof x === "number";
const isVector = <N extends number>(v: unknown): v is Vector<N> => v instanceof Vector;
const isMatrix = <M extends number, N extends number>(v: unknown): v is Matrix<M, N> => v instanceof Matrix;

const isTupleOf = <T, N extends number>(
	x: unknown,
	f: (v: unknown) => v is T,
): x is ReadonlyTuple<T, N> => (
	Array.isArray(x) &&
	x.every(v => f(v))
);
const isSingletonArrayOfTuple = <T, N extends number>(
	x: unknown,
	f: (v: unknown) => v is T,
): x is [ReadonlyTuple<T, N>] =>
	isArrayOfTuple<T, N>(x, f) &&
	x.length === 1;

const isArrayOfTuple = <T, N extends number>(
	x: unknown,
	f: (v: unknown) => v is T,
): x is ReadonlyTuple<T, N>[] =>
	Array.isArray(x) &&
	Array.isArray(x[0]) &&
	x.every(y => isTupleOf(y, f));

// #endregion

// #region Operations
const compWiseVecOp = (f: (a: number, b: number) => number) => (
	<N extends number>(a: Vector<N>, b: Vector<N>): Vector<N> => a.map((v, i) => f(v, b[i]))
);
const vecOpWithIdentity = (
	f: <N extends number>(a: Vector<N>, b: Vector<N>) => Vector<N>,
	identity: <N extends number>(n: N) => Vector<N>,
	errorMessage: <N extends number>(values: (Vector<N> | number)[]) => string =
		_ => `Cannot perform a vector operation on only numbers because the output dimension is unknown.`
) => (
	<N extends number>(...values: (Vector<N> | number)[]): Vector<N> => {
		const vec = values.find<Vector<N>>(isVector);
		if (vec === undefined) throw new Error(errorMessage(values));
		const n = vec.length;
		return values.reduce<Vector<N>>(
			(acc, value) => f(acc, Vector.from(n, value)),
			identity(n)
		);
	}
);
const vecOpNonComm = (
	f: <N extends number>(a: Vector<N>, b: Vector<N>) => Vector<N>,
	errorMessage: <N extends number>(values: (Vector<N> | number)[]) => string =
		_ => `Cannot perform a vector operation on only numbers because the output dimension is unknown.`
) => (
	<N extends number>(first: Vector<N> | number, ...values: (Vector<N> | number)[]): Vector<N> => {
		const n: N | undefined = [first, ...values].find<Vector<N>>(isVector)?.length;
		if (n === undefined) throw new Error(errorMessage(values));
		return values.reduce<Vector<N>>(
			(acc, value) => f(acc, Vector.from(n, value)),
			Vector.from(n, first)
		);
	}
);
// #endregion

// #region Vector Params
type VectorTuple<N extends number> = ReadonlyTuple<number, N>;
type VectorParams<N extends number> =
	| VectorTuple<N>
	| [VectorTuple<N>];

const processVectorParams = <N extends number>(params: VectorParams<N>): VectorTuple<N> => {
	if (isSingletonArrayOfTuple<number, N>(params, isNumber)) {
		return params[0];
	}
	return params;
}
// #endregion

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
	readonly components: VectorTuple<N>;
	readonly length: N;

	/**
	 * Construct Vector from tuple of components
	 * ```ts
	 * new Matrix([v₀, v₁, ..., vₙ]);
	 * ```
	 */
	constructor(components: VectorTuple<N>);
	/**
	 * Construct Vector from components
	 * ```ts
	 * new Matrix(v₀, v₁, ..., vₙ);
	 * ```
	 */
	constructor(...components: VectorTuple<N>);
	constructor(...params: VectorParams<N>) {
		const components = processVectorParams(params);

		this.components = components;
		this.length = components.length;

		Object.defineProperty(this, "v", {
			enumerable: false,
			value: Vector.rowStr(components),
		});

		components.forEach((value, i) => {
			if (typeof i !== "number") throw new TypeError(`Provided vector components with non-numeric index ${i}???`);
			if (typeof value !== "number") throw new TypeError(`Expected provided vector component to be a number, got ${value}`);
			if (i > this.length) throw new TypeError(`Vector component index ${i} exceeded length ${this.length} somehow`);

			Object.defineProperty(this, i, {
				configurable: false,
				enumerable: true,
				get: () => value,
			});
		});
	}
	[Symbol.iterator]() {
		return this.components.values();
	}
	static from<N extends number>(
		n: N,
		values: Vector<N> | number | number[] | ((i: number) => number)
	): Vector<N> {
		if (values instanceof Vector) {
			return values;
		}
		if (typeof values === "number") {
			return new Vector<N>(new Array<number>(n).fill(values) as VectorTuple<N>);
		}
		if (typeof values === "function") {
			return new Vector<N>(tuple(n, values));
		}
		const newValues = [
			...values,
			...new Array<number>(n - values.length).fill(0)
		];
		return new Vector<N>(newValues as VectorTuple<N>);
	}
	map(f: (x: number, i: number, values: readonly number[]) => number): Vector<N> {
		return new Vector(map(this.components, f));
	}

	// #region Text
	static rowStr(values: readonly number[], stringifier = toStr()): string {
		return `[${values.map(stringifier).join(", ")}]`;
	}
	toText(numStr = toStr(), brackets = bracketPresets.square): NormTextBlock {
		const strs = this.components.map(numStr);

		const aligned = alignH({
			align: "left",
			alignAt: ".",
		}, strs);

		return brackets(aligned);
	}
	toString(numStr = toStr()) {
		return Vector.rowStr(this.components, numStr);
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
	static add = vecOpWithIdentity(compWiseVecOp((a, b) => a + b), n => Vector.from(n, 0));
	/** @see {@linkcode Vector.add} */
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
	static sub = vecOpNonComm(compWiseVecOp((a, b) => a - b));
	/** @see {@linkcode Vector.sub} */
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
	static mul = vecOpWithIdentity(compWiseVecOp((a, b) => a * b), n => Vector.from(n, 1));
	/** @see {@linkcode Vector.mul} */
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
	static div = vecOpNonComm(compWiseVecOp((a, b) => a / b));
	/** @see {@linkcode Vector.div} */
	div(...values: (Vector<N> | number)[]) { return Vector.div(this, ...values); }
	// #endregion

	// #region → number
	/**
	 * ```txt
	 * a⃗ ∙ b⃗ = a₀ * b₀ + a₁ * b₁ + ⋯ aₙ * bₙ
	 * ```
	 */
	static dot<N extends number>(a: Vector<N>, b: Vector<N>): number {
		return a.components.reduce((acc, comp, i) => acc + comp * b[i], 0);
	}
	/** @see {@linkcode Vector.dot} */
	dot(v: Vector<N>) { return Vector.dot(this, v); }
	/**
	 * Magnitude of the vector
	 * ```txt
	 * |v⃗| = √(v₀² + v₁² + ⋯ vₙ²)
	 * ```
	 */
	static mag<N extends number>(v: Vector<N>): number {
		return Math.hypot(...v);
	}
	/** @see {@linkcode Vector.mag} */
	mag() { return Vector.mag(this); }
	/**
	 * ```txt
	 * (a⃗ ∙ b⃗)/(|a⃗||b⃗|)
	 * ```
	 */
	static dotNorm<N extends number>(a: Vector<N>, b: Vector<N>): number {
		return Vector.dot(a.norm(), b.norm());
	}
	/** @see {@linkcode Vector.dotNorm} */
	dotNorm(v: Vector<N>) { return Vector.dotNorm(this, v); }
	/**
	 * Angle between `a` and `b`
	 */
	static angle<N extends number>(a: Vector<N>, b: Vector<N>): number {
		return Math.acos(this.dotNorm(a, b));
	}
	/** @see {@linkcode Vector.angle} */
	angle(v: Vector<N>) { return Vector.angle(this, v); }
	/**
	 * Take the components of a modulo the components of b.
	 * Ensures result is positive when b is.
	 */
	static mod = compWiseVecOp(mod);
	/** @see {@linkcode Vector.mod} */
	mod(v: Vector<N>) { return Vector.mod(this, v); }

	// #endregion

	// #region → Vec
	/**
	 * Negation of the vector
	 * ```txt
	 * -v⃗ = 
	 * ⎡v₀⎤
	 * ⎢v₁⎥
	 * ⎢⋮ ⎥
	 * ⎣vₙ⎦
	 * ```
	 */
	static neg<N extends number>(vec: Vector<N>): Vector<N> {
		return new Vector(map(vec.components, v => -v));
	}
	/** @see {@linkcode Vector.neg} */
	neg() { return Vector.neg(this); }
	/**
	 * Normalization of the vector
	 * ```txt
	 * norm(v⃗) = v⃗ / |v⃗|
	 * norm(v⃗, s) = sv⃗ / |v⃗|
	 * ```
	 */
	static norm<N extends number>(vec: Vector<N>, mag = 1): Vector<N> {
		return vec.mul(mag / vec.mag());
	}
	/** @see {@linkcode Vector.norm} */
	norm(mag = 1) { return Vector.norm(this, mag); }
	// #endregion

	// #region → boolean
	/**
	 * ```txt
	 * a⃗ = b⃗
	 * ```
	 */
	static equal<N extends number>(a: Vector<N>, b: Vector<N>): boolean {
		return a.length === b.length && a.components.every((v, i) => v === b[i]);
	}
	/** @see {@linkcode Vector.equal} */
	equal(vec: Vector<N>): boolean {
		return Vector.equal(this, vec);
	}
	// #endregion

	// #region Other
	static lerp<N extends number>(v0: Vector<N>, v1: Vector<N>): (t: number) => Vector<N> {
		const d = v1.sub(v0);
		return t => v0.add(d.mul(t));
	}
	// #endregion

	// #endregion
}

// #region Matrix Params
type MatrixComps<M extends number, N extends number> = ReadonlyTuple<ReadonlyTuple<number, N>, M>;
type MatrixTuple<M extends number, N extends number> = ReadonlyTuple<Vector<N>, M>;
type MatrixCompsParams<M extends number, N extends number> = [width: M, height: N, components: MatrixComps<M, N>];
type MatrixVecsParams<M extends number, N extends number> = [width: M, height: N, vectors: MatrixTuple<M, N>];

type MatrixParams<M extends number, N extends number> = (
	| MatrixTuple<M, N>
	| [vectors: MatrixTuple<M, N>]
	| MatrixVecsParams<M, N>
	| MatrixCompsParams<M, N>
);

const paramsIsWHVecs = <M extends number, N extends number>(params: MatrixParams<M, N>):
	params is MatrixVecsParams<M, N> => (
	typeof params[0] === "number" &&
	typeof params[1] === "number" &&
	isTupleOf<Vector<N>, M>(params[2], isVector)
);

const paramsIsWHComps = <M extends number, N extends number>(params: MatrixParams<M, N>):
	params is MatrixCompsParams<M, N> => (
	typeof params[0] === "number" &&
	typeof params[1] === "number" &&
	isTupleOf<ReadonlyTuple<number, N>, M>(params[2], vs =>
		isTupleOf<number, N>(vs, isNumber)
	)
);

const processMatrixParams = <M extends number, N extends number>(params: MatrixParams<M, N>):
	MatrixVecsParams<M, N> => {
	if (isSingletonArrayOfTuple<Vector<N>, M>(params, isVector)) {
		return processMatrixParams(params[0]);
	}
	if (paramsIsWHVecs(params)) {
		return params;
	}
	if (paramsIsWHComps(params)) {
		const [width, height, comps] = params;
		return [width, height, map(comps,
			values => new Vector(values)
		)];
	}
	// params is MatrixTuple
	const width = params.length;
	if (width === 0) throw new Error("Cannot infer height of matrix when given empty array as vectors");
	const height = params[0].length;
	return [width, height, params];
}
// #endregion

// #region Operations
const matsDims = <M extends number, N extends number>(
	values: (number | Matrix<M, N>)[],
	errorMessage: <M extends number, N extends number>(values: (Matrix<M, N> | number)[]) => string
): [width: M, height: N] => {
	const mat = values.find<Matrix<M, N>>(isMatrix);
	if (mat === undefined) throw new Error(errorMessage(values));
	return [mat.width, mat.height];
}

const compWiseMatOp = (f: (a: number, b: number) => number) => (
	<M extends number, N extends number>(a: Matrix<M, N>, b: Matrix<M, N>): Matrix<M, N> =>
		a.map((v, i, j) => f(v, b[i][j]))
);
const matOpWithIdentity = (
	f: <M extends number, N extends number>(a: Matrix<M, N>, b: Matrix<M, N>) => Matrix<M, N>,
	identity: <M extends number, N extends number>(m: M, n: N) => Matrix<M, N>,
	errorMessage: <M extends number, N extends number>(values: (Matrix<M, N> | number)[]) => string =
		_ => `Cannot perform a matrix operation on only numbers because the output dimensions are unknown.`
) => (
	<M extends number, N extends number>(...values: (Matrix<M, N> | number)[]): Matrix<M, N> => {
		const [m, n] = matsDims<M, N>(values, errorMessage);
		return values.reduce<Matrix<M, N>>(
			(acc, value) => f(acc, Matrix.from(m, n, value)),
			identity(m, n)
		);
	}
);
const matOpNonComm = (
	f: <M extends number, N extends number>(a: Matrix<M, N>, b: Matrix<M, N>) => Matrix<M, N>,
	errorMessage: <M extends number, N extends number>(values: (Matrix<M, N> | number)[]) => string =
		_ => `Cannot perform a matrix operation on only numbers because the output dimensions are unknown.`
) => (
	<M extends number, N extends number>(first: Matrix<M, N> | number, ...values: (Matrix<M, N> | number)[]): Matrix<M, N> => {
		const [m, n] = matsDims<M, N>(values, errorMessage);
		return values.reduce<Matrix<M, N>>(
			(acc, value) => f(acc, Matrix.from(m, n, value)),
			Matrix.from(m, n, first)
		);
	}
);
// #endregion

// #region Matrix multiplying
type Index<A, I> = I extends keyof A ? A[I] : never;

type Mulable<M extends number, N extends number> =
	Matrix<M, N> | (M extends N ? Matrix<M, N> | number : Matrix<M, N>);
type MulableMatrices<N0 extends number, N1 extends number, NTail extends number[]> = [
	Mulable<N1, N0>,
	...{
		[Ni in keyof NTail]: Mulable<
			NTail[Ni],
			Index<[N1, ...NTail], Ni>
		>
	}
];
type MulableMatricesNoFirst<N1 extends number, NTail extends number[]> = {
	[Ni in keyof NTail]: Mulable<
		NTail[Ni],
		Index<[N1, ...NTail], Ni>
	>
};
type MatMulResultDim<N1 extends number, NTail extends number[]> = NTail extends [...number[], infer N extends number] ? N : N1;

type MulMatResult<N0 extends number, N1 extends number, NTail extends number[]> =
	Matrix<MatMulResultDim<N1, NTail>, N0>;

const endsWithVector = <N0 extends number, N1 extends number, NTail extends number[]>(
	values: MulableMatrices<N0, N1, NTail>
		| [...MulableMatrices<N0, N1, NTail>, Vector<MatMulResultDim<N1, NTail>>]
): values is [...MulableMatrices<N0, N1, NTail>, Vector<MatMulResultDim<N1, NTail>>] => (
	isVector(values.at(-1))
);
const end = <Rest extends unknown[], Tail>(values: [...Rest, Tail]): [Rest, Tail] => {
	if (values.length < 1) throw new Error("cannot get head and tail of array because it is too small");
	return [
		values.slice(0, -1) as Rest,
		values.at(-1) as Tail,
	];
}
// #endregion

/**
 * A matrix in `ℝᵐˣⁿ`
 * ```txt
 * M =
 * ⎡M₀₀ M₁₀ ⋯ Mₘ₀⎤
 * ⎢M₀₁ M₁₁ ⋯ Mₘ₁⎥
 * ⎢ ⋮   ⋮  ⋱  ⋮ ⎥
 * ⎣M₀ₙ M₁ₙ ⋯ Mₘₙ⎦
 * ```
 */
export class Matrix<M extends number, N extends number> {
	readonly [i: number]: Vector<N>;
	readonly vectors: MatrixTuple<M, N>;
	readonly width: M;
	readonly height: N;

	/**
	 * Construct Matrix with explicit size (for potentially empty matrices)  
	 * Note: components appear tranposed; use {@linkcode Matrix.transpose} to place them in "correct" order
	 * ```ts
	 * new Matrix(m, n, [
	 * 	[M₀₀, M₀₁, ..., M₀ₙ], 
	 * 	[M₁₀, M₁₁, ..., M₁ₙ],
	 * 	...,
	 * 	[Mₘ₀, Mₘ₁, ..., Mₘₙ],
	 * ] as const);
	 * // => ⎡M₀₀ M₁₀ ⋯ Mₘ₀⎤
	 * //    ⎢M₀₁ M₁₁ ⋯ Mₘ₁⎥
	 * //    ⎢ ⋮   ⋮  ⋱  ⋮ ⎥
	 * //    ⎣Mₙ₀ Mₙ₁ ⋯ Mₘₙ⎦
	 * new Matrix(0, n, []);
	 * ```
	 */
	constructor(width: M, height: N, components: MatrixComps<M, N>);
	/**
	 * Construct Matrix with explicit size (for potentially empty matrices)
	 * ```ts
	 * new Matrix(m, n, [v⃗₀, v⃗₁, ..., v⃗ₘ]);
	 * new Matrix(0, n, []);
	 * ```
	 */
	constructor(width: M, height: N, vectors: MatrixTuple<M, N>);
	/**
	 * Construct Matrix from a tuple of column vectors
	 * ```ts
	 * new Matrix([v⃗₀, v⃗₁, ..., v⃗ₘ]);
	 * ```
	 */
	constructor(vectors: MatrixTuple<M, N>);
	/**
	 * Construct Matrix from column vectors
	 * ```ts
	 * new Matrix(v⃗₀, v⃗₁, ..., v⃗ₘ);
	 * ```
	 */
	constructor(...vectors: MatrixTuple<M, N>);
	constructor(...params: MatrixParams<M, N>) {
		const [width, height, vectors] = processMatrixParams(params);
		this.vectors = vectors;
		this.width = width;
		this.height = height;

		Object.defineProperty(this, "v", {
			enumerable: false,
			value: `[${vectors.map(v => Vector.rowStr(v.components)).join(", ")}]`,
		});

		vectors.forEach((vec, i) => {
			if (typeof i !== "number") throw new TypeError(`Provided matrix vectors with non-numeric index ${i}???`);
			if (!(vec instanceof Vector)) throw new TypeError(`Expected provided matrix vector to be a Vector, got ${vec}`);
			if (i > this.width) throw new TypeError(`Matrix vector index ${i} exceeded width ${this.width} somehow`);

			Object.defineProperty(this, i, {
				configurable: false,
				enumerable: true,
				get: () => vec,
			});
		});
	}
	static from<M extends number, N extends number>(
		width: M, height: N,
		values: Matrix<M, N> | number | number[] | ((i: number, j: number) => number)
	): Matrix<M, N> {
		if (values instanceof Matrix) {
			return values;
		}
		if (typeof values === "number") {
			return new Matrix<M, N>(width, height,
				tuple(width, () => Vector.from(height, values))
			)
		}
		if (typeof values === "function") {
			return new Matrix<M, N>(width, height,
				tuple(width, i =>
					Vector.from<N>(height, j =>
						values(i, j)
					)
				)
			);
		}
		return new Matrix<M, N>(width, height,
			tuple(width, i =>
				Vector.from(height, values.slice(i * height, height))
			)
		);
	}
	[Symbol.iterator]() {
		return this.vectors.values();
	}
	map(
		/**
		 * ```ts
		 * f(this[i][j], i, j)
		 * ```
		 */
		f: (x: number, i: number, j: number) => number
	): Matrix<M, N> {
		return new Matrix(
			map(this.vectors, (v, i) =>
				v.map((x, j) => f(x, i, j))
			)
		);
	}

	// #region Text
	detText(numStr = toStr()) { return this.toText(numStr, bracketPresets.straight); }
	toText(numStr = toStr(), brackets = bracketPresets.square): NormTextBlock {
		const strs = this.vectors.map(vec =>
			vec.components.map(numStr)
		);
		const columns = strs.map(col => normalize(alignH({
			align: "left", alignAt: "."
		}, col)));

		return brackets(concat(...interleave(
			columns,
			columns.map(() => normalize(" ")).slice(1)
		)));
	}
	toString(numStr = toStr()): string {
		return this.toText(numStr).lines.join("\n");
	}
	// #endregion

	// #region Math

	// #region number → Mat
	/**
	 * The identity matrix
	 * ```txt
	 * Iₙ = 𝟙ₙ = 
	 * ⎡1 0 ⋯ 0⎤
	 * ⎢0 1 ⋯ 0⎥
	 * ⎢⋮ ⋮ ⋱ ⋮⎥
	 * ⎣0 0 ⋯ 1⎦
	 * ```
	 */
	static identity<N extends number>(size: N): Matrix<N, N> {
		return Matrix.from(size, size, (i, j) => i === j ? 1 : 0);
	}
	/**
	 * A matrix of all zeros
	 * ```txt
	 * 𝟘ₘₙ = 
	 * ⎡0 0 ⋯ 0⎤
	 * ⎢0 0 ⋯ 0⎥
	 * ⎢⋮ ⋮ ⋱ ⋮⎥
	 * ⎣0 0 ⋯ 0⎦
	 * ```
	 */
	static zero<M extends number, N extends number>(m: M, n: N): Matrix<M, N> {
		return Matrix.from(m, n, 0);
	}
	// #endregion

	// #region Mat → Mat
	/**
	 * Tranpose of the matrix
	 * ```txt
	 * Mᵀ = 
	 * ⎡M₀₀ M₀₁ ⋯ M₀ₙ⎤
	 * ⎢M₁₀ M₁₁ ⋯ M₁ₙ⎥
	 * ⎢ ⋮   ⋮  ⋱  ⋮ ⎥
	 * ⎣Mₘ₀ Mₘ₁ ⋯ Mₘₙ⎦
	 * ```
	 */
	static transpose<M extends number, N extends number>(mat: Matrix<M, N>): Matrix<N, M> {
		return new Matrix(mat.height, mat.width,
			tuple(mat.height, i =>
				map(mat.vectors, v => v[i])
			)
		);
	}
	/** @see {@linkcode Matrix.transpose} */
	transpose(): Matrix<N, M> { return Matrix.transpose(this); }
	// #endregion

	// #region Mat → Vec
	static diagonal<N extends number>(mat: Matrix<N, N>): Vector<N> {
		return new Vector(map(mat.vectors, (v, i) => v[i]));
	}
	// #endregion

	// #region Mat → number
	static det<N extends number>(mat: Matrix<N, N>): number {
		if (mat.width !== mat.height) throw new TypeError(`Cannot find the determinant of non-square (${mat.width}×${mat.height}) matrices.`);
		const n = mat.width;

		if (n === 2) return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];

		const { lower, upper } = this.decomposeLU(mat);
		const prodLower = this.diagonal(lower).components.reduce((a, b) => a * b, 1);
		const prodUpper = this.diagonal(upper).components.reduce((a, b) => a * b, 1);

		return prodLower * prodUpper;
	}
	det(this: Matrix<N, N>): number {
		return Matrix.det(this);
	}
	static decomposeLU<N extends number>(mat: Matrix<N, N>) {
		if (mat.width !== mat.height) throw new TypeError(`Cannot LU-decompose non-square (${mat.width}×${mat.height}) matrices.`);
		const n = mat.width;

		let lower = mat;
		let upper = this.identity(n);
		// M = LU
		for (let i = 0; i < n; i++) {
			/* = L ∙ [
				0
				0
				...
				coeffs
				...
				0
				0
			] */
			const change = new Matrix(tuple<Vector<N>, N>(n, j => {
				if (j <= i) return Vector.from(n, 0);
				const coeff = lower[j][i] / lower[i][i];
				// = coeff col
				// col = L[i] = L ∙ [0 0 ... 1 ... 0 0]
				// = L ∙ [0 0 ... coeff ... 0 0]
				const change = Vector.from<N>(n, k => k === i ? coeff : 0);
				return change;
			}));
			lower = lower.sub(Matrix.matMul(lower, change));
			upper = upper.add(change);
		}

		return { upper, lower, mul: Matrix.matMul(lower, upper) };
	}
	// #endregion

	// #region Mat, Mat → Mat
	/**
	 * Matrix multiplication 
	 * ```txt
	 * AB =
	 * ⎡Aᵀ₀∙B₀ Aᵀ₁∙B₀ ⋯ Aᵀₘ∙B₀⎤
	 * ⎢Aᵀ₀∙B₁ Aᵀ₁∙B₁ ⋯ Aᵀₘ∙B₁⎥
	 * ⎢  ⋮      ⋮    ⋱   ⋮   ⎥
	 * ⎣Aᵀ₀∙Bₙ Aᵀ₁∙Bₙ ⋯ Aᵀₘ∙Bₙ⎦
	 * ```
	 */
	static matMul<L extends number, M extends number, N extends number>(
		a: Matrix<L, M>, b: Matrix<N, L>
	): Matrix<N, M> {
		if (a.width !== b.height)
			throw new TypeError(`Cannot multiply a ${a.width}×${a.height} matrix with a ${b.width}×${b.height} matrix.`);
		const aT = a.transpose();
		return Matrix.from(b.width, a.height, (i, j) =>
			Vector.dot(aT[j], b[i])
		);
	}
	// #endregion

	// #region Mat, Vec → Mat
	static mulMatVec<M extends number, N extends number>(mat: Matrix<M, N>, vec: Vector<M>): Vector<N> {
		const t = mat.transpose();
		return new Vector(tuple(mat.height, i => t[i].dot(vec)));
	}
	// #endregion

	// #region Componentwise
	/** @see {@linkcode Matrix.add} */
	static compAdd = matOpWithIdentity(compWiseMatOp((a, b) => a + b), (m, n) => Matrix.from(m, n, 0));
	/** @see {@linkcode Matrix.add} */
	compAdd(...values: (Matrix<M, N> | number)[]) { return Matrix.compAdd(this, ...values); }
	/** @see {@linkcode Matrix.sub} */
	static compSub = matOpNonComm(compWiseMatOp((a, b) => a - b));
	/** @see {@linkcode Matrix.sub} */
	compSub(...values: (Matrix<M, N> | number)[]) { return Matrix.compSub(this, ...values); }
	/**
	 * Componentwise multiplication
	 * ```txt
	 * M₀ * M₁ * ⋯ Mₖ = 
	 * ⎡M₀₀₀ * M₁₀₀ * ⋯ Mₖ₀₀  M₀₁₀ * M₁₁₀ * ⋯ Mₖ₁₀  ⋯  M₀ₘ₀ * M₁ₘ₀ * ⋯ Mₖₘ₀⎤
	 * ⎢M₀₀₁ * M₁₀₁ * ⋯ Mₖ₀₁  M₀₁₁ * M₁₁₁ * ⋯ Mₖ₁₁  ⋯  M₀ₘ₁ * M₁ₘ₁ * ⋯ Mₖₘ₁⎥
	 * ⎢          ⋮                    ⋮            ⋱          ⋮           ⎥
	 * ⎣M₀₀ₙ * M₁₀ₙ * ⋯ Mₖ₀ₙ  M₀₁ₙ * M₁₁ₙ * ⋯ Mₖ₁ₙ  ⋯  M₀ₘₙ * M₁ₘₙ * ⋯ Mₖₘₙ⎦
	 * ```
	 */
	static compMul = matOpWithIdentity(compWiseMatOp((a, b) => a * b), (m, n) => Matrix.from(m, n, 1));
	/** @see {@linkcode Matrix.compMul} */
	compMul(...values: (Matrix<M, N> | number)[]) { return Matrix.compMul(this, ...values); }
	/**
	 * Componentwise division
	 * ```txt
	 * M₀ / M₁ / ⋯ Mₖ = 
	 * ⎡M₀₀₀ / M₁₀₀ / ⋯ Mₖ₀₀  M₀₁₀ / M₁₁₀ / ⋯ Mₖ₁₀  ⋯  M₀ₘ₀ / M₁ₘ₀ / ⋯ Mₖₘ₀⎤
	 * ⎢M₀₀₁ / M₁₀₁ / ⋯ Mₖ₀₁  M₀₁₁ / M₁₁₁ / ⋯ Mₖ₁₁  ⋯  M₀ₘ₁ / M₁ₘ₁ / ⋯ Mₖₘ₁⎥
	 * ⎢          ⋮                    ⋮            ⋱          ⋮           ⎥
	 * ⎣M₀₀ₙ / M₁₀ₙ / ⋯ Mₖ₀ₙ  M₀₁ₙ / M₁₁ₙ / ⋯ Mₖ₁ₙ  ⋯  M₀ₘₙ / M₁ₘₙ / ⋯ Mₖₘₙ⎦
	 * ```
	 */
	static compDiv = matOpNonComm(compWiseMatOp((a, b) => a / b));
	/** @see {@linkcode Matrix.compDiv} */
	compDiv(...values: (Matrix<M, N> | number)[]) { return Matrix.compDiv(this, ...values); }
	// #endregion

	// #region primary ops
	/**
	 * Componentwise addition
	 * ```txt
	 * M₀ + M₁ + ⋯ Mₖ = 
	 * ⎡M₀₀₀ + M₁₀₀ + ⋯ Mₖ₀₀  M₀₁₀ + M₁₁₀ + ⋯ Mₖ₁₀  ⋯  M₀ₘ₀ + M₁ₘ₀ + ⋯ Mₖₘ₀⎤
	 * ⎢M₀₀₁ + M₁₀₁ + ⋯ Mₖ₀₁  M₀₁₁ + M₁₁₁ + ⋯ Mₖ₁₁  ⋯  M₀ₘ₁ + M₁ₘ₁ + ⋯ Mₖₘ₁⎥
	 * ⎢          ⋮                    ⋮            ⋱          ⋮           ⎥
	 * ⎣M₀₀ₙ + M₁₀ₙ + ⋯ Mₖ₀ₙ  M₀₁ₙ + M₁₁ₙ + ⋯ Mₖ₁ₙ  ⋯  M₀ₘₙ + M₁ₘₙ + ⋯ Mₖₘₙ⎦
	 * ```
	 */
	static add<M extends number, N extends number>(...values: (number | Matrix<M, N>)[]) {
		return Matrix.compAdd<M, N>(...values);
	}
	/** @see {@linkcode Matrix.add} */
	add(...values: (number | Matrix<M, N>)[]) { return Matrix.add(this, ...values); }
	/**
	 * Componentwise subtraction
	 * ```txt
	 * M₀ - M₁ - ⋯ Mₖ = 
	 * ⎡M₀₀₀ - M₁₀₀ - ⋯ Mₖ₀₀  M₀₁₀ - M₁₁₀ - ⋯ Mₖ₁₀  ⋯  M₀ₘ₀ - M₁ₘ₀ - ⋯ Mₖₘ₀⎤
	 * ⎢M₀₀₁ - M₁₀₁ - ⋯ Mₖ₀₁  M₀₁₁ - M₁₁₁ - ⋯ Mₖ₁₁  ⋯  M₀ₘ₁ - M₁ₘ₁ - ⋯ Mₖₘ₁⎥
	 * ⎢          ⋮                    ⋮            ⋱          ⋮           ⎥
	 * ⎣M₀₀ₙ - M₁₀ₙ - ⋯ Mₖ₀ₙ  M₀₁ₙ - M₁₁ₙ - ⋯ Mₖ₁ₙ  ⋯  M₀ₘₙ - M₁ₘₙ - ⋯ Mₖₘₙ⎦
	 * ```
	 */
	static sub<M extends number, N extends number>(first: number | Matrix<M, N>, ...values: (number | Matrix<M, N>)[]) {
		return Matrix.compSub<M, N>(first, ...values);
	}
	/** @see {@linkcode Matrix.sub} */
	sub(...values: (number | Matrix<M, N>)[]) { return Matrix.sub(this, ...values); }

	/**
	 * Multiplication of matrices and numbers
	 * ```txt
	 * ABn...C : Matrix
	 * ```
	 * 
	 * Usage Note:  
	 * > Because this method uses complex type shenanigans to infer  
	 *   the resulting vector/matrix's dimension,  
	 *   It can sometimes run into "type instantiation is too deep" errors.  
	 *   You can try specifying the type arguments directly, or adding a `satisfies` clause.
	 */
	static mul<N0 extends number, N1 extends number, NTail extends number[]>
		(...values: MulableMatrices<N0, N1, NTail>): MulMatResult<N0, N1, NTail>;
	/**
	 * Multiplication of matrices and vector
	 * ```txt
	 * ABn...Cv⃗ : Vector
	 * ```
	 * 
	 * Usage Note:  
	 * > Because this method uses complex type shenanigans to infer  
	 *   the resulting vector/matrix's dimension,  
	 *   It can sometimes run into "type instantiation is too deep" errors.  
	 *   You can try specifying the type arguments directly, or adding a `satisfies` clause.
	 */
	static mul<N0 extends number, N1 extends number, NTail extends number[]>
		(...values: [...MulableMatrices<N0, N1, NTail>, Vector<MatMulResultDim<N1, NTail>>]): Vector<N1>;
	static mul<N0 extends number, N1 extends number, NTail extends number[]>(
		...values: MulableMatrices<N0, N1, NTail> | [...MulableMatrices<N0, N1, NTail>, Vector<MatMulResultDim<N1, NTail>>]
	): MulMatResult<N0, N1, NTail> | Vector<N1> {
		if (values.length === 0) throw new Error("Cannot multiply nothing");

		if (endsWithVector(values)) {
			const [rest, final] = end(values);
			// @ts-expect-error cannot make typesafe
			if (rest.length < 1) return final;
			// @ts-expect-error cannot make typesafe
			return Matrix.mulMatVec(Matrix.mul(...rest), final);
		}

		const numbers = (values as unknown[]).filter(isNumber);
		const matrices = (values as unknown[]).filter(isMatrix);
		if (matrices.length === 0)
			throw new TypeError("Cannot multiply only numbers; cannot infer expected matrix dimensions");
		const mat = matrices.slice(1).reduce((acc, curr) => (
			Matrix.matMul(acc, curr)
		), matrices[0]);
		const scalar = numbers.reduce((a, b) => a * b, 1);
		// @ts-expect-error cannot make typesafe
		return Matrix.compMul(mat, scalar);
	}
	/**
	 * Multiplication of matrices and numbers
	 * ```txt
	 * ABn...C : Matrix
	 * ```
	 * 
	 * Usage Note:  
	 * > Because this method uses complex type shenanigans to infer  
	 *   the resulting vector/matrix's dimension,  
	 *   It can sometimes run into "type instantiation is too deep" errors.  
	 *   You can try specifying the type arguments directly, or adding a `satisfies` clause.
	 * @see {@linkcode Matrix.mul}
	 */
	mul<NTail extends number[] = []>(...values: MulableMatricesNoFirst<M, NTail>): MulMatResult<N, M, NTail>;
	/**
	 * Multiplication of matrices and vector
	 * ```txt
	 * ABn...Cv⃗ : Vector
	 * ```
	 * 
	 * Usage Note:  
	 * > Because this method uses complex type shenanigans to infer  
	 *   the resulting vector/matrix's dimension,  
	 *   It can sometimes run into "type instantiation is too deep" errors.  
	 *   You can try specifying the type arguments directly, or adding a `satisfies` clause.
	 * @see {@linkcode Matrix.mul}
	 */
	mul<NTail extends number[] = []>(...values: [...MulableMatricesNoFirst<M, NTail>, Vector<MatMulResultDim<M, NTail>>]): Vector<M>;
	mul<NTail extends number[] = []>(
		...values: MulableMatricesNoFirst<M, NTail> | [...MulableMatricesNoFirst<M, NTail>, Vector<MatMulResultDim<M, NTail>>]
	): MulMatResult<N, M, NTail> | Vector<M> {
		// @ts-expect-error trust me bro
		return Matrix.mul(this, ...values);
	}
	mulVec(vec: Vector<M>): Vector<N> {
		return Matrix.mulMatVec(this, vec);
	}
	// #endregion

	// #endregion
}