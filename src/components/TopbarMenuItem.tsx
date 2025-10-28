import cmenuCss from "@components/contextmenu/ContextMenu.module.css";
import { FC, PropsWithChildren, useId } from "react";
import { AnchoredContextMenu } from "./contextmenu/AnchoredContextMenu.tsx";
import { ContextMenu } from "./contextmenu/ContextMenu.ts";
import css from "./Topbar.module.css";
import { toClassName } from "./utils.tsx";

type TopbarMenuItemProps = {
	items: readonly ContextMenu.Item[];
};
export const TopbarMenuItem: FC<PropsWithChildren<TopbarMenuItemProps>> = ({
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