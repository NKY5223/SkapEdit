import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.tsx";
import { classList } from "@components/utils.tsx";
import { AnchoredContextMenu } from "../AnchoredContextMenu.tsx";
import { useCmenuReducer } from "../context.tsx";
import { useTimeout } from "@hooks/useTimeout.ts";

type ContextMenuSubmenuProps = {
	item: ContextMenu.Submenu;
};
export const ContextMenuSubmenu: FC<ContextMenuSubmenuProps> = ({
	item,
}) => {
	const { display, items, opened } = item;
	const dispatch = useCmenuReducer();
	const [timeout, cancelTimeout] = useTimeout(1000);

	const open = () => {
		cancelTimeout(),
		dispatch({
			type: "open_submenu",
			target: item.id,
		});
	};
	const readyClose = () => {
		timeout(() => dispatch({
			type: "close_submenu",
			target: item.id,
		}));
	};

	const className = classList(
		css["item"],
		css["submenu"],
		opened && css["open"],
	);

	return (
		<li className={className} onPointerEnter={open} onPointerLeave={readyClose} onClick={open}>
			{display}
			{opened && (
				<AnchoredContextMenu contextMenu={{ 
					type: "anchored", 
					items, 
				}} dismissable={false} />
			)}
		</li>
	);
}