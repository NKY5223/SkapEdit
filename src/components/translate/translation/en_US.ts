
import { delegateOn, makeTranslator } from "../translate.ts";
import { TranslationArgs } from "../translationArgs.ts";

// so beautifully type "perfect"
const delegate = delegateOn<TranslationArgs>(".");
export const translator_en_US = makeTranslator<TranslationArgs>({
	"error.layout.view.unknown": ({ viewProviderName }) => ["Unknown view provider: ", viewProviderName],

	"layout.split.dissolve-left": "Dissolve Left",
	"layout.split.dissolve-right": "Dissolve Right",
	"layout.split.dissolve-up": "Dissolve Up",
	"layout.split.dissolve-down": "Dissolve Down",
	"layout.split.swap-x": "Swap",
	"layout.split.swap-y": "Swap",

	"layout": "Layout",
	"layout.view.fallback": "Unknown View",
	"layout.view.empty": "Empty",
	"layout.view.split-x": "Split Horizontally",
	"layout.view.split-y": "Split Vertically",
	"layout.view.name": delegate("layout.view.name", "view"),
	"layout.view.category.name": delegate("layout.view.category.name", "category"),

	"layout.view.category.name.test": "Testing",
	"layout.view.name.test.swatch": "Theme Test",
	"layout.view.name.test.error": "Error Test (will error this view)",
	"layout.view.name.test.translate.lorem": (_, translate) => translate("lorem", {}),
	"layout.view.name.test.empty": "Empty",

	"layout.view.category.name.map": "Map",
	"layout.view.name.map.inspector": "Inspector",
	"layout.view.name.map.viewport": "Viewport",

	"contextmenu.item.name": delegate("contextmenu.item.name", "name"),
	"contextmenu.item.name.layout": "Layout",
	"contextmenu.item.name.layout.split-x": "Split Horizontally",
	"contextmenu.item.name.layout.split-y": "Split Vertically",

	"contextmenu.item.name.layout.dissolve-left": "Dissolve Left",
	"contextmenu.item.name.layout.dissolve-right": "Dissolve Right",
	"contextmenu.item.name.layout.dissolve-up": "Dissolve Up",
	"contextmenu.item.name.layout.dissolve-down": "Dissolve Down",

	"contextmenu.item.name.layout.swap-x": "Swap",
	"contextmenu.item.name.layout.swap-y": "Swap",
	"contextmenu.item.name.viewport": "Viewport",
	"contextmenu.item.name.viewport.reset_camera": "Reset Camera",

	"lorem": true
		? "Lorem ipsum dolor sit amet"
		: (
			"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, culpa possimus fuga, veritatis harum autem dolore ipsam provident, id praesentium distinctio ullam similique! Earum praesentium repudiandae magnam ipsum et nihil! " +
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, libero magnam quia fuga est tempore autem reprehenderit id culpa nesciunt praesentium necessitatibus saepe veritatis in similique, impedit, iure corporis! Sint!"
		),
});