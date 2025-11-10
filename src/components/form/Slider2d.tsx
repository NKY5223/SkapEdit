import { round } from "@common/number.ts";
import { vec2, Vec2 } from "@common/vec2.ts";
import { toClassName } from "@components/utils.tsx";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { FC, KeyboardEventHandler, useRef } from "react";
import css from "./Slider.module.css";

const clampVec = (min: Vec2, max: Vec2) => (v: Vec2): Vec2 =>
	vec2(
		Math.min(Math.max(min[0], v[0]), max[0]),
		Math.min(Math.max(min[1], v[1]), max[1]),
	);
const roundVec = (step: Vec2, val: Vec2): Vec2 =>
	vec2(
		round(step[0], val[0]),
		round(step[1], val[1]),
	);

type Slider2dProps = {
	x: number;
	y: number;
	min?: number;
	max?: number;
	step?: number;
	xMin?: number;
	xMax?: number;
	xStep?: number;
	yMin?: number;
	yMax?: number;
	yStep?: number;

	disabled?: boolean;

	onInput?: (value: Vec2) => void;

	classList?: string | string[];
	handleClassList?: string | string[];
};
export const Slider2d: FC<Slider2dProps> = ({
	x, y,
	min = 0, max = 1, step = 0,
	xMin = min, xMax = max, xStep = step,
	yMin = min, yMax = max, yStep = step,
	disabled = false,
	onInput,

	classList, handleClassList,
}) => {
	const slider2dRef = useRef<HTMLDivElement>(null);
	const minV = vec2(xMin, yMin);
	const maxV = vec2(xMax, yMax);
	const stepV = vec2(xStep, yStep);
	const MinV = vec2(
		Math.min(xMin, xMax),
		Math.min(yMin, yMax),
	);
	const MaxV = vec2(
		Math.max(xMin, xMax),
		Math.max(yMin, yMax),
	);
	const val = vec2(x, y).sub(minV).div(maxV.sub(minV));
	const update = (v: Vec2) => onInput?.(clampVec(MinV, MaxV)(roundVec(stepV, v)));

	const { dragging, listeners } = useDrag({
		buttons: MouseButtons.Left,
		normalizeToUnit: slider2dRef,
		clamp: true,

		onDrag: v => {
			if (disabled) return;
			if (!onInput) return;
			update(vec2(1).sub(v).mul(minV).add(v.mul(maxV)));
		}
	});

	const onKeyDown: KeyboardEventHandler = e => {
		if (disabled) return;
		if (!onInput) return;
		// Default to 1% of slider range
		const moveX = vec2(xStep || (xMax - xMin) * .01, 0);
		const moveY = vec2(0, yStep || (yMax - yMin) * .01);
		switch (e.code) {
			case "ArrowLeft": {
				update(val.sub(moveX));
				return;
			}
			case "ArrowRight": {
				update(val.add(moveX));
				return;
			}
			case "ArrowUp": {
				update(val.sub(moveY));
				return;
			}
			case "ArrowDown": {
				update(val.add(moveY));
				return;
			}
			case "Home": {
				update(vec2(xMin, val[1]));
				return;
			}
			case "End": {
				update(vec2(xMax, val[1]));
				return;
			}
			case "PageUp": {
				update(vec2(val[0], yMin));
				return;
			}
			case "PageDown": {
				update(vec2(val[0], yMax));
				return;
			}
		}
	}

	const slider2dClassName = toClassName(
		css["slider-2d"],
		dragging && css["dragging"],
		disabled && css["disabled"],
		classList,
	);
	const handleClassName = toClassName(
		css["handle"],
		handleClassList,
	);
	return (
		<div ref={slider2dRef} className={slider2dClassName}
			onKeyDown={onKeyDown} {...listeners}
		>
			<div tabIndex={0} className={handleClassName} style={{
				"--left": `${val[0] * 100}%`,
				"--top": `${val[1] * 100}%`,
			}}></div>
		</div>
	);
}