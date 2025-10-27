import { Vec2 } from "@common/vec2.ts";
import { FormSection } from "@components/form/FormSection.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { toDispatchSetStateAction } from "@components/utils.tsx";
import { vec2Setters } from "@hooks/useVec2.ts";
import { Dispatch, FC } from "react";

type BoundsInputProps = {
	vec: Vec2;
	setVec: Dispatch<Vec2>;
};

/** Despite the name, does not return an `<input />`; Returns `<><FormSection row>...</>`. */
export const Vec2Input: FC<BoundsInputProps> = ({
	vec, setVec
}) => {
	const {
		setX, setY,
	} = vec2Setters(toDispatchSetStateAction(setVec, vec));

	const [x, y] = vec;
	return (<>
		<FormSection row>
			<NumberInput name="x" value={x} onInput={setX} label={
				<Icon icon="position_x" title="X" />
			} />
			<NumberInput name="y" value={y} onInput={setY} label={
				<Icon icon="position_y" title="Y" />
			} />
		</FormSection>
	</>);
}