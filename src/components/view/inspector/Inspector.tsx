import { useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { useEditorSelection } from "@components/editor/selection.ts";
import { BoundsInput } from "@components/form/BoundsInput";
import { FormSection } from "@components/form/FormSection.tsx";
import { Layout, makeStatelessViewProvider } from "@components/layout/layout.ts";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { getProperties } from "@editor/object/Properties.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/reducer";
import { FC, ReactNode } from "react";
import css from "./Inspector.module.css";
import { Translate } from "@components/translate/Translate.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { ColorInput } from "@components/form/ColorInput.tsx";
import { SkapMap, SkapRoom } from "@editor/map.ts";
import { TextInput } from "@components/form/TextInput.tsx";
import { InputLabel } from "@components/form/InputLabel.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { DropdownSection } from "@components/form/dropdown/DropdownSection.tsx";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { Vec2Input } from "@components/form/Vec2Input.tsx";

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
				<MapForm />
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
				return (<RoomSelectionForm room={selectedRoom} />);
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


const RoomSelectionForm: FC<{ room: SkapRoom; }> = ({ room }) => {
	const dispatchMap = useDispatchSkapMap();
	const translate = useTranslate();

	const { id, name, bounds, obstacleColor, backgroundColor, } = room;
	const updateRoom = (f: (room: SkapRoom) => SkapRoom) => dispatchMap({
		type: "replace_room",
		target: id,
		replacement: f
	});
	return (
		<>
			<h2><Translate k="room" /></h2>
			<TextInput value={name}
				onInput={name => updateRoom(room => ({ ...room, name }))}
				label={<Translate k="generic.name" />}
			/>
			<FormTitle><Translate k="generic.position" /></FormTitle>
			<BoundsInput bounds={bounds} setBounds={bounds => updateRoom(room => ({ ...room, bounds }))} />
			<ColorInput value={obstacleColor} alpha
				onInput={obstacleColor => updateRoom(room => ({ ...room, obstacleColor }))}
				label={<Icon icon="obstacle" title={translate("inspector.room.obstacle_color")} />}
			/>
			<ColorInput value={backgroundColor}
				onInput={backgroundColor => updateRoom(room => ({ ...room, backgroundColor }))}
				label={<Icon icon="background_dot_large" title={translate("inspector.room.background_color")} />}
			/>
		</>
	);
}
const MapForm: FC = () => {
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();
	const translate = useTranslate();

	const { name, author, spawn: { room: spawnRoom, position: spawnPosition }, version, rooms } = map;
	const update = (f: (room: SkapMap) => SkapMap) => dispatchMap({
		type: "replace_map",
		replacement: f
	});
	return (
		<>
			<h2><Translate k="map" /></h2>
			<TextInput value={name}
				onInput={name => update(map => ({ ...map, name }))}
				label={<Translate k="generic.name" />}
			/>
			<TextInput value={author}
				onInput={author => update(map => ({ ...map, author }))}
				label={<Translate k="map.author" />}
				disabled={version > 0}
			/>
			<Translate k="map.version" version={version} />
			<FormTitle>Spawn</FormTitle>
			<DropdownSelect value={spawnRoom}
				options={rooms.values().map(room =>
					makeOption(room.id, room.id, room.name)
				).toArray()}
				onInput={room => (console.log(room), update(map => ({ ...map, spawn: { ...map.spawn, room } })))}
				fallbackLabel={<em>Invalid!</em>}
				label={<Translate k="room" />}
			/>
			<Vec2Input vec={spawnPosition}
				setVec={position => update(map => ({ ...map, spawn: { ...map.spawn, position } }))}
			/>
		</>
	);
}