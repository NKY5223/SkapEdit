import { makeSection, makeSingle, makeSubmenu, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { useEditorSelection } from "@components/editor/selection.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Layout, useLayoutTree } from "@components/layout/layout.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/map.ts";
import css from "./Inspector.module.css";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { ReactNode } from "react";
import { TextInput } from "@components/form/TextInput.tsx";
import { BoundsInput } from "@editor/BoundsInput.tsx";
import { Vec2Input } from "@editor/Vec2Input.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";

type Opts = Parameters<typeof DropdownSelect<number>>[0]["options"];

const testOptions: Opts = [
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
	const layout = useLayoutTree();
	const selection = useEditorSelection();
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();

	const contextMenu = useContextMenu([
		makeSubmenu("test", "zoom_in", [
			makeSection({ name: "inspector.test", icon: null }, [
				makeSingle("inspector.test.0", "hd"),
				makeSingle("inspector.test.1", "2k"),
				makeSingle("inspector.test.2", "4k"),
				makeSingle("inspector.test.3", "8k"),
				makeSingle("inspector.test.4", "10k"),
			]),
			makeSingle("inspector.test.error", "error", () => { throw new Error("uwu") })
		]),
	]);

	const selectedRoom = selection && selection.type === "room" && map.rooms.get(selection.id);
	const selectedObject = selection && selection.type === "object" && getObject(map, selection.id);
	const selectionForm = ((): Exclude<ReactNode, undefined> => {
		if (!selection) return (
			<p>
				No object selected
			</p>
		);
		switch (selection.type) {
			case "room": {
				if (!selectedRoom) return (
					<p>
						Could not find room selection, id: <code>{selection.id}</code>
					</p>
				);
				const bounds = selectedRoom.bounds;
				return (
					<>
						<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
							type: "replace_object",
							target: selection.id,
							replacement: obj => ({ ...obj, bounds })
						})} />
					</>
				);
			}
			case "object": {
				if (!selectedObject) return (
					<p>
						Could not find object selection, id: <code>{selection.id}</code>
					</p>
				);
				switch (selectedObject.type) {
					case "obstacle":
					case "lava": {
						const bounds = selectedObject.bounds;
						return (
							<>
								<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
									type: "replace_object",
									target: selection.id,
									replacement: obj => ({ ...obj, bounds })
								})} />
							</>
						);
					}
					case "text": {
						const { id, text, pos } = selectedObject;
						return (
							<>
								<FormSection row>
									<TextInput value={text} label={<Icon icon="text_fields" title="Text" />}
										onInput={text => dispatchMap({
											type: "replace_object",
											target: id,
											replacement: obj => ({
												...obj,
												text,
											}),
										})} />
								</FormSection>
								<Vec2Input vec={pos} setVec={pos => dispatchMap({
									type: "replace_object",
									target: id,
									replacement: obj => ({
										...obj,
										pos,
									}),
								})} />
							</>
						);
					}
				}
			}
		}
	})();

	return (
		<div className={css["inspector"]} {...contextMenu}>
			<ViewToolbar>
				{viewSwitch}
			</ViewToolbar>
			<div className={css["inspector-content"]}>
				<FormSection>
					<FormTitle>Selection</FormTitle>
					<span>
						<Icon icon="select" title="Current Selection" />
						&nbsp;
						{selectedObject
							? (<code>{selectedObject.type} {selection.id}</code>)
							: selectedRoom
								? (<code>{selection.id}</code>)
								: (<code>(none)</code>)}
					</span>
					{selectionForm}
				</FormSection>
			</div>
		</div>
	);
}