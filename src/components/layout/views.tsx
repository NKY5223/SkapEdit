import { Translate } from "@components/translate/Translate.tsx";
import { InspectorVP } from "@components/view/inspector/Inspector.tsx";
import { ViewportVP } from "@components/view/viewport/Viewport.tsx";
import { TestErrorVP } from "../../test/TestError.tsx";
import { TestSwatchVP } from "../../test/TestSwatch.tsx";
import { Layout, makeStatelessViewProvider } from "./layout.ts";

export const viewProviders = {
	"test.swatch": TestSwatchVP,
	"test.error": TestErrorVP,
	"test.translate.lorem": makeStatelessViewProvider({
		name: "test.translate.lorem",
		Component: ({ viewSwitcher }) => (
			<div style={{ padding: "0.5em" }}>
				{viewSwitcher}
				<Translate k="generic.lorem" />
			</div>
		),
		icon: "text_snippet",
	}),
	"map.viewport": ViewportVP,
	"map.inspector": InspectorVP,
} as const;
