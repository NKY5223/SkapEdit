import { Translate } from "@components/translate/Translate.tsx";
import { InspectorVP } from "@components/view/inspector/InspectorVP.tsx";
import { ViewportVP } from "@components/view/viewport/ViewportVP.tsx";
import { TestErrorVP } from "../../test/TestError.tsx";
import { TestSwatchVP } from "../../test/TestSwatch.tsx";
import { Layout } from "./Layout.tsx";
import { EmptyVP } from "./EmptyVP.tsx";

export const views = {
	"test.swatch": TestSwatchVP,
	"test.error": TestErrorVP,
	"test.translate.lorem": {
		name: "test.translate.lorem",
		Component: ({ viewSwitch }) => (<div style={{ padding: "0.5em" }}>
			{viewSwitch}
			<Translate k="lorem" />
		</div>),
		icon: "text_snippet",
	},
	"test.empty": EmptyVP,
	"map.viewport": ViewportVP,
	"map.inspector": InspectorVP,
} as const satisfies Record<string, Layout.ViewProvider>;
