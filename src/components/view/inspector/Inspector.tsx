import { makeSection, makeSingle, makeSubmenu, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { useEditorSelection } from "@components/editor/selection.ts";
import { BoundsInput } from "@components/form/BoundsInput";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { TextInput } from "@components/form/TextInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input";
import { Icon } from "@components/icon/Icon.tsx";
import { Layout, makeStatelessViewProvider } from "@components/layout/layout.ts";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { getObject, getObjects, getObjectsWithRoom, useDispatchSkapMap, useSkapMap } from "@editor/reducer";
import { Fragment, ReactNode } from "react";
import css from "./Inspector.module.css";
import { ColorInput } from "@components/form/ColorInput.tsx";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { makeOption, makeOptionSection } from "@components/form/dropdown/Dropdown.ts";
import { convertGravityZoneDirection, SkapGravityZone } from "@editor/object/gravityZone.ts";
import { CardinalDirection } from "@editor/object/Base";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { CardinalDirectionInput } from "@components/form/CardinalDirectionInput.tsx";
import { CheckboxInput } from "@components/form/CheckboxInput.tsx";
import { SkapBlock } from "@editor/object/block.ts";
import { SkapTeleporter } from "@editor/object/teleporter.ts";
import { SkapRoom } from "@editor/map.ts";
import { getProperties } from "@editor/object/Properties.ts";

const Inspector: Layout.ViewComponent = ({
	viewSwitcher,
}) => {
	const selection = useEditorSelection();
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();
	const translate = useTranslate();

	const contextMenu = useContextMenu([
	]);

	const selectionForm = ((): Exclude<ReactNode, undefined> => {
		if (selection.length < 1) {
			return (
				<p>No object selected</p>
			);
		}
		if (selection.length > 1) {
			return (
				<p>Currently selected: {selection.length} items</p>
			);
		}
		const sel = selection[0];
		switch (sel.type) {
			case "room": {
				const selectedRoom = map.rooms.get(sel.id);
				if (!selectedRoom) return (
					<p>
						Could not find room selection, id: <code>{sel.id}</code>
					</p>
				);
				const bounds = selectedRoom.bounds;
				return (
					<>
						<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
							type: "replace_room",
							target: sel.id,
							replacement: room => ({ ...room, bounds })
						})} />
					</>
				);
			}
			case "object": {
				const object = getObject(map, sel.id);
				if (!object) return (
					<p>
						Could not find object selection, id: <code>{sel.id}</code>
					</p>
				);
				const { inspector: { Component } } = getProperties(object);
				return (
					<Component key={object.id} object={object} />
				);
				return (
					<pre>
						{JSON.stringify(object, null, "\t")}
					</pre>
				);
			}
		}

	})();

	return (
		<div className={css["inspector"]} {...contextMenu}>
			<ViewToolbar>
				{viewSwitcher}
			</ViewToolbar>
			<div className={css["inspector-content"]}>
				<FormSection>

					{selectionForm}
				</FormSection>
			</div>
		</div>
	);
};

export const InspectorVP: Layout.ViewProvider = makeStatelessViewProvider({
	name: "map.inspector",
	Component: Inspector,
	icon: "frame_inspect",
});
