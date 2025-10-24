import { FC, PropsWithChildren } from "react";
import { ContextMenuContextProvider } from "./ContextMenu.ts";
import { ContextMenuProviderInternal } from "./ContextMenuProviderInternal.tsx";
import { vec2 } from "@common/vec2.ts";

export const ContextMenuProvider: FC<PropsWithChildren> = ({
	children
}) => {
	return (
		<ContextMenuContextProvider initialValue={{
			pos: vec2(0),
			items: []
		}}>
			<ContextMenuProviderInternal>
				{children}
			</ContextMenuProviderInternal>
		</ContextMenuContextProvider>
	);
}