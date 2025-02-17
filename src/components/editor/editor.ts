import { useState } from "react";

export type Bounds = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};
export type BoundsWithDimension = Bounds & {
	width: number;
	height: number;
};

export function useBounds(initial: Bounds) {
	const [left, setLeft] = useState(initial.left);
	const [top, setTop] = useState(initial.top);
	const [right, setRight] = useState(initial.right);
	const [bottom, setBottom] = useState(initial.bottom);

	const bounds: Readonly<BoundsWithDimension> = {
		left, top,
		right, bottom,
		width: right - left, height: bottom - top
	};

	const setWidth = (width: number) => {
		setRight(left + width);
	}
	const setHeight = (height: number) => {
		setBottom(top + height);
	}

	const setBounds = (data: Partial<BoundsWithDimension>) => {
		const { left, top, right, bottom, width, height } = data;

		setLeft(prev => left ?? (
			def(right) && def(width)
				? right - width
				: prev
		));
		setTop(prev => top ?? (
			def(bottom) && def(height)
				? bottom - height
				: prev
		));
		setRight(prev => right ?? (
			def(width)
				? (left ?? bounds.left) + width
				: prev
		));
		setBottom(prev => bottom ?? (
			def(height)
				? (top ?? bounds.top) + height
				: prev
		));
	}

	return [bounds, {
		setLeft, setTop, setRight, setBottom,
		setWidth, setHeight,
		setBounds,
	}] as const;
}

const def = <T>(x: T | undefined): x is T => x !== undefined;