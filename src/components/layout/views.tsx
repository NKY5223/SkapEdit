import { Translate } from "@components/translate/Translate.tsx";
import { InspectorVP } from "@components/view/inspector/InspectorVP.tsx";
import { ViewportVP } from "@components/view/viewport/ViewportVP.tsx";
import { TestErrorVP } from "../../test/TestError.tsx";
import { TestSwatchVP } from "../../test/TestSwatch.tsx";
import { Layout } from "./Layout.tsx";

export const views = {
	"test.swatch": TestSwatchVP,
	"test.error": TestErrorVP,
	"test.translate.lorem": {
		name: "test.translate.lorem",
		Component: ({ viewSwitch }) => (<div>
			{viewSwitch}
			<Translate k="lorem" />
		</div>),
		icon: "text_snippet",
	},
	"map.viewport": ViewportVP,
	"map.inspector": InspectorVP,
} as const satisfies Record<string, Layout.ViewProvider>;
