import { makeCode, makeLink } from "../richtext.ts";
import { delegateOn, makeTranslator, Translator } from "../translate.ts";
import { TranslationArgs } from "../translationArgs.ts";

// so beautifully type "perfect"
const delegate = delegateOn<TranslationArgs>(".");
const use = (k: keyof TranslationArgs) => (_: {}, translate: Translator<TranslationArgs>) => translate(k, {});

export const translator_en_US = makeTranslator<TranslationArgs>({
	"error.layout.view.unknown": ({ viewProviderName }) => ["Unknown view provider: ", viewProviderName],

	// #region Layout
	"layout": "Layout",
	"layout.view.fallback": "Unknown View",

	"layout.view.category.name": delegate("layout.view.category.name", "category"),
	"layout.view.name": delegate("layout.view.name", "view"),

	"layout.view.category.name.test": "Testing",
	"layout.view.name.test.swatch": "Theme Test",
	"layout.view.name.test.error": "Error Test (will error this view)",
	"layout.view.name.test.translate.lorem": use("generic.lorem"),
	"layout.view.name.test.empty": "Empty",

	"layout.view.category.name.map": "Map",
	"layout.view.name.map.inspector": "Inspector",
	"layout.view.name.map.viewport": "Viewport",
	// #endregion

	// #region Context Menu
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
	"contextmenu.item.name.viewport.add_object": "Add Object",
	"contextmenu.item.name.viewport.add_object.obstacle": "Obstacle",
	// #endregion

	// #region Topbar
	"topbar.app": "App",
	"contextmenu.item.name.topbar.app.settings": "Settings",
	"contextmenu.item.name.topbar.app.changelog": use("changelog"),
	"topbar.file": "File",
	"contextmenu.item.name.topbar.file.save": "Save",
	"contextmenu.item.name.topbar.file.export_skap": "Export to skap",
	// #endregion

	"changelog": "Changelog",
	"changelog.version-title": ({ version, time }) => [
		`Version `, version, `, `, time ? time.toLocaleDateString("en-US") : `XX/XX/XXXX`,
	],
	"changelog.current-build": ({ version, mode, github }) => {
		if (!github) return makeCode([`Current build: `, mode, ` `, version]);
		const { repoOwner, repoName, commitSha, repoUrl, commitUrl } = github;
		return makeCode([
			`Current build: `, mode, ` `, version, ` from `, 
			makeLink(repoUrl, [repoOwner, `/`, repoName]), ` commit `,
			makeLink(commitUrl, commitSha.slice(0, 7)),
		]);
	},

	"generic.position.x": "X Position",
	"generic.position.y": "Y Position",
	"generic.position.left": "Left",
	"generic.position.top": "Top",
	"generic.position.right": "Right",
	"generic.position.bottom": "Bottom",
	"generic.position.width": "Width",
	"generic.position.height": "Height",

	"generic.action.open": "Open",
	"generic.action.close": "Close",

	"generic.text": "Text",

	"generic.lorem": true
		? "Lorem ipsum dolor sit amet"
		: (
			"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, culpa possimus fuga, veritatis harum autem dolore ipsam provident, id praesentium distinctio ullam similique! Earum praesentium repudiandae magnam ipsum et nihil! " +
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, libero magnam quia fuga est tempore autem reprehenderit id culpa nesciunt praesentium necessitatibus saepe veritatis in similique, impedit, iure corporis! Sint!"
		),
});