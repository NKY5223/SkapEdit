import { FC, MouseEventHandler, PropsWithChildren } from "react";
import css from "./ContextMenu.module.css";
import { useContextMenuValueDispatch } from "./reducer.ts";
import { vec2 } from "@common/vec2.ts";
import { FloatingContextMenu } from "./FloatingContextMenu.tsx";

type ContextMenuProviderInternalProps = {
	
};
export const ContextMenuProviderInternal: FC<PropsWithChildren<ContextMenuProviderInternalProps>> = ({
	children,
}) => {
	const [menu, dispatch] = useContextMenuValueDispatch();
	console.log("Rerendering ContextMenuProvider:", menu);

	const handleContextMenuCapture: MouseEventHandler = e => {
		console.log("context menu capture");
		dispatch({
			type: "set",
			menu: {
				type: "floating",
				pos: vec2(100),
				items: [],
			},
		});
	}
	return (
		<div onContextMenuCapture={handleContextMenuCapture}>
			{children}
			{menu && <FloatingContextMenu contextMenu={menu} />}
		</div>
	);
}