import { useToast } from "@components/toast/context.ts";
import { useSkapMap } from "@editor/reducer.ts";
import { FC } from "react";
import { } from "../../../savefile/skap.ts";
import { mapToSkap } from "../../../savefile/skapExport.ts";
import { makeSingle } from "../../contextmenu/ContextMenu.ts";
import { Translate } from "../../translate/Translate.tsx";
import css from "./Topbar.module.css";
import { TopbarMenuItem } from "./TopbarMenuItem.tsx";
import { save } from "@common/save.ts";

type TopbarProps = {
	openChangelog: () => void;
};
export const Topbar: FC<TopbarProps> = ({
	openChangelog,
}) => {
	const map = useSkapMap();
	const toast = useToast();
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
				makeSingle("topbar.app.test_toast", "breakfast_dining", () => {
					toast.info("a");
					toast.error("b");
					toast.warn("c");
					toast.success("d");
					toast.info("aaaaaaaaaaa");
					toast.error("bbbbbbbbbbb");
					toast.warn("ccccccccccc");
					toast.success("ddddddddddd");
					toast.info("aaaaaaaaaaaeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
					toast.error("bbbbbbbbbbbeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
					toast.warn("ccccccccccceeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
					toast.success("dddddddddddeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
				}),
			]}><Translate k="topbar.app" /></TopbarMenuItem>
			<TopbarMenuItem items={[
				makeSingle("topbar.file.save", "save", () => {
					alert("Not implemented yet");
					console.log("Save map", map);
				}),
				makeSingle("topbar.file.export_skap", "file_export", () => {
					save("map.skap.json",
						() => new Blob([
							JSON.stringify(mapToSkap(map))
						], { type: "application/json" }),
						{
							id: "skapedit-export",
							types: [
								{ accept: { "application/json": [".json"] } }
							]
						}
					).then(method => {
						toast.success(<>
							Exported map!
						</>);
					}).catch(err => {
						if (err instanceof Error) {
							toast.error(<>
								Failed to export map: <br />
								{err.message}
							</>);
						}
						console.log("Failed to export map:", err);
					});
				}),
			]}><Translate k="topbar.file" /></TopbarMenuItem>
		</menu>
	)
}