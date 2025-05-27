import { ViewFC } from "@components/layout/LayoutView.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Inspector } from "@components/view/inspector/Inspector.tsx";
import { Viewport } from "@components/view/viewport/Viewport.tsx";
import { TestError } from "../../test/TestError.tsx";
import { TestIcon } from "../../test/TestIcon.tsx";
import { TestIcons } from "../../test/TestIcons.tsx";
import { TestSwatch } from "../../test/TestSwatch.tsx";

export const views = {
	"test.icon": TestIcon,
	"test.icons": TestIcons,
	"test.swatch": TestSwatch,
	"test.error": TestError,
	"map.inspector": Inspector,
	"test.lorem": ({ children }) => (<div>
		{children}
		<Translate k="lorem" />
	</div>),
	"map.viewport": Viewport,
} as const satisfies Record<string, ViewFC>;
