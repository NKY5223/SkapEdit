import { useState } from "react";
import { NumberInputProps, NumberInput } from "../NumberInput.tsx";


export function useNumberInput(initialValue: number, props: Omit<NumberInputProps, "value"> = {}) {
	const [value, setValue] = useState(initialValue);
	const actualProps: NumberInputProps = {
		...props,
		value,
		onInput: setValue,
	};
	const input = <NumberInput {...actualProps} />;

	return [value, input, setValue] as const;
}
