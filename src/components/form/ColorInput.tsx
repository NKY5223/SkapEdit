import { FC, ReactNode, useId, useRef, useState } from "react";
import formCss from "./form.module.css";
import { Color } from "@common/color.ts";
import { InputLabel } from "./InputLabel.tsx";
import { toClassName } from "@components/utils.tsx";
import css from "./ColorInput.module.css";
import { Slider } from "./Slider.tsx";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { Vector } from "@common/vector.ts";
import { Vec2 } from "@common/vec2.ts";
import { Slider2d } from "./Slider2D.tsx";

type ColorInputProps = {
	name?: string;
	/** *Content* of the label associated with this input */
	label?: ReactNode;
	disabled?: boolean;
	/** Whether this input should support alpha input. Defaults to false. */
	alpha?: boolean;

	value: Color;

	/** Fires whenever the value is edited */
	onInput?: (value: Color) => void;
	/** Fires when the value is committed (blur) */
	onChange?: (value: Color) => void;

	// classList?: string[];
};
export const ColorInput: FC<ColorInputProps> = ({
	name, label, disabled, alpha,
	value,
	onInput, onChange,
	// classList,
}) => {
	const popoverId = useId();

	const className = toClassName(
		formCss["label"],
		css["color-input"],
	);
	return (
		// not a <label> because we aren't using an <input>
		<div className={className} style={{
			"--colorinput-color": value.toCssString(),
		}}>
			{label}
			<button popoverTarget={popoverId} className={css["color-button"]}></button>
			<div id={popoverId} className={css["color-popover"]} popover="auto">
				<HsvInput initialColor={value} onInput={color => {
					onInput?.(color)
				}} />
			</div>
		</div>
	);
}

type HsvInputProps = {
	initialColor: Color;
	onInput: (color: Color) => void;
};
const HsvInput: FC<HsvInputProps> = ({
	initialColor, onInput,
}) => {
	const [hsva, setHsva] = useState(initialColor.hsva());
	const [h, s, v, a] = hsva;
	return (
		<div className={css["hsv"]} style={{
			// Required for degenerate case where s or v = 0
			"--colorinput-hue": `${h}deg`,
		}}>
			<Slider2d
				x={s} y={1 - v}
				classList={[css["square"], css["sv-square"]]}
				handleClassList={[css["handle"]]}
				onInput={([newS, newVInv]) => {
					const s = newS;
					const v = 1 - newVInv;
					setHsva(new Vector(h, s, v, a));
					onInput(Color.hsv(h, s, v, a));
				}}
			/>
			<Slider value={h} min={0} max={360}
				classList={[css["slider"], css["h-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={newH => {
					const h = newH;
					setHsva(new Vector(h, s, v, a));
					onInput(Color.hsv(h, s, v, a));
				}}
			/>
			<Slider value={a} min={0} max={1}
				classList={[css["slider"], css["a-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={newA => {
					const a = newA;
					setHsva(new Vector(h, s, v, a));
					onInput(Color.hsv(h, s, v, a));
				}}
			/>
		</div>
	);
}