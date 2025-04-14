import { FC, PropsWithChildren } from "react";
import { delegate, toMap, Translation, TranslationProvider } from "../components/translate/Translate.tsx";

export const translations = {
	"error.layout.view.unknown": ["Unknown view: ", { value: "view" }],

	"layout.split.dissolve-left": "Dissolve Left",
	"layout.split.dissolve-right": "Dissolve Right",
	"layout.split.dissolve-up": "Dissolve Up",
	"layout.split.dissolve-down": "Dissolve Down",
	"layout.split.swap-x": "Swap",
	"layout.split.swap-y": "Swap",

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
} as const satisfies Record<string, Translation>;
type EmptyTranslations = {
	[k in keyof typeof translations]: {};
}

declare global {
	namespace Registry {
		export interface Translation extends EmptyTranslations {}
	}
}

export const Translations: FC<PropsWithChildren> = ({ children }) => (
	<TranslationProvider translations={toMap<Translation>(translations)}>
		{children}
	</TranslationProvider>
);