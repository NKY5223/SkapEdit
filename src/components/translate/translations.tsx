import { FC, PropsWithChildren } from "react";
import { TranslationProvider } from "./Translate.tsx";
import { createTranslations, delegate, Infer } from "@components/translate/constructors.tsx";

export const translations = createTranslations({
	"error.layout.view.unknown": ["Unknown view: ", ({ view }: { view: string }) => view],

	"layout.split.dissolve-left": "Dissolve Left",
	"layout.split.dissolve-right": "Dissolve Right",
	"layout.split.dissolve-up": "Dissolve Up",
	"layout.split.dissolve-down": "Dissolve Down",
	"layout.split.swap-x": "Swap",
	"layout.split.swap-y": "Swap",

	"layout": "Layout",
	"layout.view.fallback": "Unknown View",
	"layout.view.empty": "Pick a view",
	"layout.view.split-x": "Split Horizontally",
	"layout.view.split-y": "Split Vertically",
	"layout.view.name": delegate("layout.view.name", "view"),
	"layout.view.category.name": delegate("layout.view.category.name", "category"),

	"layout.view.category.name.test": "Testing",
	"layout.view.name.test.icon": "Icon Test",
	"layout.view.name.test.icons": "Icons Test",
	"layout.view.name.test.swatch": "Theme Test",
	"layout.view.name.test.error": "Error Test (will error this view)",
	"layout.view.name.test.lorem": "Lorem ipsum...",

	"layout.view.category.name.map": "Map",
	"layout.view.name.map.inspector": "Inspector",
	"layout.view.name.map.viewport": "Viewport",

	"lorem": "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, culpa possimus fuga, veritatis harum autem dolore ipsam provident, id praesentium distinctio ullam similique! Earum praesentium repudiandae magnam ipsum et nihil!",
});
type Inferred = Infer<typeof translations>;
declare global {
	namespace Registry {
		export interface Translation extends Inferred {
		}
	}
}

export const DefaultTranslationProvider: FC<PropsWithChildren> = ({ children }) => (
	<TranslationProvider value={translations}>
		{children}
	</TranslationProvider>
);