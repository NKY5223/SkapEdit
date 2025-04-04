import { useState, useEffect, RefObject, PointerEventHandler, Dispatch, SetStateAction, useRef } from "react";
import { Vec2, vec2, zero } from "../common/vec2.ts";

export const useDrag = (
	/** Mouse button to use for dragging. Use `"*"` for any button. */
	button: number | "*" = "*",
	/** 
	 * Element to measure pointer position against.  
	 * If passed, will normalize pointer position to between `⟨0, 0⟩` and `⟨1, 1⟩`.
	 */
	normalize?: RefObject<Element> | null,
	onDrag?: (current: Vec2, previous: Vec2, beforeDrag: Vec2) => void,
): {
	/** Current pointer position. */
	current: Vec2;
	/** Pointer position *before* dragging. */
	beforeDrag: Vec2;
	dragging: boolean;
	/**	Call this to start dragging. */
	handlePointerDown: PointerEventHandler;
	setCurrent: Dispatch<SetStateAction<Vec2>>;
} => {
	const [dragging, setDragging] = useState(false);
	const [beforeDrag, setBeforeDrag] = useState(zero);
	const [current, setCurrent] = useState(zero);
	const previous = useRef(zero);

	// Drag
	useEffect(() => {
		if (!dragging) return;
		const handleMove = (event: PointerEvent): void => {
			event.preventDefault();
			const pointer = vec2(event.clientX, event.clientY);
			if (!normalize) {
				const newPos = pointer;
				if (onDrag) onDrag(newPos, previous.current, beforeDrag);
				setCurrent(newPos);
				previous.current = newPos;
				return;
			}
			const target = normalize.current;
			if (!target) return;

			const bounds = target.getBoundingClientRect();

			const targetPos = vec2(bounds.left, bounds.top);
			const targetSize = vec2(bounds.width, bounds.height);
			const newPos = pointer.sub(targetPos).div(targetSize);

			if (onDrag) onDrag(newPos, previous.current, beforeDrag);
			setCurrent(newPos);
			previous.current = newPos;
		};
		window.addEventListener("pointermove", handleMove);
		return () => window.removeEventListener("pointermove", handleMove);
	}, [dragging]);
	// Stop dragging
	useEffect(() => {
		const handleBlur = () => setDragging(false);
		const handlePointerUp = (event: PointerEvent) => {
			if (button === "*" || event.button === button) {
				setDragging(false);
			}
		}
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("blur", handleBlur);

		return () => {
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("blur", handleBlur);
		}
	});

	const handlePointerDown: PointerEventHandler = event => {
		if (button === "*" || event.button === button) {
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
		current, setCurrent,
		beforeDrag,
		dragging,
		handlePointerDown,
	};
}