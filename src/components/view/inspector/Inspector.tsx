import { makeSection, makeSingle, makeSubmenu, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { useEditorSelection } from "@components/editor/selection.ts";
import { FormSection } from "@components/form/FormSection.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Layout } from "@components/layout/layout.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/reducer";
import css from "./Inspector.module.css";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { ReactNode } from "react";
import { TextInput } from "@components/form/TextInput.tsx";
import { BoundsInput } from "@components/form/BoundsInput";
import { Vec2Input } from "@components/form/Vec2Input";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { currentBuild } from "@common/currentBuild.ts";

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

	const sel = selection[0];
	const selectedRoom = sel && sel.type === "room" && map.rooms.get(sel.id);
	const selectedObject = sel && sel.type === "object" && getObject(map, sel.id);
	const selectionForm = ((): Exclude<ReactNode, undefined> => {
		if (!sel) return (
			<p>
				No object selected
			</p>
		);
		switch (sel.type) {
			case "room": {
				if (!selectedRoom) return (
					<p>
						Could not find room selection, id: <code>{sel.id}</code>
					</p>
				);
				const bounds = selectedRoom.bounds;
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
			case "object": {
				if (!selectedObject) return (
					<p>
						Could not find object selection, id: <code>{sel.id}</code>
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
						{selectedObject
							? (<code>{selectedObject.type} {sel.id}</code>)
							: selectedRoom
								? (<code>{sel.id}</code>)
								: (<code>(none)</code>)}
					</span>
					{selectionForm}
					<p>
						<code>{currentBuild.version} {currentBuild.mode}{currentBuild.github && <>
							{` `}
							<a href={currentBuild.github.commitUrl} target="_blank">{currentBuild.github.commitSha.slice(0, 7)}</a>
							{` @ `}
							<a href={currentBuild.github.repoUrl} target="_blank">{currentBuild.github.repoName}</a>
						</>}</code>
					</p>
				</FormSection>
			</div>
		</div>
	);
}