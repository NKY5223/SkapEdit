import { Translate } from "@components/translate/Translate.tsx";
import { Layout } from "./layout.ts";
import { ViewToolbar } from "./LayoutViewToolbar.tsx";


export const EmptyVP: Layout.ViewProvider = {
	name: "empty",
	Component: ({
		viewSwitch
	}) => (
		<div style={{
			padding: ".5em",
		}}>
			<ViewToolbar>
				{viewSwitch}
				<Translate k="layout.view.empty" />
			</ViewToolbar>
		</div>
	),
	icon: "circle",
};
