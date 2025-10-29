import { Realize, Values } from "../common/types.ts";
import { Vec2, vec2 } from "../common/vec2.ts";

// #region lrtbwh
type BoundsLRTBWHKeys = "left" | "right" | "top" | "bottom" | "width" | "height";
type BoundsInitLRTBWH = Realize<({
	left: number;
	right: number;
} | {
	left: number;
	width: number;
} | {
	right: number;
	width: number;
}) & ({
	top: number;
	bottom: number;
} | {
	top: number;
	height: number;
} | {
	height: number;
	bottom: number;
})>;

type ToInter<T> = [
	T extends [infer K] ? (_: K) => void : never
] extends [(_: infer P) => void]
	? P : never;
type Partials<T> = Realize<ToInter<Values<{
	[K in keyof T]: [{} | Realize<Record<K, T[K]>>]
}>>>;
type NotFull<T> = Exclude<Partials<T>, T>;
// union of 49 types lmaoooooo
export type BoundsUpdateLRTBWH = Realize<
	NotFull<{
		left: number,
		right: number,
		width: number,
	}> & NotFull<{
		top: number,
		bottom: number,
		height: number,
	}>
>;
// #endregion

export type BoundsInit = (
	| BoundsInitLRTBWH
	| {
		pos: Vec2;
		size: Vec2;
	}
	| {
		topLeft: Vec2;
		bottomRight: Vec2;
	}
);
export type BoundsClampBehavior = "none" | "prefer-new" | "prefer-old";
const undefBounds: Readonly<Record<BoundsLRTBWHKeys, undefined>> = {
	left: undefined,
	right: undefined,
	top: undefined,
	bottom: undefined,
	width: undefined,
	height: undefined,
};
export class Bounds {
	readonly left: number;
	readonly right: number;
	readonly top: number;
	readonly bottom: number;
	constructor(bounds: BoundsInit) {
		if ("pos" in bounds) {
			const [left, top] = bounds.pos;
			const [right, bottom] = bounds.pos.add(bounds.size);

			this.left = left;
			this.right = right;
			this.top = top;
			this.bottom = bottom;
			return;
		}
		if ("topLeft" in bounds) {
			const [left, top] = bounds.topLeft;
			const [right, bottom] = bounds.bottomRight;

			this.left = left;
			this.right = right;
			this.top = top;
			this.bottom = bottom;
			return;
		}
		const [left, right] = completeBounds(
			"left" in bounds ? bounds.left : undefined,
			"right" in bounds ? bounds.right : undefined,
			"width" in bounds ? bounds.width : undefined,
		);
		const [top, bottom] = completeBounds(
			"top" in bounds ? bounds.top : undefined,
			"bottom" in bounds ? bounds.bottom : undefined,
			"height" in bounds ? bounds.height : undefined,
		);
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	}
	get width() { return this.right - this.left; }
	get height() { return this.bottom - this.top; }

	get topLeft() { return vec2(this.left, this.top); }
	get topRight() { return vec2(this.right, this.top); }
	get bottomLeft() { return vec2(this.left, this.bottom); }
	get bottomRight() { return vec2(this.right, this.bottom); }
	get size() { return vec2(this.width, this.height); }

	setLeft(left: number) { return new Bounds({ ...this, left }); }
	setRight(right: number) { return new Bounds({ ...this, right }); }
	setTop(top: number) { return new Bounds({ ...this, top }); }
	setBottom(bottom: number) { return new Bounds({ ...this, bottom }); }
	set(bounds: BoundsUpdateLRTBWH, clampBehavior: BoundsClampBehavior = "prefer-new"): Bounds {
		const partial = { ...undefBounds, ...bounds };
		const [left, right] = updateBounds(
			partial.left,
			partial.right,
			partial.width,
			this.left,
			this.right,
			clampBehavior,
		);
		const [top, bottom] = updateBounds(
			partial.top,
			partial.bottom,
			partial.height,
			this.top,
			this.bottom,
			clampBehavior,
		);
		return new Bounds({
			left, right,
			top, bottom,
		});
	}

	/** Returns true if point is within bounds OR is on the boundary. */
	contains(point: Vec2): boolean {
		return (
			point[0] >= this.left &&
			point[0] <= this.right &&
			point[1] >= this.top &&
			point[1] <= this.bottom
		);
	}
	translate(by: Vec2): Bounds {
		return new Bounds({ 
			topLeft: this.topLeft.add(by),
			bottomRight: this.bottomRight.add(by),
		});
	}
	scale(center: Vec2, scale: Vec2): Bounds {
		return new Bounds({ 
			topLeft: this.topLeft.sub(center).mul(scale).add(center),
			bottomRight: this.bottomRight.sub(center).mul(scale).add(center),
		});
	}
}

const completeBounds = (
	start: number | undefined,
	end: number | undefined,
	length: number | undefined
): [start: number, end: number] => {
	if (start !== undefined && end !== undefined) {
		return [start, end];
	}
	if (start !== undefined && length !== undefined) {
		return [start, start + length];
	}
	if (end !== undefined && length !== undefined) {
		return [end - length, end];
	}
	throw new Error(`Cannot construct bounds with start-end-length: ${start}, ${end}, ${length}`);
}
const updateBoundsUnclamped = (
	newStart: number | undefined,
	newEnd: number | undefined,
	newLength: number | undefined,
	start: number,
	end: number,
): [start: number, end: number] => {
	if (newStart !== undefined && newEnd !== undefined) {
		return [newStart, newEnd];
	}
	if (newStart !== undefined && newLength !== undefined) {
		return [newStart, newStart + newLength];
	}
	if (newEnd !== undefined && newLength !== undefined) {
		return [newEnd - newLength, newEnd];
	}
	if (newStart !== undefined) {
		return [newStart, end];
	}
	if (newEnd !== undefined) {
		return [start, newEnd];
	}
	if (newLength !== undefined) {
		return [start, start + newLength];
	}
	// Everything is undefined, return without modification
	return [start, end];
	// throw new Error(`Cannot update bounds with start-end-length: ${newStart}, ${newEnd}, ${newLength}`);
}
const updateBounds = (
	newStart: number | undefined,
	newEnd: number | undefined,
	newLength: number | undefined,
	oldStart: number,
	oldEnd: number,
	clamp: BoundsClampBehavior = "prefer-new",
): [start: number, end: number] => {
	const [updStart, updEnd] = updateBoundsUnclamped(newStart, newEnd, newLength, oldStart, oldEnd);
	if (clamp === "none") return [updStart, updEnd];
	if (updStart <= updEnd) return [updStart, updEnd];
	if (clamp === "prefer-new") {
		if (newStart !== undefined) {
			return [updStart, updStart];
		} else if (newEnd !== undefined) {
			return [updEnd, updEnd];
		} else if (newLength !== undefined) {
			// Only length defined, fallback to start
			return [updStart, updStart];
		} else {
			console.error(`Could not update clamped bounds with start-end-length: ${newStart}, ${newEnd}, ${newLength}`);
		}
	}
	if (clamp === "prefer-old") {
		if (newStart !== undefined) {
			return [oldEnd, oldEnd];
		} else if (newEnd !== undefined) {
			return [oldStart, oldStart];
		} else if (newLength !== undefined) {
			// Only length defined, fallback to start
			return [oldStart, oldStart];
		} else {
			console.error(`Could not update clamped bounds with start-end-length: ${newStart}, ${newEnd}, ${newLength}`);
		}
	}
	return [updStart, updEnd];
}

