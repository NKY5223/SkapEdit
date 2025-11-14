import { Vec2 } from "@common/vec2.ts";
import { FormSection } from "@components/form/FormSection.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { IconName } from "@components/icon/icons.ts";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { toDispatchSetStateAction } from "@components/utils.tsx";
import { vec2Setters } from "@hooks/useVec2.ts";
import { Dispatch, FC } from "react";

type Vec2InputProps = {
	value: Vec2;
	onInput: Dispatch<Vec2>;

	xTitle?: string;
	xIcon?: IconName | null;
	yTitle?: string;
	yIcon?: IconName | null;
};

/** Despite the name, does not return an `<input />`; Returns `<><FormSection row>...</>`. */
export const Vec2Input: FC<Vec2InputProps> = ({
	value: vec, onInput: setVec,
	xTitle, xIcon = "position_x",
	yTitle, yIcon = "position_y",
}) => {
	const {
		setX, setY,
	} = vec2Setters(toDispatchSetStateAction(setVec, vec));
	const translate = useTranslate();

	const [x, y] = vec;
	return (<>
		<FormSection row>
			<NumberInput name="x" value={x} onInput={setX} label={
				xIcon && <Icon icon={xIcon} title={xTitle ?? translate("generic.position.x")} />
			} />
			<NumberInput name="y" value={y} onInput={setY} label={
				yIcon && <Icon icon={yIcon} title={yTitle ?? translate("generic.position.y")} />
			} />
		</FormSection>
	</>);
}