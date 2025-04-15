import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.tsx";
import { classList } from "@components/utils.tsx";
import { AnchoredContextMenu } from "../AnchoredContextMenu.tsx";
import { contains, useCmenuOpenedId, useCmenuReducer } from "../context.tsx";
import { Icon } from "@components/icon/Icon.tsx";

type ContextMenuSubmenuProps = {
	item: ContextMenu.Submenu;
};
export const ContextMenuSubmenu: FC<ContextMenuSubmenuProps> = ({
	item,
}) => {
	const { id, display, items } = item;
	const dispatch = useCmenuReducer();
	const openedId = useCmenuOpenedId();
	const opened = openedId !== null && contains(item, openedId);

	const open = () => {
		dispatch({
			type: "open_submenu",
			target: id,
		});
	};
	const readyOpen = () => {
		dispatch({
			type: "open_submenu",
			target: id,
		});
	};
	const readyClose = () => {
		dispatch({
			type: "close_submenu",
			target: id,
		});
	};

	const className = classList(
		css["item"],
		css["submenu"],
		opened && css["open"],
	);

	return (
		<li className={className}
			onPointerEnter={readyOpen} onPointerLeave={opened ? readyClose : () => { }}
			onClickCapture={open}
		>
			{display}
			<Icon icon="chevron-right" height={1} classList={[
				css["icon"]
			]} />
			{/* <pre style={{
				lineHeight: 2,
			}}>{id}</pre> */}
			<AnchoredContextMenu contextMenu={{
				type: "anchored",
				items,
			}} open={opened} dismissable={false} />
		</li>
	);
}