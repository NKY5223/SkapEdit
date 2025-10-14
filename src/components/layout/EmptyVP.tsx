import { Translate } from "@components/translate/Translate.tsx";
import { Layout } from "./Layout.tsx";
import { ViewToolbar } from "./LayoutViewToolbar.tsx";


export const EmptyVP: Layout.ViewProvider = {
	name: "empty",
	Component: ({
		viewSwitch
	}) => (
		<div>
			<ViewToolbar>{viewSwitch}</ViewToolbar>
			<Translate k="layout.view.empty" />
		</div>
	)
};
