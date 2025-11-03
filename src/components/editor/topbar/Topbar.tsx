import { FC } from "react";
import css from "./Topbar.module.css";
import { makeSingle } from "../../contextmenu/ContextMenu.ts";
import { useSkapMap } from "@editor/reducer.ts";
import { Translate } from "../../translate/Translate.tsx";
import { TopbarMenuItem } from "./TopbarMenuItem.tsx";
import {} from "../../../savefile/skap.ts";

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
				makeSingle("topbar.file.save", "download", () => {
					alert("Not implemented yet");
					console.log("Save map", map);
				}),
				makeSingle("topbar.file.export_skap", "file_export", () => {
					alert("Not implemented yet");
					console.log("Export map to skap", map);
				}),
			]}><Translate k="topbar.file" /></TopbarMenuItem>
		</menu>
	)
}