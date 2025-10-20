import { FormSection } from "@components/form/FormSection.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { useDerivedBounds } from "../../../editor/bounds.ts";
import css from "./Inspector.module.css";
import { Layout } from "@components/layout/Layout.tsx";
import { useSelection } from "@components/editor/selection.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/map.ts";
import { Button } from "@components/form/Button.tsx";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { Option, OptionSection } from "@components/form/dropdown/Dropdown.ts";
import { useContextMenu } from "@components/contextmenu/reducer.ts";
import { section, single, submenu } from "@components/contextmenu/ContextMenu.ts";

const testOptions: (Option<number> | OptionSection<number>)[] = [
	{
		name: "integer",
		label: "Integers",
		options: [
			{
				name: "zero",
				value: 0,
				label: "0",
				icon: "counter_0",
			},
			{
				name: "one",
				value: 1,
				label: "ONE",
				// icon: "counter_1",
			},
			{
				name: "two",
				value: 2,
				label: "twooooooooooooooooooooooooooo ooooooooooooooooooooooooooooo oooooooo",
				icon: "counter_2",
			},
			{
				name: "three",
				value: 3,
				label: "三",
				icon: "counter_3",
			},
			{
				name: "three.1",
				value: 3,
				label: "三",
				icon: "counter_3",
			},
			{
				name: "three.2",
				value: 3,
				label: "三",
				icon: "counter_3",
			},
			{
				name: "three.3",
				value: 3,
				label: "三",
				icon: "counter_3",
			},
		]
	},
	{
		name: "integer2",
		label: "Integers 2",
		icon: "numbers",
		options: [
			{
				name: "zero",
				value: 0,
				label: "0",
			},
			{
				name: "one",
				value: 1,
				label: "ONE",
			},
			{
				name: "two",
				value: 2,
				label: "twooo",
			},
			{
				name: "three",
				value: 3,
				label: "三",
			},
		]
	},
	{
		name: "pi",
		value: Math.PI,
		label: "π",
		icon: "circle",
	},
	{
		name: "e",
		value: Math.E,
		label: "e",
	},
	{
		name: "sqrt2",
		value: Math.SQRT2,
		label: "√2",
		icon: "diagonal_line",
	},
	{
		name: "masceroni",
		value: 0.558,
		label: "γ",
		icon: "language_pinyin"
	}
];

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

	const handleContextMenuCapture = useContextMenu([
		submenu("test", null, [
			section({ name: "inspector.test", icon: null }, [
				single("inspector.test.0", "hd"),
				single("inspector.test.1", "2k"),
				single("inspector.test.2", "4k"),
				single("inspector.test.3", "8k"),
				single("inspector.test.4", "10k"),
			]),
			single("inspector.test.error", "error", () => { throw new Error("uwu") })
		]),
	]);

	switch (selectedObject.type) {
		case "obstacle":
		case "lava": {
			const [bounds, {
				setLeft, setTop, setRight, setBottom,
				setWidth, setHeight,
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
				<div className={css["inspector"]} onContextMenuCapture={handleContextMenuCapture}>
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
							<Button icon="html">uwu</Button>
							<DropdownSelect nowrap initialValue={0} options={testOptions} />
						</FormSection>
					</div>
				</div>
			);
		}
	}
}