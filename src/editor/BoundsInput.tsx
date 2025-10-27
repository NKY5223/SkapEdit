import { Dispatch, FC } from "react";
import { Bounds, BoundsClampBehavior } from "./bounds.ts";
import { toDispatchSetStateAction } from "@components/utils.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { boundsSetters } from "@hooks/useBounds.ts";

type BoundsInputProps = {
	bounds: Bounds;
	setBounds: Dispatch<Bounds>;
	clamp?: BoundsClampBehavior;
};

/** Despite the name, does not return an `<input />`; Returns `<><FormSection row>...</>`. */
export const BoundsInput: FC<BoundsInputProps> = ({
	bounds, setBounds, clamp = "prefer-new",
}) => {
	const {
		setLeft, setTop, setRight, setBottom,
		setWidth, setHeight,
	} = boundsSetters(toDispatchSetStateAction(setBounds, bounds), clamp);

	const {
		left, top, right, bottom,
		width, height
	} = bounds;
	return (<>
		<FormSection row>
			<NumberInput name="left" value={left} onInput={setLeft} label={
				<Icon icon="position_left" title="Left" />
			} />
			<NumberInput name="top" value={top} onInput={setTop} label={
				<Icon icon="vertical_align_bottom" title="Top" />
			} />
		</FormSection>
		<FormSection row>
			<NumberInput name="right" value={right} onInput={setRight} label={
				<Icon icon="position_right" title="Right" />
			} />
			<NumberInput name="bottom" value={bottom} onInput={setBottom} label={
				<Icon icon="vertical_align_top" title="Bottom" />
			} />
		</FormSection>
		<FormSection row>
			<NumberInput name="width" value={width} onInput={setWidth} min={0} label={
				<Icon icon="width" title="Width" />
			} />
			<NumberInput name="height" value={height} onInput={setHeight} min={0} label={
				<Icon icon="height" title="Height" />
			} />
		</FormSection>
	</>);
}