import { typeset } from "./string.ts";
import { map, ReadonlyTuple, tuple } from "./tuple.ts";

// #region Helpers
const str: (n: number) => string = n => n.toString();

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
		const n: N | undefined = values.find<Vector<N>>(isVector)?.length;
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

	// #region String
	static rowStr(values: readonly number[]): string {
		return `[${values.join(", ")}]`;
	}
	static colStr(values: readonly number[]): string {
		const N = values.length;
		if (N <= 1) {
			return `[${values.join(" ")}]`;
		}

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
		return Vector.colStr(this.components);
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
	static mul = vecOpWithIdentity(compWiseVecOp((a, b) => a + b), n => Vector.from(n, 1));
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
	static div = vecOpNonComm(compWiseVecOp((a, b) => a - b));
	/** @see {@linkcode Vector.div} */
	div(...values: (Vector<N> | number)[]) { return Vector.div(this, ...values); }
	// #endregion

	// #region (Vec, Vec) → number
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
	// #endregion

	// #region Vec → number
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

type MulableMatrices<N0 extends number, NTail extends [number, ...number[]]> = {
	[Ni in keyof NTail]: Matrix<
		NTail[Ni],
		Ni extends 0 ? N0 : Index<[N0, ...NTail], Ni>
	>
};
// 1,[3,4,5] => 3x1 4x3 5x4 => 5x1 => 5, 1
type MulResult<N0 extends number, NTail extends [number, ...number[]]> =
	NTail extends [...number[], infer N extends number] ?
	Matrix<N0, N> : never;

type test = [
	MulableMatrices<1, [3, 4]>,
	MulResult<1, [3, 4]>
];
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
	 * // => ⎡M₀₀ M₀₁ ⋯ M₀ₘ⎤
	 * //    ⎢M₁₀ M₁₁ ⋯ M₁ₘ⎥
	 * //    ⎢ ⋮   ⋮  ⋱  ⋮ ⎥
	 * //    ⎣Mₙ₀ Mₙ₁ ⋯ Mₙₘ⎦
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
			value: vectors,
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
				tuple(width, () => Vector.from(height, 0))
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

	toString(): string {
		const N = this.height;
		const strs = this.vectors.map(vec =>
			vec.components.map(str)
		);
		const widths = strs.map(col => Math.max(...col.map(s => s.length)));
		const padded = strs.map((col, i) => col.map(s => s.padEnd(widths[i], " ")));

		return padded[0].map((_, i) => {
			const s = padded.map(col => col[i]).join(" ");
			return i === 0 ? `⎡${s}⎤` :
				i !== N - 1 ? `⎢${s}⎥` :
					`⎣${s}⎦`;
		}).join("\n");
	}


	// #region Math

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

	// #region (Mat | number)[] → Mat
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

	static mulMats<N0 extends number, NTail extends [number, ...number[]]>(
		...values: MulableMatrices<N0, NTail>
	): MulResult<N0, NTail> {
		if (values.length === 0)
			throw new Error("Cannot multiply 0 matrices; cannot infer the expected dimensions.");
		if (values.length === 1)
			// fml
			return values[0] as unknown as MulResult<N0, NTail>;
		const [first, second, ...rest] = values;

		// casting hell
		return Matrix.mulMats<number, [number, ...number[]]>(Matrix.matMul<number, number, number>(
			first as unknown as Matrix<number, number>, 
			second as unknown as Matrix<number, number>
		), ...rest as Matrix<number, number>[])
	}
	// #endregion

	// #endregion
}

// `as const` required to infer tuple type
const A = new Matrix(2, 3, [
	[0, 1, 2],
	[3, 4, 5],
] as const).transpose();
const B = new Matrix(3, 3, [
	[0, 1, 2],
	[3, 4, 5],
	[3, 4, 5],
] as const).transpose();
const C = new Matrix(2, 1, [
	[0],
	[1],
] as const).transpose();

console.log({
	"this is a": "debug message, check my insides",
	get clicky_for_log() {
		console.log(typeset({})
			`A = ${A}; B = ${B}; AB = ${Matrix.mulMats<2, [3, 3, 1]>(A, B, C)}`
		);
		return "done";
	}
});
