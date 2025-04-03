import { NumberInput } from "../../form/NumberInput.tsx";
import { Button } from "../../form/Button.tsx";
import { useBounds } from "../../editor/bounds.ts";
import { Icon } from "../../icon/Icon.tsx";
import { FormSection } from "../../form/FormSection.tsx";
import { ViewFC } from "../../layout/LayoutView.tsx";
import css from "./Inspector.module.css";

export const Inspector: ViewFC = ({
	children,
}) => {
	const [bounds, {
		setLeft, setTop, setRight, setBottom,
		setWidth, setHeight,
		setBounds,
	}] = useBounds({ left: 0, right: 0, top: 10, bottom: 10 });

	const {
		left, top, right, bottom,
		width, height
	} = bounds;

	return (
		<div className={css["inspector"]}>
			{children}
			<FormSection>
				<FormSection row>
					<NumberInput name="left" value={left} onInput={setLeft} label={
						<Icon icon="position_left" title="Left" />
					} />
					<NumberInput name="top" value={top} onInput={setTop} label={
						<Icon icon="position_top" title="Top" />
					} />
				</FormSection>
				<FormSection row>
					<NumberInput name="right" value={right} onInput={setRight} label={
						<Icon icon="position_right" title="Right" />
					} />
					<NumberInput name="bottom" value={bottom} onInput={setBottom} label={
						<Icon icon="position_bottom" title="Bottom" />
					} />
				</FormSection>
				<FormSection row>
					<NumberInput name="width" value={width} onInput={setWidth} min={0} label={
						<Icon icon="size_width" title="Width" />
					} />
					<NumberInput name="height" value={height} onInput={setHeight} min={0} label={
						<Icon icon="size_height" title="Height" />
					} />
				</FormSection>
				<Button icon="reset" onClick={() => {
					setBounds({
						left: 0,
						top: 0,
						right: 10,
						bottom: 10,
					});
				}}>Reset</Button>
			</FormSection>
		</div>
	);
}