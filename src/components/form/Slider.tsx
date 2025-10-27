import { FC } from "react";

type SliderProps = {
	value: number;
	min: number;
	max: number;

	onChange?: (value: number) => void;
};

export const Slider: FC<SliderProps> = ({
	value,
	min, max,
	onChange,
}) => {
	return (
		<input
			type="range" value={value}
			min={min} max={max} step="any"
			onChange={e => {
				if (onChange) onChange(Number(e.target.value));
			}}
		/>
	);
}