import { FC, useState } from "react"
import { NumberInput } from "../form/Input.tsx";

type InspectorArgs = {};

export const Inspector: FC<InspectorArgs> = () => {
	const [test, setTest] = useState(0);
	return <div>
		<NumberInput value={test} onChange={n => {
			setTest(n);
		}} />
		<NumberInput value={test * 2} onChange={n => {
			setTest(n / 2);
		}} />
	</div>
}