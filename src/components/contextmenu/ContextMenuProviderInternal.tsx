import { createRef, FC, MouseEventHandler, PropsWithChildren, useEffect } from "react";
import { useContextMenuValueDispatch } from "./reducer.ts";
import { vec2 } from "@common/vec2.ts";
import { FloatingContextMenu } from "./FloatingContextMenu.tsx";

type ContextMenuProviderInternalProps = {
	
};
export const ContextMenuProviderInternal: FC<PropsWithChildren<ContextMenuProviderInternalProps>> = ({
	children,
}) => {
	const [menu, dispatch] = useContextMenuValueDispatch();
	const ref = createRef<HTMLDivElement>();

	const handleContextMenuCapture: MouseEventHandler = e => {
		e.preventDefault();
		dispatch({
			type: "set",
			menu: {
				type: "floating",
				pos: vec2(e.clientX, e.clientY),
				items: [],
			},
		});
	}
	useEffect(() => {
		if (!menu) return;
		console.log("Attempting focus");
		const current = ref?.current;
		if (!current) return;
		
		console.log("Attempting focus on", current);
		current.focus();
	}, [menu, ref.current]);

	return (
		<div onContextMenuCapture={handleContextMenuCapture}>
			{children}
			{/* silly hack to place focus before the first item of the context menu */}
			<div ref={ref} tabIndex={-1} />
			{menu && <FloatingContextMenu contextMenu={menu} />}
		</div>
	);
}