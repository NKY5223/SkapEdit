import { createRef, FC, MouseEventHandler, PropsWithChildren, useEffect, useState } from "react";
import { clearContextMenuContext, mergeItems, useContextMenuValueDispatch } from "./reducer.ts";
import { vec2 } from "@common/vec2.ts";
import { FloatingContextMenu } from "./FloatingContextMenu.tsx";
import { ContextMenu } from "./ContextMenu.ts";

type ContextMenuProviderInternalProps = {

};
export const ContextMenuProviderInternal: FC<PropsWithChildren<ContextMenuProviderInternalProps>> = ({
	children,
}) => {
	const [menuInfo, dispatch] = useContextMenuValueDispatch();
	const [menu, setMenu] = useState<ContextMenu.Floating | null>(null);
	const ref = createRef<HTMLDivElement>();

	const handleContextMenuCapture: MouseEventHandler = e => {
		// setMenu(null);
		dispatch({
			type: "set_pos",
			pos: vec2(e.clientX, e.clientY),
		});
		dispatch({
			type: "clear_items",
		});
	}
	const handleContextMenu: MouseEventHandler = e => {
		e.preventDefault();
		const items = menuInfo.items.reduce(mergeItems, []);
		if (items.length === 0) return;
		setMenu({
			type: "floating",
			pos: menuInfo.pos,
			items,
		});
	};

	// focus hack
	useEffect(() => {
		const current = ref?.current;
		if (!current) return;
		current.focus();
	}, [ref.current]);

	return (
		<clearContextMenuContext.Provider value={() => setMenu(null)}>
			<div onContextMenuCapture={handleContextMenuCapture} onContextMenu={handleContextMenu}>
				{children}
				{/* silly hack to place focus before the first item of the context menu */}
				{/* popoverOpen compatibility when,,, */}
				<div ref={ref} tabIndex={-1} />
				{menu && <FloatingContextMenu contextMenu={menu} />}
			</div>
		</clearContextMenuContext.Provider>
	);
}