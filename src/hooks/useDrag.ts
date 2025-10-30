import { useState, useEffect, RefObject, PointerEventHandler, Dispatch, SetStateAction, useRef, useEffectEvent } from "react";
import { Vec2, vec2, zero } from "../common/vec2.ts";
import { elementIsRtl } from "@components/utils.tsx";

export type MouseButtons = number;
export const MouseButtons: {
	readonly Left: MouseButtons;
	readonly Middle: MouseButtons;
	readonly Right: MouseButtons;
	readonly All: MouseButtons;
} = {
	Left: 1 << 0,
	Middle: 1 << 1,
	Right: 1 << 2,

	All: ~0,
};

const mouseButtonMatches = (button: number, buttons: MouseButtons) => !!(1 << button & buttons);

type DragParams = {
	/** Bitflags: mouse buttons to use for dragging. Use `MouseButton.All` for any button. */
	buttons: MouseButtons,
	/** 
	 * Element to measure pointer position against.  
	 * If passed, will normalize pointer position to between `⟨0, 0⟩` and `⟨1, 1⟩`.
	 */
	normalize?: RefObject<Element | null> | null,
	onDrag?: (current: Vec2, previous: Vec2, beforeDrag: Vec2, event: PointerEvent) => void,
	onEndDrag?: (event: PointerEvent) => void,
	/** If set to true, will flip the x direction when `document.dir === "rtl"`. Will not work without normalize. Defaults to true. */
	normalizeDir?: boolean,
	enabled?: boolean,
};
export const useDrag = ({
	buttons,
	normalize = null,
	onDrag, onEndDrag,
	normalizeDir = true,
	enabled = true,
}: DragParams): {
	dragging: boolean;
	/** Current pointer position. */
	currentPos: Vec2;
	setCurrentPos: Dispatch<SetStateAction<Vec2>>;

	/** Pointer position *before* dragging. */
	beforeDrag: Vec2;

	/**	Attach these listeners to element. */
	listeners: {
		onPointerDown: PointerEventHandler;
	};
} => {
	const [dragging, setDragging] = useState(false);
	const [beforeDrag, setBeforeDrag] = useState(zero);
	const [currentPos, setCurrentPos] = useState(zero);
	const previous = useRef(zero);

	// Drag
	useEffect(() => {
		if (!dragging) return;
		if (!enabled) return;
		const handleMove = (event: PointerEvent): void => {
			event.preventDefault();
			const pointer = vec2(event.clientX, event.clientY);
			if (!normalize) {
				// Do not normalize
				const newPos = pointer;
				if (onDrag) onDrag(newPos, previous.current, beforeDrag, event);
				setCurrentPos(newPos);
				previous.current = newPos;
				return;
			}
			// Normalize to [0, 1]
			const target = normalize.current;
			if (!target) return;

			const bounds = target.getBoundingClientRect();

			const targetPos = vec2(bounds.left, bounds.top);
			const targetSize = vec2(bounds.width, bounds.height);
			const newPos = pointer.sub(targetPos).div(targetSize);

			const doDirNorm = normalizeDir && elementIsRtl(target);
			const normedNewPos = doDirNorm
				? vec2(1 - newPos[0], newPos[1])
				: newPos;

			if (onDrag) onDrag(normedNewPos, previous.current, beforeDrag, event);
			setCurrentPos(normedNewPos);
			previous.current = normedNewPos;
		};
		window.addEventListener("pointermove", handleMove);
		return () => window.removeEventListener("pointermove", handleMove);
	}, [dragging, enabled]);
	// End dragging
	useEffect(() => {
		const handleBlur = () => setDragging(false);
		const handlePointerUp = (event: PointerEvent) => {
			if (mouseButtonMatches(event.button, buttons)) {
				setDragging(false);
				onEndDrag?.(event);
			}
		}
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("blur", handleBlur);

		return () => {
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("blur", handleBlur);
		}
	});

	const onPointerDown: PointerEventHandler = event => {
		if (enabled && mouseButtonMatches(event.button, buttons)) {
			setDragging(true);
			const pointer = vec2(event.clientX, event.clientY);

			if (!normalize) {
				previous.current = pointer;
				setBeforeDrag(pointer);
				return;
			}

			const target = normalize.current;
			if (!target) {
				console.warn(`Could not calculate previous norm pointer position.`);
				previous.current = pointer;
				setBeforeDrag(pointer);
				return;
			}

			const bounds = target.getBoundingClientRect();
			const targetPos = vec2(bounds.left, bounds.top);
			const targetSize = vec2(bounds.width, bounds.height);
			const curr = pointer.sub(targetPos).div(targetSize);
			previous.current = curr;
			setBeforeDrag(curr);
		}
	};

	return {
		currentPos: currentPos, setCurrentPos: setCurrentPos,
		beforeDrag,
		dragging,
		listeners: {
			onPointerDown,
		},
	};
}