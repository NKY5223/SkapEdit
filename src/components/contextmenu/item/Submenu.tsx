import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.ts";
import { classList } from "@components/utils.tsx";
import { AnchoredContextMenu } from "../AnchoredContextMenu.tsx";
import { Icon } from "@components/icon/Icon.tsx";

type ContextMenuSubmenuProps = {
	item: ContextMenu.Submenu;
};
export const ContextMenuSubmenu: FC<ContextMenuSubmenuProps> = ({
	item,
}) => {
	const { id, name, items } = item;
	// const dispatch = useCmenuReducer();
	// const openedId = useCmenuOpenedId();
	// const opened = openedId !== null && contains(item, openedId);

	// const open = () => {
	// 	dispatch({
	// 		type: "open_submenu",
	// 		target: id,
	// 	});
	// };
	// const readyOpen = () => {
	// 	dispatch({
	// 		type: "open_submenu",
	// 		target: id,
	// 	});
	// };
	// const readyClose = () => {
	// 	dispatch({
	// 		type: "close_submenu",
	// 		target: id,
	// 	});
	// };

	const className = classList(
		css["item"],
		css["submenu"],
		// opened && css["open"],
	);

	return (
		<li className={className}
			// onPointerEnter={readyOpen} onPointerLeave={opened ? readyClose : () => { }}
			// onClickCapture={open}
		>
			{name}
			<Icon icon="arrow_right" size={1} classList={[
				css["icon"]
			]} />
			{/* <pre style={{
				lineHeight: 2,
			}}>{id}</pre> */}
			<AnchoredContextMenu contextMenu={{
				type: "anchored",
				items,
			}} /* open={opened} */ dismissable={false} />
		</li>
	);
}