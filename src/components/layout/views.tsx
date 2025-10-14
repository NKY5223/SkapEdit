import { Translate } from "@components/translate/Translate.tsx";
import { InspectorVP } from "@components/view/inspector/InspectorVP.tsx";
import { ViewportVP } from "@components/view/viewport/ViewportVP.tsx";
import { TestErrorVP } from "../../test/TestError.tsx";
import { TestIconVP } from "../../test/TestIcon.tsx";
import { TestIconsVP } from "../../test/TestIcons.tsx";
import { TestSwatchVP } from "../../test/TestSwatch.tsx";
import { Layout } from "./Layout.tsx";

export const views = {
	"test.icon": TestIconVP,
	"test.icons": TestIconsVP,
	"test.swatch": TestSwatchVP,
	"test.error": TestErrorVP,
	"test.translate.lorem": {
		name: "test.translate.lorem",
		Component: ({ viewSwitch }) => (<div>
			{viewSwitch}
			<Translate k="lorem" />
		</div>)
	},
	"map.viewport": ViewportVP,
	"map.inspector": InspectorVP,
} as const satisfies Record<string, Layout.ViewProvider>;
