import { createRef, FC, MouseEventHandler, PropsWithChildren, useState } from "react";
import { clearContextMenuContext, mergeItems, useContextMenuValueDispatch } from "./ContextMenu.ts";
import { vec2 } from "@common/vec2.ts";
import { FloatingContextMenu } from "./FloatingContextMenu.tsx";
import { ContextMenu } from "./ContextMenu.ts";

/*

When user right clicks on an element:

onContextMenuCapture goes down the tree.
onContextMenu goes up the tree.

When provider receives onContextMenuCapture, clear the menu.
When children receive onContextMenuCapture, add items.

When provider receives onContextMenu, update context menu.
This allows children to stop contextmenu propagation.

*/

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
		e.stopPropagation();
		const items = menuInfo.items.reduce(mergeItems, []);
		if (items.length === 0) return;
		setMenu({
			type: "floating",
			pos: menuInfo.pos,
			items,
		});
		// focus hack
		const current = ref?.current;
		if (!current) return;
		current.focus();
	};

	return (
		<clearContextMenuContext.Provider value={() => setMenu(null)}>
			<div data--provider="ContextMenu" onContextMenuCapture={handleContextMenuCapture} onContextMenu={handleContextMenu}>
				{children}
				{/* silly hack to place focus before the first item of the context menu */}
				{/* popoverOpen compatibility when,,, */}
				<div ref={ref} tabIndex={-1} />
				{menu && <FloatingContextMenu contextMenu={menu} />}
			</div>
		</clearContextMenuContext.Provider>
	);
}