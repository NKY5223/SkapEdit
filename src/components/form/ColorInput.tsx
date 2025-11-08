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
import { NumberInput } from "./NumberInput.tsx";
import { DropdownSection } from "./dropdown/DropdownSection.tsx";
import { maybeConst } from "@common/maybeConst.ts";
import { DropdownSelect } from "./dropdown/DropdownSelect.tsx";
import { makeOption } from "./dropdown/Dropdown.ts";

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

	classList?: string[];
};
export const ColorInput: FC<ColorInputProps> = ({
	name, label, disabled, alpha,
	value,
	onInput, onChange,
	classList,
}) => {
	const popoverId = useId();

	type Mode = "hsv" | "rgb";
	const [mode, setMode] = useState<Mode>("hsv");

	const onToggle: React.ToggleEventHandler = (e) => {
		if (e.newState === "closed") {
			onChange?.(value);
		}
	}

	const className = toClassName(
		formCss["label"],
		css["color-input"],
		classList,
	);
	return (
		// not a <label> because we aren't using an <input>
		<div className={className} style={{
			"--colorinput-color": value.toCssString(),
		}}>
			{label}
			<button popoverTarget={popoverId} className={css["color-button"]}></button>
			<div id={popoverId} className={css["color-popover"]} popover="auto" onToggle={onToggle}>
				<DropdownSelect<Mode>
					initialValue={mode}
					onSelect={setMode}
					options={[
						makeOption("hsv", "hsv", "HSV"),
						makeOption("rgb", "rgb", "RGB"),
					]}
				/>
				<HsvInput value={value} onInput={onInput} />
			</div>
		</div>
	);
}

type HsvInputProps = {
	value: Color;
	onInput?: (color: Color) => void;
};
const HsvInput: FC<HsvInputProps> = ({
	value, onInput,
}) => {
	const [h, s, v, a] = value.hsva();

	const update = (h: number, s: number, v: number, a: number) => {
		onInput?.(Color.hsv(h, s, v, a));
	}

	const inputProps = {
		classList: [css["input"]],
		labelClassList: [css["label"]],
	};
	return (
		<div className={css["hsv"]} style={{
			// Required for degenerate case where s or v = 0
			"--colorinput-hue": `${h}deg`,
		}}>
			<Slider2d x={s} y={1 - v} step={0.001}
				classList={[css["square"], css["sv-square"]]}
				handleClassList={[css["handle"]]}
				onInput={([s, vInv]) => update(h, s, (1 - vInv), a)}
			/>
			<Slider value={h} min={0} max={360} step={1}
				classList={[css["slider"], css["h-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={h => update(h, s, v, a)}
			/>
			<Slider value={a} min={0} max={1} step={0.001}
				classList={[css["slider"], css["a-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={a => update(h, s, v, a)}
			/>
			<div className={css["inputs"]}>
				<NumberInput label="H" value={h} min={0} max={360} step={1}
					onInput={h => update(h, s, v, a)}
					{...inputProps} />
				<NumberInput label="S" value={s} min={0} max={1} step={0.001}
					onInput={s => update(h, s, v, a)}
					{...inputProps} />
				<NumberInput label="V" value={v} min={0} max={1} step={0.001}
					onInput={v => update(h, s, v, a)}
					{...inputProps} />
				<NumberInput label="A" value={a} min={0} max={1} step={0.001}
					onInput={a => update(h, s, v, a)}
					{...inputProps} />
			</div>
		</div>
	);
}