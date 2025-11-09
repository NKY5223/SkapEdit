import { Color } from "@common/color.ts";
import { Icon } from "@components/icon/Icon.tsx";
import { toClassName } from "@components/utils.tsx";
import { FC, ReactNode, useId, useState } from "react";
import css from "./ColorInput.module.css";
import { makeOption } from "./dropdown/Dropdown.ts";
import { DropdownSelect } from "./dropdown/DropdownSelect.tsx";
import formCss from "./form.module.css";
import { NumberInput } from "./NumberInput.tsx";
import { Slider } from "./Slider.tsx";
import { Slider2d } from "./Slider2d.tsx";
import { TextInput } from "./TextInput.tsx";

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

	classList?: string | string[];
};
export const ColorInput: FC<ColorInputProps> = ({
	name, label, disabled = false, alpha = false,
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

	const inputProps = { value, onInput, alpha };

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
			<button popoverTarget={popoverId} name={name} className={css["color-button"]}></button>
			<div id={popoverId} className={css["color-popover"]} popover="auto" onToggle={onToggle}>
				<DropdownSelect<Mode>
					initialValue={mode}
					onSelect={setMode}
					options={[
						makeOption("hsv", "hsv", "HSV"),
						makeOption("rgb", "rgb", "RGB"),
					]}
				/>
				{mode === "hsv" ? <HsvInput {...inputProps} /> :
					mode === "rgb" ? <RgbInput {...inputProps} /> : mode}
			</div>
		</div>
	);
}

type SpecificInputProps = {
	value: Color;
	onInput?: (color: Color) => void;
	alpha: boolean;
};

const HsvInput: FC<SpecificInputProps> = ({
	value, onInput, alpha,
}) => {
	const [h, s, v, a] = value.hsva();

	const update = (h: number, s: number, v: number, a: number) => {
		onInput?.(Color.hsv(h, s, v, a));
	}

	const inputProps = {
		classList: [css["input"]],
		labelClassList: [css["label"]],
	};
	const step = 0.01;
	const unitRange = {
		min: 0,
		max: 1,
		step,
		places: 3,
	};
	return (
		<div className={css["hsv"]} style={{
			// Required for degenerate case where s or v = 0
			"--colorinput-hue": `${h}deg`,
		}}>
			<Slider2d x={s} y={1 - v} step={step}
				classList={[css["square"], css["sv-square"]]}
				handleClassList={[css["handle"]]}
				onInput={([s, vInv]) => update(h, s, (1 - vInv), a)}
			/>
			{/* Slider snaps back to 0 at 360 because Color.hsv mods h by 360 */}
			{/* Keep max at 360 for technically correctness?? Values > 359 should be representable */}
			<Slider value={h} min={0} max={360} step={1}
				classList={[css["slider"], css["h-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={h => update(h, s, v, a)}
			/>
			{alpha && <Slider value={a}
				classList={[css["slider"], css["a-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={a => update(h, s, v, a)}
				{...unitRange}
			/>}
			<div className={css["inputs"]}>
				<NumberInput label="H" value={h}
					min={0} max={360} step={1} places={0}
					onInput={h => update(h, s, v, a)}
					{...inputProps}
				/>
				<NumberInput label="S" value={s}
					onInput={s => update(h, s, v, a)}
					{...inputProps}
					{...unitRange}
				/>
				<NumberInput label="V" value={v}
					onInput={v => update(h, s, v, a)}
					{...inputProps}
					{...unitRange}
				/>
				{alpha && <NumberInput label="A" value={a}
					onInput={a => update(h, s, v, a)}
					{...inputProps}
					{...unitRange}
				/>}
			</div>
		</div>
	);
}

const RgbInput: FC<SpecificInputProps> = ({
	value, onInput, alpha,
}) => {
	const [r, g, b, a] = value.rgba255();

	const update = (r: number, g: number, b: number, a: number) => {
		onInput?.(Color.rgb255(r, g, b, a));
	}

	const inputProps = {
		classList: [css["input"]],
		labelClassList: [css["label"]],
	};
	
	const hexRange = {
		min: 0,
		max: 255,
		step: 1,
		places: 0,
	};
	const unitRange = {
		min: 0,
		max: 1,
		step: 0.01,
		places: 2,
	};
	return (
		<div className={css["rgb"]}>
			<Slider value={r}
				classList={[css["slider"], css["r-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={r => update(r, g, b, a)}
				{...hexRange}
			/>
			<Slider value={g}
				classList={[css["slider"], css["g-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={g => update(r, g, b, a)}
				{...hexRange}
			/>
			<Slider value={b}
				classList={[css["slider"], css["b-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={b => update(r, g, b, a)}
				{...hexRange}
			/>
			{alpha && <Slider value={a}
				classList={[css["slider"], css["a-slider"]]}
				handleClassList={[css["handle"]]}
				onInput={a => update(r, g, b, a)}
				{...unitRange}
			/>}
			<div className={css["inputs"]}>
				<NumberInput label="R" value={r}
					onInput={r => update(r, g, b, a)}
					{...inputProps}
					{...hexRange}
				/>
				<NumberInput label="G" value={g}
					onInput={g => update(r, g, b, a)}
					{...inputProps}
					{...hexRange}
				/>
				<NumberInput label="B" value={b}
					onInput={b => update(r, g, b, a)}
					{...inputProps}
					{...hexRange}
				/>
				{alpha && <NumberInput label="A" value={a}
					onInput={a => update(r, g, b, a)}
					{...inputProps}
					{...unitRange}
				/>}
			</div>
			<TextInput
				value={alpha ? value.toHexString() : value.toHexStringNoAlpha()}
				onInput={value => {
					const match = value.match(/^#(?<r>\p{Hex_Digit}{2})(?<g>\p{Hex_Digit}{2})(?<b>\p{Hex_Digit}{2})$/u);
					if (!match) return;
					if (!match.groups) return;
					const { r, g, b } = match.groups;
					update(
						parseInt(r, 16),
						parseInt(g, 16),
						parseInt(b, 16),
						1,
					);
				}}
				inputClassList={css["hex-input"]}
			/>
		</div>
	);
}