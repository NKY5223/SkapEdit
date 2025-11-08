import { FC, useRef } from "react";
import css from "./Slider.module.css";
import { vec2, Vec2 } from "@common/vec2.ts";
import { toClassName } from "@components/utils.tsx";
import { useDrag, MouseButtons } from "@hooks/useDrag.ts";

const clampVec = (min: Vec2, max: Vec2) => (v: Vec2): Vec2 => 
	vec2(
		Math.min(Math.max(min[0], v[0]), max[0]),
		Math.min(Math.max(min[1], v[1]), max[1]),
	);

type Slider2dProps = {
	x: number;
	y: number;
	min?: number;
	max?: number;
	xMin?: number;
	xMax?: number;
	yMin?: number;
	yMax?: number;

	onInput?: (value: Vec2) => void;

	classList?: string[];
	handleClassList?: string[];
};
export const Slider2d: FC<Slider2dProps> = ({
	x, y,
	min = 0, max = 1, 
	xMin = min, xMax = max, yMin = min, yMax = max,
	onInput,

	classList, handleClassList,
}) => {
	const slider2dRef = useRef<HTMLDivElement>(null);
	const minV = vec2(xMin, yMin);
	const maxV = vec2(xMax, yMax);
	const MinV = vec2(
		Math.min(xMin, xMax),
		Math.min(yMin, yMax),
	);
	const MaxV = vec2(
		Math.max(xMin, xMax),
		Math.max(yMin, yMax),
	);
	const val = vec2(x, y).sub(minV).div(maxV.sub(minV));

	const { dragging, listeners } = useDrag({
		buttons: MouseButtons.Left,
		normalizeToUnit: slider2dRef,
		clamp: true,

		onDrag: v => {
			if (!onInput) return;
			const scaled = clampVec(MinV, MaxV)(v);
			onInput(scaled);
		}
	});
	const slider2dClassName = toClassName(
		css["slider-2d"],
		dragging && css["dragging"],
		classList
	);
	const handleClassName = toClassName(
		css["handle"],
		handleClassList,
	);
	return (
		<div ref={slider2dRef} className={slider2dClassName}
			{...listeners}
		>
			<div tabIndex={0} className={handleClassName} style={{
				"--left": `${val[0] * 100}%`,
				"--top": `${val[1] * 100}%`,
			}}></div>
		</div>
	);
}