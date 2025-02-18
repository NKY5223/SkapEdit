import { useState } from "react";
import { def } from "./def.ts";

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

export function useBounds(initial: Bounds, clamp: boolean = true) {
	const [left, setLeft] = useState(initial.left);
	const [top, setTop] = useState(initial.top);
	const [right, setRight] = useState(initial.right);
	const [bottom, setBottom] = useState(initial.bottom);

	const bounds: Readonly<BoundsWithDimension> = {
		left, top,
		right, bottom,
		width: right - left, height: bottom - top
	};

	const setBounds = (data: Partial<BoundsWithDimension>) => {
		const { left: l, top: t, right: r, bottom: b, width: w, height: h } = data;
		const { left: pLeft, top: pTop, right: pRight, bottom: pBottom } = bounds;

		const width = clamp ? Math.max(0, w ?? 0) : w ?? 0;
		const height = clamp ? Math.max(0, h ?? 0) : h ?? 0;

		const left = l ?? (
			def(r) && def(w)
				? r - width
				: pLeft
		);
		const top = t ?? (
			def(b) && def(h)
				? b - height
				: pTop
		);
		const right = r ?? (
			def(w)
				? (l ?? pLeft) + width
				: pRight
		);
		const bottom = b ?? (
			def(h)
				? (t ?? pTop) + height
				: pBottom
		);

		setLeft(left);
		setTop(top);
		setRight(right);
		setBottom(bottom);

		if (clamp) {
			if (left > right) {
				if (def(l)) {
					setRight(left);
				} else if (def(r)) {
					setLeft(right);
				} else if (def(w)) {
					// ONLY width is defined???
					throw new Error("width is somehow negative");
				} else {
					throw new Error("clamped bounds somehow became negative");
				}
			}
			if (top > bottom) {
				if (def(t)) {
					setBottom(top);
				} else if (def(b)) {
					setTop(bottom);
				} else if (def(h)) {
					// ONLY height is defined???
					throw new Error("height is somehow negative");
				} else {
					throw new Error("clamped bounds somehow became negative");
				}
			}
		}

	};

	return [bounds, {
		setLeft: (left: number) => setBounds({ left }), 
		setTop: (top: number) => setBounds({ top }), 
		setRight: (right: number) => setBounds({ right }), 
		setBottom: (bottom: number) => setBounds({ bottom }),
		setWidth: (width: number) => setBounds({ width }), 
		setHeight: (height: number) => setBounds({ height }),
		setBounds,
	}] as const;
}
