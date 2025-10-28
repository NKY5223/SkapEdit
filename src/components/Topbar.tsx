import { FC } from "react";
import css from "./Topbar.module.css";
import { makeSingle } from "./contextmenu/ContextMenu.ts";
import { useSkapMap } from "@editor/map.ts";
import { Translate } from "./translate/Translate.tsx";
import { TopbarMenuItem } from "./TopbarMenuItem.tsx";

type TopbarProps = {

};
export const Topbar: FC<TopbarProps> = ({

}) => {
	const map = useSkapMap();
	return (
		<menu className={css["topbar"]}>
			<li className={css["topbar-icon"]}></li>
			<TopbarMenuItem items={[
				makeSingle("topbar.app.settings", "settings", () => {
					console.log("Open settings");
				}),
				makeSingle("topbar.app.changelog", "history_edu", () => {
					console.log("Open changelog");
				}),
			]}><Translate k="topbar.app" /></TopbarMenuItem>
			<TopbarMenuItem items={[
				makeSingle("topbar.file.save", "download", () => {
					console.log("Save map", map);
				}),
				makeSingle("topbar.file.export_skap", "file_export", () => {
					console.log("Export map to skap", map);
				}),
			]}><Translate k="topbar.file" /></TopbarMenuItem>
		</menu>
	)
}