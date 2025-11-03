import { FC } from "react";
import css from "./Topbar.module.css";
import { makeSingle } from "../../contextmenu/ContextMenu.ts";
import { useSkapMap } from "@editor/reducer.ts";
import { Translate } from "../../translate/Translate.tsx";
import { TopbarMenuItem } from "./TopbarMenuItem.tsx";
import { } from "../../../savefile/skap.ts";
import { mapToSkapJson } from "../../../savefile/skapExport.ts";

declare global {
	interface Window {
		/** experimental file system access api */
		showSaveFilePicker?: (options?: {
			/** 
			 * A boolean value that defaults to false. 
			 * By default, the picker should include an option to not apply any file type filters 
			 * (instigated with the type option below). Setting this option to true means
			 * that option is not available.
			 */
			excludeAcceptAllOption?: boolean;
			/** 
			 * By specifying an ID, the browser can remember different directories for different IDs. 
			 * If the same ID is used for another picker, the picker opens in the same directory.
			 */
			id?: string;
			/** 
			 * A FileSystemHandle or a well known directory 
			 * ("desktop", "documents", "downloads", "music", "pictures", or "videos") 
			 * to open the dialog in. */
			startIn?: FileSystemHandle
			| "desktop"
			| "documents"
			| "downloads"
			| "music"
			| "pictures"
			| "videos";
			/** The suggested file name. */
			suggestedName?: string;
			/** An array of allowed file types to save. */
			types?: {
				/** An optional description of the category of files types allowed. Default to be an empty string. */
				description?: string;
				/** An Object with the keys set to the MIME type and the values an Array of file extensions. */
				accept: Record<string, string[]>;
			}[];
		}) => Promise<FileSystemFileHandle>;
	}
}
type TopbarProps = {
	openChangelog: () => void;
};
export const Topbar: FC<TopbarProps> = ({
	openChangelog,
}) => {
	const map = useSkapMap();
	return (
		<menu className={css["topbar"]}>
			<li className={css["topbar-icon"]}></li>
			<TopbarMenuItem items={[
				makeSingle("topbar.app.settings", "settings", () => {
					alert("Not implemented yet");
					console.log("Open settings");
				}),
				makeSingle("topbar.app.changelog", "history_edu", () => {
					openChangelog();
				}),
			]}><Translate k="topbar.app" /></TopbarMenuItem>
			<TopbarMenuItem items={[
				makeSingle("topbar.file.save", "save", () => {
					alert("Not implemented yet");
					console.log("Save map", map);
				}),
				makeSingle("topbar.file.export_skap", "file_export", async () => {
					const json = mapToSkapJson(map);
					const blob = new Blob([json], { type: "application/json" });

					if (window.showSaveFilePicker) {
						const handle = await window.showSaveFilePicker({
							id: "skapedit-export",
							suggestedName: `map.skap.json`,
							types: [
								{ accept: { "application/json": [".json"] } }
							]
						});
						const writable = await handle.createWritable();
						await writable.write(blob);
						await writable.close();
						console.log("Written to and closed file", handle.name, "content:", json);
					} else {
						// Fallback to <a download> clicking
						const url = URL.createObjectURL(blob);

						const anchor = document.createElement("a");
						anchor.href = url;
						anchor.download = "map.skap.json";
						anchor.style = `display: none;`;
						document.body.append(anchor);
						anchor.click();

						URL.revokeObjectURL(url);
					}
				}),
			]}><Translate k="topbar.file" /></TopbarMenuItem>
		</menu>
	)
}