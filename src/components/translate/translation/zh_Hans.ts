import { CardinalDirection } from "@editor/object/Base.tsx";
import { makeCode, makeLink } from "../richtext.ts";
import { delegateOn, makeTranslator, Translator } from "../translate.ts";
import { TranslationArgs } from "../translationArgs.ts";

// the translations are terrible im just testing the system

const delegate = delegateOn<TranslationArgs>(".");
const use = (k: keyof TranslationArgs) => (_: {}, translate: Translator<TranslationArgs>) => translate(k, {});
export const translator_zh_Hans = makeTranslator<TranslationArgs>({
	"error.layout.view.unknown": ({ viewProviderName }) => ["没有此ViewProvider：", viewProviderName],

	// #region Layout
	"layout": "布局",
	"layout.view.fallback": "？？？",

	"layout.view.category.name": delegate("layout.view.category.name", "category"),
	"layout.view.name": delegate("layout.view.name", "view"),

	"layout.view.category.name.test": "测试",
	"layout.view.name.test.swatch": "主题测试",
	"layout.view.name.test.error": "错误测试",
	"layout.view.name.test.translate.lorem": use("generic.lorem"),
	"layout.view.name.test.empty": "空",

	"layout.view.category.name.map": "地图",
	"layout.view.name.map.inspector": "Inspector ？",
	"layout.view.name.map.viewport": "视口",
	// #endregion

	// #region Context Menu	
	"contextmenu.item.name": delegate("contextmenu.item.name", "name"),
	"contextmenu.item.name.layout": "布局",
	"contextmenu.item.name.layout.split-x": "分割（横）",
	"contextmenu.item.name.layout.split-y": "分割（竖）",

	"contextmenu.item.name.layout.dissolve-left": "解散（左）",
	"contextmenu.item.name.layout.dissolve-right": "解散（右）",
	"contextmenu.item.name.layout.dissolve-up": "解散（上）",
	"contextmenu.item.name.layout.dissolve-down": "解散（下）",

	"contextmenu.item.name.layout.swap-x": "交换",
	"contextmenu.item.name.layout.swap-y": "交换",

	"contextmenu.item.name.viewport": use("viewport"),
	"contextmenu.item.name.viewport.reset_camera": "重置相机",
	"contextmenu.item.name.viewport.add_object": "添加",

	"contextmenu.item.name.viewport.add_object.basic": "简单",
	"contextmenu.item.name.viewport.add_object.obstacle": use("object.name.obstacle"),
	"contextmenu.item.name.viewport.add_object.lava": use("object.name.lava"),
	"contextmenu.item.name.viewport.add_object.slime": use("object.name.slime"),
	"contextmenu.item.name.viewport.add_object.ice": use("object.name.ice"),

	"contextmenu.item.name.viewport.add_object.circular": "圆形",
	"contextmenu.item.name.viewport.add_object.circularIce": use("object.name.circularIce"),
	"contextmenu.item.name.viewport.add_object.circularLava": use("object.name.circularLava"),
	"contextmenu.item.name.viewport.add_object.circularObstacle": use("object.name.circularObstacle"),
	"contextmenu.item.name.viewport.add_object.circularSlime": use("object.name.circularSlime"),

	"contextmenu.item.name.viewport.add_object.moving": "移动",
	"contextmenu.item.name.viewport.add_object.movingIce": use("object.name.movingIce"),
	"contextmenu.item.name.viewport.add_object.movingLava": use("object.name.movingLava"),
	"contextmenu.item.name.viewport.add_object.movingObstacle": use("object.name.movingObstacle"),
	"contextmenu.item.name.viewport.add_object.movingSlime": use("object.name.movingSlime"),

	"contextmenu.item.name.viewport.add_object.text": use("object.name.text"),
	"contextmenu.item.name.viewport.add_object.block": use("object.name.block"),
	"contextmenu.item.name.viewport.add_object.gravityZone": use("object.name.gravityZone"),
	"contextmenu.item.name.viewport.add_object.spawner": use("object.name.spawner"),
	"contextmenu.item.name.viewport.add_object.rotatingLava": use("object.name.rotatingLava"),
	"contextmenu.item.name.viewport.add_object.reward": use("object.name.spawner"),
	"contextmenu.item.name.viewport.add_object.hatReward": use("object.name.spawner"),
	// #endregion

	// #region Viewport
	"viewport": "视口",
	"viewport.no_room_selected": "还未选择房间",
	"viewport.no_room_with_id": ({ id }) => ["没有ID为", makeCode(id), "的房间"],
	"viewport.room_fallback": "？？？",
	// #endregion
	
	// #region Inspector
	"inspector": "Inspector",
	"inspector.room.background_color": "背景颜色",
	"inspector.room.obstacle_color": "障碍颜色",
	// #endregion

	// #region Topbar
	"topbar.app": "APP",
	"contextmenu.item.name.topbar.app.settings": use("settings"),
	"contextmenu.item.name.topbar.app.changelog": use("changelog"),
	"contextmenu.item.name.topbar.app.test_toast": "测试弹出式通知",
	"topbar.file": "文件",
	"contextmenu.item.name.topbar.file.save": "保存",
	"contextmenu.item.name.topbar.file.export_skap": "输出至skap .json 格式",
	"contextmenu.item.name.topbar.file.import_skap": "输入从skap .json 格式",
	// #endregion

	// #region Settings
	"settings": "设置",
	"settings.language": "语言",
	// #endregion

	// #region Changelog
	"changelog": "更新日志",
	"changelog.version-title": ({ version, time }) => [
		version, ` 版本，`, time ? time.toLocaleDateString("zh-Hans") : `XXXX/XX/XX`,
	],
	"changelog.current-build": ({ version, mode, github }) => {
		if (!github) return makeCode([mode, ` `, version, ` 版本`]);
		const { repoOwner, repoName, commitSha, repoUrl, commitUrl } = github;
		return makeCode([
			mode, ` `, version, ` 版本，从 `,
			makeLink(repoUrl, [repoOwner, `/`, repoName]), ` commit `,
			makeLink(commitUrl, commitSha.slice(0, 7)),
		]);
	},
	// #endregion

	// #region Objects
	"object.name": delegate("object.name", "type"),
	"object.name.obstacle": "障碍",
	"object.name.lava": "岩浆",
	"object.name.slime": "弹浆",
	"object.name.ice": "冰块",
	"object.name.text": "文字",
	"object.name.block": "方块",
	"object.name.gravityZone": "重力区",
	"object.name.teleporter": "传送机",
	"object.name.spawner": "生成器",
	"object.name.rotatingLava": "旋转式岩浆",
	"object.name.circularObstacle": "圆形障碍",
	"object.name.circularLava": "圆形岩浆",
	"object.name.circularSlime": "圆形弹浆",
	"object.name.circularIce": "圆形冰块",
	"object.name.movingObstacle": "移动障碍",
	"object.name.movingSlime": "移动弹浆",
	"object.name.movingLava": "移动岩浆",
	"object.name.movingIce": "移动冰块",
	"object.name.turret": "炮塔",
	"object.name.door": "门",
	"object.name.button": "按钮",
	"object.name.switch": "开关",
	"object.name.reward": "奖励",
	"object.name.hatReward": "帽子奖励",

	"object.teleporter.name": ({ object, room }, t) => [
		"向",
		t(`generic.direction.${CardinalDirection[object.direction]}`, {}),
		"，在",
		t(`generic.vec2`, { vector: object.bounds.center() }),
	],
	// #endregion

	// #region Room
	"room": "房间",
	// #endregion
	
	// #region Map
	"map": "地图",
	"map.author": "创造者",
	"map.version": ({ version }) => ["第", version, "版本"],
	// #endregion

	// #region Map Import
	"import.message": delegate("import.message", "message"),
	"import.message.no_spawn_room": ({ }) => "Could not find spawn room",
	"import.message.broken_teleporter": ({ object, room }) => [
		room ?? `??`,
		"：传送机 #",
		object ?? `"??"`,
		"无目标房间",
	],
	"import.message.single_teleporter": ({ object, room }) => [
		room ?? `??`,
		"：传送机 #",
		object ?? `"??"`,
		"无目标传送机",
	],
	// #endregion

	"generic.name": "名",
	"generic.radius": "半径",

	"generic.position": "位置",
	"generic.position.x": "X坐标",
	"generic.position.y": "Y坐标",
	"generic.position.left": "左",
	"generic.position.top": "顶",
	"generic.position.right": "右",
	"generic.position.bottom": "底",
	"generic.position.width": "宽",
	"generic.position.height": "高",

	"generic.direction": "方向",
	"generic.direction.down": "下",
	"generic.direction.left": "左",
	"generic.direction.right": "右",
	"generic.direction.up": "上",
	"generic.direction.cardinal": "基本",
	"generic.direction.free": "自由",

	"generic.list_string": ({ strings }) => strings.join("、"),
	"generic.vec2": ({ vector: [x, y] }) => [
		x, "、", y,
	],

	"generic.action.open": "开",
	"generic.action.close": "关",

	"generic.text": "文字",

	"generic.lorem": false
		? "半刃冒或平原家不合拉穿書背連三呀念鼻細。"
		: "半刃冒或平原家不合拉穿書背連三呀念鼻細。美坐給休朋南往像男天記哪交。黑聲士、人帶裏穿澡抱長，呢魚起歡在寸樹反旁月清害！目麻才給乾布果位車八半泉乾空主丟音肖。喝羊北。",

	"generic.none_selected": "（无）",

	"generic.input_file": "输入档案",
});