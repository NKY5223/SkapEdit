import { Dispatch, FC } from "react";
import { Bounds, BoundsClampBehavior } from "../../editor/bounds.ts";
import { toDispatchSetStateAction } from "@components/utils.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { boundsSetters } from "@hooks/useBounds.ts";
import { IconName } from "@components/icon/icons.ts";
import { useTranslate } from "@components/translate/translationArgs.ts";

type BoundsInputProps = {
	value: Bounds;
	onInput: Dispatch<Bounds>;
	clamp?: BoundsClampBehavior;

	leftTitle?: string;
	leftIcon?: IconName | null;
	topTitle?: string;
	topIcon?: IconName | null;
	rightTitle?: string;
	rightIcon?: IconName | null;
	bottomTitle?: string;
	bottomIcon?: IconName | null;
	widthTitle?: string;
	widthIcon?: IconName | null;
	heightTitle?: string;
	heightIcon?: IconName | null;
};

/** Despite the name, does not return an `<input />`; Returns `<><FormSection row>...</>`. */
export const BoundsInput: FC<BoundsInputProps> = ({
	value, onInput, clamp = "prefer-new",
	leftTitle, leftIcon = "position_left",
	topTitle, topIcon = "vertical_align_bottom",
	rightTitle, rightIcon = "position_right",
	bottomTitle, bottomIcon = "vertical_align_top",
	widthTitle, widthIcon = "width",
	heightTitle, heightIcon = "height",
}) => {
	const {
		setLeft, setTop, setRight, setBottom,
		setWidth, setHeight,
	} = boundsSetters(toDispatchSetStateAction(onInput, value), clamp);
	const translate = useTranslate();

	const {
		left, top, right, bottom,
		width, height
	} = value;
	return (<>
		<FormSection row>
			<NumberInput name="left" value={left} onInput={setLeft} label={
				leftIcon && <Icon icon={leftIcon} title={leftTitle ?? translate("generic.position.left")} />
			} />
			<NumberInput name="top" value={top} onInput={setTop} label={
				topIcon && <Icon icon={topIcon} title={topTitle ?? translate("generic.position.top")} />
			} />
		</FormSection>
		<FormSection row>
			<NumberInput name="right" value={right} onInput={setRight} label={
				rightIcon && <Icon icon={rightIcon} title={rightTitle ?? translate("generic.position.right")} />
			} />
			<NumberInput name="bottom" value={bottom} onInput={setBottom} label={
				bottomIcon && <Icon icon={bottomIcon} title={bottomTitle ?? translate("generic.position.bottom")} />
			} />
		</FormSection>
		<FormSection row>
			<NumberInput name="width" value={width} onInput={setWidth} min={0} label={
				widthIcon && <Icon icon={widthIcon} title={widthTitle ?? translate("generic.position.width")} />
			} />
			<NumberInput name="height" value={height} onInput={setHeight} min={0} label={
				heightIcon && <Icon icon={heightIcon} title={heightTitle ?? translate("generic.position.height")} />
			} />
		</FormSection>
	</>);
}