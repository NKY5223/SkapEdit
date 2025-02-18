import { FC } from "react"
import { NumberInput } from "../form/NumberInput.tsx";
import { Button } from "../form/Button.tsx";
import { useBounds } from "../editor/Bounds.ts";
import { Icon } from "../icon/Icon.tsx";

type InspectorArgs = {};

export const Inspector: FC<InspectorArgs> = () => {
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
		<div style={{
			display: "flex",
			flexDirection: "column",
			width: "fit-content",
			rowGap: "1em",
		}}>
			<div style={{
				display: "grid",
				grid: `
					"left top"
					"right bottom"
					"width height"
				`,
				gap: `.5em`,
			}}>
				<NumberInput name="left" label={<Icon icon="position_left" title="Left" />} value={left} onInput={setLeft} />
				<NumberInput name="top" label={<Icon icon="position_top" title="Top" />} value={top} onInput={setTop} />
				<NumberInput name="right" label={<Icon icon="position_right" title="Right" />} value={right} onInput={setRight} />
				<NumberInput name="bottom" label={<Icon icon="position_bottom" title="Bottom" />} value={bottom} onInput={setBottom} />
				<NumberInput name="width" label={<Icon icon="size_width" title="Width" />} value={width} onInput={setWidth} min={0} />
				<NumberInput name="height" label={<Icon icon="size_height" title="Height" />} value={height} onInput={setHeight} min={0} />
			</div>
			<Button icon="reset" onClick={() => {
				setBounds({
					left: 0,
					top: 0,
					right: 10,
					bottom: 10,
				});
			}}>Reset</Button>
		</div>
	);
}