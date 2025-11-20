import { CardinalDirection } from "@editor/object/Base.tsx";
import { makeCode, makeItalic, makeLink } from "../richtext.ts";
import { delegateOn, makeTranslator, Translator } from "../translate.ts";
import { TranslationArgs } from "../translationArgs.ts";

// so beautifully type "perfect"
const delegate = delegateOn<TranslationArgs>(".");
const use = (k: keyof TranslationArgs) => (_: {}, translate: Translator<TranslationArgs>) => translate(k, {});
const trunc = (str: string, maxLength: number) => {
	const chars = [...str];
	if (chars.length <= maxLength) return str;
	return chars.slice(0, maxLength).join("") + "…";
}

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

	"layout.view.category.name.map": use("map"),
	"layout.view.name.map.inspector": use("inspector"),
	"layout.view.name.map.viewport": use("viewport"),
	"layout.view.name.map.outline": use("outline"),
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

	"contextmenu.item.name.viewport": use("viewport"),
	"contextmenu.item.name.viewport.reset_camera": "Reset Camera",
	"contextmenu.item.name.viewport.add": "Add",
	"contextmenu.item.name.viewport.add.object": "Object",

	"contextmenu.item.name.viewport.add.object.basic": "Basic",
	"contextmenu.item.name.viewport.add.object.obstacle": use("object.name.obstacle"),
	"contextmenu.item.name.viewport.add.object.lava": use("object.name.lava"),
	"contextmenu.item.name.viewport.add.object.slime": use("object.name.slime"),
	"contextmenu.item.name.viewport.add.object.ice": use("object.name.ice"),

	"contextmenu.item.name.viewport.add.object.circular": "Circular",
	"contextmenu.item.name.viewport.add.object.circularIce": use("object.name.circularIce"),
	"contextmenu.item.name.viewport.add.object.circularLava": use("object.name.circularLava"),
	"contextmenu.item.name.viewport.add.object.circularObstacle": use("object.name.circularObstacle"),
	"contextmenu.item.name.viewport.add.object.circularSlime": use("object.name.circularSlime"),

	"contextmenu.item.name.viewport.add.object.moving": "Moving",
	"contextmenu.item.name.viewport.add.object.movingIce": use("object.name.movingIce"),
	"contextmenu.item.name.viewport.add.object.movingLava": use("object.name.movingLava"),
	"contextmenu.item.name.viewport.add.object.movingObstacle": use("object.name.movingObstacle"),
	"contextmenu.item.name.viewport.add.object.movingSlime": use("object.name.movingSlime"),

	"contextmenu.item.name.viewport.add.object.text": use("object.name.text"),
	"contextmenu.item.name.viewport.add.object.block": use("object.name.block"),
	"contextmenu.item.name.viewport.add.object.gravityZone": use("object.name.gravityZone"),
	"contextmenu.item.name.viewport.add.object.spawner": use("object.name.spawner"),
	"contextmenu.item.name.viewport.add.object.rotatingLava": use("object.name.rotatingLava"),
	"contextmenu.item.name.viewport.add.object.reward": use("object.name.reward"),
	"contextmenu.item.name.viewport.add.object.hatReward": use("object.name.hatReward"),

	"contextmenu.item.name.viewport.add.room": use("room"),
	// #endregion

	// #region Viewport
	"viewport": "Viewport",
	"viewport.no_room_selected": "No room selected",
	"viewport.no_room_with_id": ({ id }) => ["No room with id: ", makeCode(id)],
	"viewport.room_fallback": "Unknown room",
	// #endregion

	// #region Inspector
	"inspector": "Inspector",
	"inspector.room.background_color": "Background Color",
	"inspector.room.obstacle_color": "Obstacle Color",
	// #endregion

	// #region Outline
	"outline": "Outline",
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
	"object.name.rotatingLava": "Rotating Lava",
	"object.name.circularObstacle": "Circular Obstacle",
	"object.name.circularLava": "Circular Lava",
	"object.name.circularSlime": "Circular Slime",
	"object.name.circularIce": "Circular Ice",
	"object.name.movingObstacle": "Moving Obstacle",
	"object.name.movingLava": "Moving Lava",
	"object.name.movingSlime": "Moving Slime",
	"object.name.movingIce": "Moving Ice",
	"object.name.turret": "Turret",
	"object.name.door": "Door",
	"object.name.button": "Button",
	"object.name.switch": "Switch",
	"object.name.reward": "Reward",
	"object.name.hatReward": "Hat Reward",

	"object.individual_name": ({ object, room, map }, t) => {
		switch (object.type) {
			case "text":
				return t("object.text_name", { object, room, map });
			case "teleporter":
				return t("object.teleporter_name", { object, room, map });
			default:
				return t("object.name", { type: object.type });
		}
	}, 
	"object.text_name": ({ object }, t) => [
		t("object.name.text", {}),
		": ",
		makeItalic(trunc(object.text, 20)),
	],
	"object.teleporter_name": ({ object, map }, t) => {
		const { target } = object;
		const roomName = target === null
			? undefined
			: target.type === "room"
				? map.rooms.get(target.roomId)?.name
				: map.rooms.values().find(room => room.objects.has(target.teleporterId))?.name;
		return [
			t("object.name.teleporter", {}),
			": ",
			roomName ?? makeItalic("???"),
		];
	},
	// #endregion

	// #region Room
	"room": "Room",
	// #endregion

	// #region Map
	"map": "Map",
	"map.author": "Author",
	"map.version": ({ version }) => ["Version ", version],
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

	"generic.name": "Name",
	"generic.radius": "Radius",

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
	"generic.vec2": ({ vector: [x, y] }) => [
		x, ", ", y,
	],

	"generic.text": "Text",

	"generic.lorem": false
		? "Lorem ipsum dolor sit amet"
		: (
			"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, culpa possimus fuga, veritatis harum autem dolore ipsam provident, id praesentium distinctio ullam similique! Earum praesentium repudiandae magnam ipsum et nihil! " +
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, libero magnam quia fuga est tempore autem reprehenderit id culpa nesciunt praesentium necessitatibus saepe veritatis in similique, impedit, iure corporis! Sint!"
		),

	"generic.none_selected": "(none)",

	"generic.input_file": "Input file",
});