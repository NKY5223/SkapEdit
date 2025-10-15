import { FC, PropsWithChildren, useReducer, useEffect } from "react";
import { cmenuReducer, cmenuOpenedIdContext, cmenuReducerContext } from "./context.tsx";
import { FloatingContextMenu } from "./FloatingContextMenu.tsx";

export const ContextMenuProvider: FC<PropsWithChildren> = ({
	children
}) => {
	const [current, dispatch] = useReducer(cmenuReducer, null);

	useEffect(() => {
		console.log("cmenu provider mount");
		return () => console.log("cmenu provider unmount");
	}, []);
	const openedId = current?.openedIds.at(-1) ?? null;

	return (
		<div onContextMenuCapture={() => {
			dispatch({
				type: "set",
				menu: null,
			});
		}}>
			{/* I love context hell!!!! */}
			<cmenuOpenedIdContext.Provider value={openedId}>
				<cmenuReducerContext.Provider value={dispatch}>
					{children}
					{current && <FloatingContextMenu key={current.id}
						contextMenu={current.menu} />}
				</cmenuReducerContext.Provider>
			</cmenuOpenedIdContext.Provider>
		</div>
	);
};
