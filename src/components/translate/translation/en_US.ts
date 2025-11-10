import { CardinalDirection } from "@editor/object/Base.tsx";
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
	"contextmenu.item.name.viewport.add_object.obstacle": use("object.name.obstacle"),
	"contextmenu.item.name.viewport.add_object.lava": use("object.name.lava"),
	"contextmenu.item.name.viewport.add_object.slime": use("object.name.slime"),
	"contextmenu.item.name.viewport.add_object.ice": use("object.name.ice"),
	"contextmenu.item.name.viewport.add_object.text": use("object.name.text"),
	// #endregion

	// #region Viewport
	"viewport.no_room_selected": "No room selected",
	"viewport.no_room_with_id": ({ id }) => ["No room with id: ", makeCode(id)],
	"viewport.room_fallback": "Unknown room",
	// #endregion

	// #region Topbar
	"topbar.app": "App",
	"contextmenu.item.name.topbar.app.settings": use("settings"),
	"contextmenu.item.name.topbar.app.changelog": use("changelog"),
	"contextmenu.item.name.topbar.app.test_toast": "Test Toasts",
	"topbar.file": "File",
	"contextmenu.item.name.topbar.file.save": "Save",
	"contextmenu.item.name.topbar.file.export_skap": "Export to skap .json format",
	"contextmenu.item.name.topbar.file.import_skap": "Import from skap .json format",
	// #endregion

	// #region Settings
	"settings": "Settings",
	"settings.language": "Language",
	// #endregion

	// #region Changelog
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
	// #endregion

	// #region Objects
	"object.name": delegate("object.name", "type"),
	"object.name.obstacle": "Obstacle",
	"object.name.lava": "Lava",
	"object.name.slime": "Slime",
	"object.name.ice": "Ice",
	"object.name.text": "Text",
	"object.name.block": "Block",
	"object.name.gravityZone": "Gravity Zone",
	"object.name.teleporter": "Teleporter",
	"object.name.spawner": "Spawner",

	"object.teleporter.name": ({ object, room }, t) => [
		"Facing ",
		t(`generic.direction.${CardinalDirection[object.direction]}`, {}),
		" at ",
		object.bounds.topLeft[0],
		", ",
		object.bounds.topLeft[1],
	],
	// #endregion

	// #region Room
	"room": "Room",
	// #endregion

	// #region Map Import
	"import.message": delegate("import.message", "message"),
	"import.message.no_spawn_room": ({ }) => "Could not find spawn room",
	"import.message.broken_teleporter": ({ object, room }) => [
		room ?? `??`,
		": Teleporter #",
		object ?? `"??"`,
		" has no target room",
	],
	"import.message.single_teleporter": ({ object, room }) => [
		room ?? `??`,
		": Teleporter #",
		object ?? `"??"`,
		" has no target teleporter",
	],
	// #endregion
	
	"generic.position": "Position",
	"generic.position.x": "X Position",
	"generic.position.y": "Y Position",
	"generic.position.left": "Left",
	"generic.position.top": "Top",
	"generic.position.right": "Right",
	"generic.position.bottom": "Bottom",
	"generic.position.width": "Width",
	"generic.position.height": "Height",

	"generic.direction": "Direction",
	"generic.direction.down": "Down",
	"generic.direction.left": "Left",
	"generic.direction.right": "Right",
	"generic.direction.up": "Up",
	"generic.direction.cardinal": "Cardinal",
	"generic.direction.free": "Free",

	"generic.action.open": "Open",
	"generic.action.close": "Close",

	"generic.list_string": ({ strings }) => strings.join(", "),

	"generic.text": "Text",

	"generic.lorem": false
		? "Lorem ipsum dolor sit amet"
		: (
			"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, culpa possimus fuga, veritatis harum autem dolore ipsam provident, id praesentium distinctio ullam similique! Earum praesentium repudiandae magnam ipsum et nihil! " +
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, libero magnam quia fuga est tempore autem reprehenderit id culpa nesciunt praesentium necessitatibus saepe veritatis in similique, impedit, iure corporis! Sint!"
		),

	"generic.none_selected": "(none)",
});