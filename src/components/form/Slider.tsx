import { toClassName } from "@components/utils.tsx";
import { FC, KeyboardEventHandler, useRef } from "react";
import css from "./Slider.module.css";
import { useDrag, MouseButtons } from "@hooks/useDrag.ts";
import { clamp, round } from "@common/number.ts";

type SliderProps = {
	value: number;
	/** Can be greater than max, the direction will flip if it is. */
	min?: number;
	/** Can be less than min, the direction will flip if it is. */
	max?: number;
	/** 
	 * Values will be rounded to the nearest multiple of step, then clamped.  
	 * If min and max are not multiples of step, unexpected behaviour may occur.
	 */
	step?: number;

	onInput?: (value: number) => void;
	orientation?: "horizontal" | "vertical";

	classList?: string | string[];
	handleClassList?: string | string[];
};
export const Slider: FC<SliderProps> = ({
	value, min = 0, max = 1, step = 0,
	orientation = "horizontal",
	onInput,

	classList, handleClassList,
}) => {
	const sliderRef = useRef<HTMLDivElement>(null);
	const Min = Math.min(min, max);
	const Max = Math.max(min, max);
	const val = (value - min) / (max - min);
	const validate = (value: number) => clamp(Min, Max)(round(step, value));
	const update = (v: number) => onInput?.(validate(v));

	const { dragging, listeners } = useDrag({
		buttons: MouseButtons.Left,
		normalizeToUnit: sliderRef,
		clamp: true,
		stopPropagation: true,

		onDrag: ([x, y]) => {
			if (!onInput) return;
			const v = orientation === "horizontal" ? x : y;
			update((1 - v) * min + v * max);
		}
	});

	const onKeyDown: KeyboardEventHandler = e => {
		if (!onInput) return;
		switch (e.code) {
			case "ArrowLeft": {
				update(value - step);
				return;
			}
			case "ArrowRight": {
				update(value + step);
				return;
			}
			case "Home": {
				update(min);
				return;
			}
			case "End": {
				update(max);
				return;
			}
		}
	}

	const trackClassName = toClassName(
		css["slider"],
		dragging && css["dragging"],
		css[orientation],
		classList
	);
	const handleClassName = toClassName(
		css["handle"],
		handleClassList,
	);
	return (
		<div ref={sliderRef} className={trackClassName} style={{
			"--value": `${val * 100}%`,
		}} onKeyDown={onKeyDown} {...listeners}>
			<div tabIndex={0} className={handleClassName}></div>
		</div>
	);
}