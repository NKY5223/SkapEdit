import { useState } from "react";
import { BoundsInit, Bounds, BoundsClampBehavior } from "../editor/bounds.ts";

export function boundsSetters(set: React.Dispatch<React.SetStateAction<Bounds>>, clamp: BoundsClampBehavior = "prefer-new") {
	return {
		setLeft: (left: number) => set(b => b.set({ left }, clamp)),
		setTop: (top: number) => set(b => b.set({ top }, clamp)),
		setRight: (right: number) => set(b => b.set({ right }, clamp)),
		setBottom: (bottom: number) => set(b => b.set({ bottom }, clamp)),
		setWidth: (width: number) => set(b => b.set({ width }, clamp)),
		setHeight: (height: number) => set(b => b.set({ height }, clamp)),
		setBounds: (bounds: BoundsInit) => set(b => b.set(bounds, clamp)),
	};
}

export function useBounds(initial: BoundsInit, clamp: BoundsClampBehavior = "prefer-new"): [bounds: Bounds, setters: {
	setLeft: (left: number) => void;
	setTop: (top: number) => void;
	setRight: (right: number) => void;
	setBottom: (bottom: number) => void;
	setWidth: (width: number) => void;
	setHeight: (height: number) => void;
	setBounds: (bounds: BoundsInit) => void;
}] {
	const [bounds, setBounds] = useState<Bounds>(new Bounds(initial));
	return [bounds, {
		setLeft: (left: number) => setBounds(b => b.set({ left }, clamp)),
		setTop: (top: number) => setBounds(b => b.set({ top }, clamp)),
		setRight: (right: number) => setBounds(b => b.set({ right }, clamp)),
		setBottom: (bottom: number) => setBounds(b => b.set({ bottom }, clamp)),
		setWidth: (width: number) => setBounds(b => b.set({ width }, clamp)),
		setHeight: (height: number) => setBounds(b => b.set({ height }, clamp)),
		setBounds: (bounds: BoundsInit) => setBounds(b => b.set(bounds, clamp)),
	}];
}
