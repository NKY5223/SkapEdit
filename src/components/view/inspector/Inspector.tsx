import { makeSection, makeSingle, makeSubmenu, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { useEditorSelection } from "@components/editor/selection.ts";
import { BoundsInput } from "@components/form/BoundsInput";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { TextInput } from "@components/form/TextInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input";
import { Icon } from "@components/icon/Icon.tsx";
import { Layout } from "@components/layout/layout.ts";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/reducer";
import { ReactNode } from "react";
import css from "./Inspector.module.css";

export const Inspector: Layout.ViewComponent = ({
	viewSwitch,
}) => {
	const selection = useEditorSelection();
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();
	const translate = useTranslate();

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
		makeSubmenu("test2", "zoom_in", [
			makeSection({ name: "inspector.test2", icon: null }, [
				makeSingle("inspector.test2.0", "hd"),
				makeSingle("inspector.test2.1", "2k"),
				makeSingle("inspector.test2.2", "4k"),
				makeSingle("inspector.test2.3", "8k"),
				makeSingle("inspector.test2.4", "10k"),
			]),
			makeSingle("inspector.test2.error", "error", () => { throw new Error("uwu") })
		]),
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
				const selectedObject = getObject(map, sel.id);
				if (!selectedObject) return (
					<p>
						Could not find object selection, id: <code>{sel.id}</code>
					</p>
				);
				switch (selectedObject.type) {
					case "obstacle":
					case "lava":
					case "slime":
					case "ice":
						{
							const bounds = selectedObject.bounds;
							return (
								<>
									<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
										type: "replace_object",
										target: sel.id,
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
						<code style={{ fontSize: ".75em" }}>
							<Translate k="generic.list_string" strings={selection.map((item) => item.id)} />
						</code>
					</span>
					{selectionForm}
				</FormSection>
			</div>
		</div>
	);
}