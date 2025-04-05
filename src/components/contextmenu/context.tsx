import { createContext, Dispatch, SetStateAction, FC, PropsWithChildren, useState } from "react";
import { ContextMenuFloating } from "./ContextMenu.tsx";
import { FloatingContextMenu } from "./FloatingContextMenu.tsx";

export const contextMenuContext = createContext<
	Dispatch<SetStateAction<ContextMenuFloating | null>>
>(() => {
	console.warn(`Context menu broken :(`);
});

export const ContextMenuProvider: FC<PropsWithChildren> = ({
	children
}) => {
	const [current, setCurrent] = useState<ContextMenuFloating | null>(null);
	return (
		<contextMenuContext.Provider value={setCurrent}>
			{children}
			{current && <FloatingContextMenu contextMenu={current} />}
		</contextMenuContext.Provider>
	);
};
