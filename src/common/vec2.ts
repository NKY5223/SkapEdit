import { sign } from "./number.ts";
import { Matrix, Vector } from "./vectorN.ts";

export type Vec2 = Vector<2>;
export type Mat2 = Matrix<2, 2>;
export const vec2 = (x: number, y = x) => new Vector(x, y);
export const mat2 = (xx: number, xy: number, yx: number, yy: number) => new Matrix(2, 2, [[xx, xy], [yx, yy]] as const);

export const zero = vec2(0);
export const î = vec2(1, 0);
export const ĵ = vec2(0, 1);
export const swapMat = new Matrix(ĵ, î);
export const cw90 = new Matrix(ĵ, î.neg());
export const ccw90 = new Matrix(ĵ.neg(), î);

export const swap = (vec: Vec2) => new Vector(vec[1], vec[0]);
export const safeNorm = (vec: Vec2, fallback = î) => vec.equal(zero) ? fallback : vec.norm();
export const orth = (vec: Vec2) => new Matrix(vec, cw90.mul<[]>(vec));

export const polar = (θ: number, r = 1) => vec2(r * Math.cos(θ), r * Math.sin(θ));
export const arg = (vec: Vec2) => Math.atan2(vec[1], vec[0]);

export const parallel = (a: Vec2, b: Vec2, ε: number = 0.001) => Math.abs(a.dotNorm(b)) > 1 - ε;
/** 
 * ```
 * rotationMat(90°) => [ĵ, -î]
 * ```
 */
export const rotationMat = (θ: number) => {
	const cos = Math.cos(θ);
	const sin = Math.sin(θ);
	return mat2(
		cos, sin,
		-sin, cos,
	);
};
/** @returns ∈ [-π, π], clockwise > 0 */
export const signedAngle = (a: Vec2, b: Vec2): number => {
	return sign(new Matrix(a, b).det()) * a.angle(b);
}