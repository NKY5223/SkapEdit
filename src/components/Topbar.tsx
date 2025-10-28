import cmenuCss from "@components/contextmenu/ContextMenu.module.css";
import { FC, PropsWithChildren, useId } from "react";
import css from "./Topbar.module.css";
import { AnchoredContextMenu } from "./contextmenu/AnchoredContextMenu.tsx";
import { ContextMenu, makeSingle } from "./contextmenu/ContextMenu.ts";
import { toClassName } from "./utils.tsx";
import { useSkapMap } from "@editor/map.ts";
import { Translate } from "./translate/Translate.tsx";

type TopbarProps = {

};
export const Topbar: FC<TopbarProps> = ({

}) => {
	const map = useSkapMap();
	return (
		<menu className={css["topbar"]}>
			<li className={css["topbar-icon"]}></li>
			<TopbarItem items={[
				makeSingle("topbar.file.save", "download", () => {
					console.log("Save map", map);
				}),
				makeSingle("topbar.file.export_skap", "file_export", () => {
					console.log("Export map to skap", map);
				}),
			]}><Translate k="topbar.file" /></TopbarItem>
		</menu>
	)
}

type TopbarItemProps = {
	items: readonly ContextMenu.Item[];
};
const TopbarItem: FC<PropsWithChildren<TopbarItemProps>> = ({
	items,
	children
}) => {
	const id = useId();
	const className = toClassName(
		css["topbar-item"],
		cmenuCss["anchor-bottom"],
	);
	return (
		<li className={className}>
			<button popoverTarget={id} className={css["topbar-item-button"]}>
				{children}
			</button>
			<AnchoredContextMenu id={id} items={items} />
		</li>
	);
}