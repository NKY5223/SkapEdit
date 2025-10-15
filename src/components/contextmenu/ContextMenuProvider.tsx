import { FC, PropsWithChildren } from "react";
import { ContextMenuContextProvider } from "./reducer.ts";
import { ContextMenuProviderInternal } from "./ContextMenuProviderInternal.tsx";

export const ContextMenuProvider: FC<PropsWithChildren> = ({
	children
}) => {
	return (
		<ContextMenuContextProvider initialValue={null}>
			<ContextMenuProviderInternal>
				{children}
			</ContextMenuProviderInternal>
		</ContextMenuContextProvider>
	);
}