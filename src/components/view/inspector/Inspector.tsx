import { makeSection, makeSingle, makeSubmenu, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { useEditorSelection } from "@components/editor/selection.ts";
import { FormSection } from "@components/form/FormSection.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Layout } from "@components/layout/layout.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/map.ts";
import css from "./Inspector.module.css";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { ReactNode } from "react";
import { TextInput } from "@components/form/TextInput.tsx";
import { BoundsInput } from "@editor/BoundsInput.tsx";
import { Vec2Input } from "@editor/Vec2Input.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { useTranslation } from "@components/translate/translationArgs.ts";
import { currentBuild } from "@common/currentBuild.ts";

export const Inspector: Layout.ViewComponent = ({
	viewSwitch,
}) => {
	const selection = useEditorSelection();
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();
	const translate = useTranslation();

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
					<p>
						<code>{currentBuild.mode}{currentBuild.github && <>
							{` `}
							<a href={currentBuild.github.commitUrl} target="_blank">{currentBuild.github.commitSha.slice(0, 7)}</a>
							{` @ `}
							<a href={currentBuild.github.repoUrl} target="_blank">{currentBuild.github.repoName}</a>
						</>}</code>
					</p>
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