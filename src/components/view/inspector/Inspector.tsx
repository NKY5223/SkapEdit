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
				// im going to refactor this one day trust
				switch (object.type) {
					case "obstacle":
					case "lava":
					case "slime":
					case "ice":
						{
							const { type, id, bounds } = object;
							return (
								<Fragment key={id}>
									<h2><Translate k={`object.${type}`} /></h2>
									<FormSection>
										<FormTitle><Translate k="generic.position" /></FormTitle>
										<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
											type: "replace_object",
											target: id,
											replacement: obj => ({ ...obj, bounds })
										})} />
									</FormSection>
								</Fragment>
							);
						}
					case "text": {
						const { type, id, text, pos } = object;
						return (
							<Fragment key={id}>
								<h2><Translate k={`object.${type}`} /></h2>
								<FormSection row>
									<TextInput value={text} label={<Icon icon="text_fields" title={translate("generic.text")} />}
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
							</Fragment>
						);
					}
					case "block": {
						const { type, id, bounds, color, solid, layer } = object;
						return (
							<Fragment key={id}>
								<h2><Translate k={`object.${type}`} /></h2>
								<FormSection>
									<FormTitle><Translate k="generic.position" /></FormTitle>
									<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
										type: "replace_object",
										target: id,
										replacement: obj => ({ ...obj, bounds })
									})} />
								</FormSection>
								<FormSection row>
									<ColorInput value={color}
										onInput={color => dispatchMap({
											type: "replace_object",
											target: id,
											replacement: obj => ({ ...obj, color })
										})}
										label={<Icon icon="colors" title="Color" />}
										alpha
									/>
								</FormSection>
								<FormSection row>
									<CheckboxInput value={solid}
										onInput={solid => dispatchMap({
											type: "replace_object",
											target: id,
											replacement: obj => ({ ...obj, solid })
										})}
										label={"Solid"}
									/>
								</FormSection>
								<FormSection row>
									<DropdownSelect<SkapBlock["layer"]> initialValue={layer}
										options={[
											makeOption("0", 0, "Back"),
											makeOption("1", 1, "Front"),
										]}
										onSelect={layer => dispatchMap({
											type: "replace_object",
											target: id,
											replacement: obj => ({ ...obj, layer })
										})}
									/>
								</FormSection>
							</Fragment>
						);
					}
					case "gravityZone": {
						const { type, id, bounds, direction } = object;
						return (
							<Fragment key={id}>
								<h2><Translate k={`object.${type}`} /></h2>
								<FormSection>
									<FormTitle><Translate k="generic.position" /></FormTitle>
									<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
										type: "replace_object",
										target: id,
										replacement: obj => ({ ...obj, bounds })
									})} />
									<FormTitle><Translate k="generic.direction" /></FormTitle>
									<FormSection row>
										<DropdownSelect<SkapGravityZone["direction"]["type"]> initialValue={direction.type}
											options={[
												makeOption("cardinal", "cardinal", <Translate k="generic.direction.cardinal" />),
												makeOption("free", "free", <Translate k="generic.direction.free" />),
											]}
											onSelect={type => dispatchMap({
												type: "replace_object",
												target: id,
												replacement: obj => (obj.type === "gravityZone" ? {
													...obj, direction:
														convertGravityZoneDirection(
															"direction" in obj
																? obj.direction
																: object.direction,
															type
														),
												} : obj)
											})}
										/>
										{object.direction.type === "cardinal"
											? (<CardinalDirectionInput value={object.direction.direction}
												onInput={dir => dispatchMap({
													type: "replace_object",
													target: id,
													replacement: obj => (obj.type === "gravityZone" ? {
														...obj, direction: {
															type: "cardinal",
															direction: dir,
														}
													} : obj)
												})}
											/>)
											: (<>
												<NumberInput value={object.direction.direction}
													label={<Icon icon="360" />}
													min={0} max={360} step={1}
													onInput={dir => dispatchMap({
														type: "replace_object",
														target: sel.id,
														replacement: obj => (obj.type === "gravityZone" ? {
															...obj, direction: {
																type: "free",
																direction: dir,
															}
														} : obj)
													})}
												/>°
											</>)}
									</FormSection>
								</FormSection>
							</Fragment>
						);
					}
					case "teleporter": {
						const { type, id, bounds, direction, target } = object;
						return (
							<Fragment key={id}>
								<h2><Translate k={`object.${type}`} /></h2>
								<FormSection>
									<FormTitle><Translate k="generic.position" /></FormTitle>
									<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
										type: "replace_object",
										target: id,
										replacement: obj => ({ ...obj, bounds })
									})} />
								</FormSection>
								<FormSection row>
									<CardinalDirectionInput value={direction}
										onInput={dir => dispatchMap({
											type: "replace_object",
											target: id,
											replacement: obj => (obj.type === "teleporter" ? {
												...obj, direction: dir,
											} : obj)
										})}
									/>
								</FormSection>
								{target === null
									? "null target"
									: target.type === "room"
										? "room target"
										: (<DropdownSelect initialValue={target.teleporterId}
											options={
												map.rooms.values().map(room => makeOptionSection(
													room.id, room.name, null,
													room.objects.values().filter(obj => obj.type === "teleporter")
														.map((tp) => makeOption(
															tp.id, tp.id,
															<Translate k="object.teleporter.name" object={tp} room={room} />
														)).toArray()
												)).toArray()
											}
											nowrap
										/>)}
							</Fragment>
						);
					}
				}
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
