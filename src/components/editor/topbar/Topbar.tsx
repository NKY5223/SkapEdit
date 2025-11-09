import { useToast } from "@components/toast/context.ts";
import { useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { FC } from "react";
import { SkapMapSchema } from "../../../savefile/skap.ts";
import { mapToSkap } from "../../../savefile/skapExport.ts";
import { makeSingle } from "../../contextmenu/ContextMenu.ts";
import { Translate } from "../../translate/Translate.tsx";
import css from "./Topbar.module.css";
import { TopbarMenuItem } from "./TopbarMenuItem.tsx";
import { saveFile } from "@common/save.ts";
import { openFile } from "@common/open.ts";
import { skapToMap } from "../../../savefile/skapImport.ts";
import { useDispatchSelection } from "../selection.ts";

type TopbarProps = {
	openChangelog: () => void;
	openSettings: () => void;
};
export const Topbar: FC<TopbarProps> = ({
	openChangelog,
	openSettings,
}) => {
	const toast = useToast();
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();
	const dispatchSelection = useDispatchSelection();
	return (
		<menu className={css["topbar"]}>
			<li className={css["topbar-icon"]}></li>
			<TopbarMenuItem items={[
				makeSingle("topbar.app.settings", "settings", () => {
					openSettings();
				}),
				makeSingle("topbar.app.changelog", "history_edu", () => {
					openChangelog();
				}),
				makeSingle("topbar.app.test_toast", "breakfast_dining", () => {
					toast.info(
						"aaaaaaaaaaaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
						5
					);
					toast.warn(
						"aaaaaaaaaaaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
						10
					);
					toast.error(
						"aaaaaaaaaaaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
						1
					);
				}),
			]}><Translate k="topbar.app" /></TopbarMenuItem>
			<TopbarMenuItem items={[
				makeSingle("topbar.file.save", "save", () => {
					alert("Not implemented yet");
					console.log("Save map", map);
				}),
				makeSingle("topbar.file.export_skap", "file_export", async () => {
					try {
						await saveFile("map.skap.json",
							() => new Blob([
								JSON.stringify(mapToSkap(map))
							], { type: "application/json" }),
							{
								id: "skapedit-export",
								types: [
									{ accept: { "application/json": [".json"] } }
								]
							}
						);
						toast.success(<>
							Exported map!
						</>, 10);
					} catch (err) {
						toast.error(<>
							Failed to export map.
						</>);
						console.log("Failed to export map:", err);
					}
				}),
				makeSingle("topbar.file.import_skap", "file_open", async () => {
					try {
						const [method, file] = await openFile(
							() => confirm("Are you sure? This will overwrite any unsaved progress."),
							{
								id: "skapedit-import",
								types: [
									{ accept: { "application/json": [".json"] } }
								]
							}
						);
						const text = await file.text();
						const json = JSON.parse(text);
						console.log("file raw json", json);
						const m = SkapMapSchema.parse(json);
						const map = skapToMap(m);

						toast.success(<>
							Successfully parsed map: {map.name} by {map.author}, version {map.version}.
						</>, 10)
						console.log("Imported map", method, map);

						dispatchMap({
							type: "replace_map",
							map,
						});
						dispatchSelection({ type: "clear_selection" });
					} catch (err) {
						toast.error(<>
							Failed to import map.
						</>);
						console.log("Failed to import map:", err);
					}
				}),
			]}><Translate k="topbar.file" /></TopbarMenuItem>
		</menu>
	)
}