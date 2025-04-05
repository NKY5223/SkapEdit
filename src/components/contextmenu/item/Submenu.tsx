import { FC, useRef, useState } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenuSubmenu as Submenu } from "../ContextMenu.tsx";
import { classList } from "@components/utils.tsx";
import { AnchoredContextMenu } from "../AnchoredContextMenu.tsx";

type ContextMenuSubmenuProps = {
	item: Submenu;
	timeout?: number;
};
export const ContextMenuSubmenu: FC<ContextMenuSubmenuProps> = ({
	item,
	timeout = 500,
}) => {
	const { display, menu } = item;

	// aaaaa open is both an adjective and a verb, damn you english
	const [opened, setOpened] = useState(false);
	const closeTimeout = useRef<number>(-1);

	const open = () => {
		const oldTimeout = closeTimeout.current;
		if (oldTimeout !== -1) {
			clearTimeout(oldTimeout);
		}
		setOpened(true);
	}
	const close = () => setOpened(false);

	// effectful (!)
	const delayClose = () => {
		const oldTimeout = closeTimeout.current;
		if (oldTimeout !== -1) {
			clearTimeout(oldTimeout);
		}
		const newTimeout = setTimeout(() => {
			setOpened(false);
			closeTimeout.current = -1;
		}, timeout);
		closeTimeout.current = newTimeout;
	}

	const className = classList(
		css["item"],
		css["submenu"],
		opened && css["open"],
	);
	return (
		<li className={className} onPointerEnter={open} onPointerLeave={delayClose} onClick={open}>
			{display}
			{opened && (
				<AnchoredContextMenu contextMenu={menu} dismiss={false} />
			)}
		</li>
	);
}