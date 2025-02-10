import { useState } from "react"
import { NumberInput } from "../form/Input.tsx";

export function Inspector() {
	const [test, setTest] = useState(0);
	return <div>
		<NumberInput value={test} onInput={n => {
			setTest(n);
		}} />
		<NumberInput value={test * 2} onInput={n => {
			setTest(n / 2);
		}} />
	</div>
}