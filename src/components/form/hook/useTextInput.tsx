import { useState } from "react";
import { TextInputProps, TextInput } from "../TextInput.tsx";


export function useTextInput(initialValue: string, props: Omit<TextInputProps, "value"> = {}) {
	const [value, setValue] = useState(initialValue);
	const actualProps: TextInputProps = {
		...props,
		value,
		onInput: setValue,
	};
	const input = <TextInput {...actualProps} />;

	return [value, input, setValue] as const;
}
