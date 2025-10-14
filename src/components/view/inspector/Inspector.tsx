import { FormSection } from "@components/form/FormSection.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { useDerivedBounds } from "../../../editor/bounds.ts";
import css from "./Inspector.module.css";
import { Layout } from "@components/layout/Layout.tsx";
import { useSelection } from "@components/editor/selection.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/map.ts";

export const Inspector: Layout.ViewComponent = ({
	viewSwitch,
}) => {
	const selectedID = useSelection();
	if (!selectedID) return (
		<div className={css["inspector"]}>
			{viewSwitch}
			No object selected
		</div>
	);
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();

	const selectedObject = getObject(map, selectedID);
	if (!selectedObject) return (
		<div className={css["inspector"]}>
			{viewSwitch}
			Could not find selected object, id: <code>{selectedID}</code>
		</div>
	);

	switch (selectedObject.type) {
		case "obstacle":
		case "lava": {
			const [bounds, {
				setLeft, setTop, setRight, setBottom,
				setWidth, setHeight,
				// setBounds,
			}] = useDerivedBounds(selectedObject.bounds, action => {
				if (typeof action === "function") action = action(selectedObject.bounds);
				dispatchMap({
					type: "replace_object",
					targetObject: selectedID,
					replacement: obj => ({ ...obj, bounds: action })
				});
			}, true);

			const {
				left, top, right, bottom,
				width, height
			} = bounds;

			return (
				<div className={css["inspector"]}>
					{viewSwitch}
					<div className={css["inspector-content"]}>
						<span><Icon icon="select" title="Selection" /> <code>{selectedID}</code></span>
						<FormSection>
							<FormSection row>
								<NumberInput name="left" value={left} onInput={setLeft} label={
									<Icon icon="keyboard_tab" title="Left" />
								} />
								<NumberInput name="top" value={top} onInput={setTop} label={
									<Icon icon="vertical_align_bottom" title="Top" />
								} />
							</FormSection>
							<FormSection row>
								<NumberInput name="right" value={right} onInput={setRight} label={
									<Icon icon="keyboard_tab_rtl" title="Right" />
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
						</FormSection>
					</div>
				</div>
			);
		}
	}

}