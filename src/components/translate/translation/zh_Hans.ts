import { delegateOn, makeTranslator } from "../translate.ts";
import { TranslationArgs } from "../translationArgs.ts";

// the translations are terrible im just testing the system

const delegate = delegateOn<TranslationArgs>(".");
export const translator_zh_Hans = makeTranslator<TranslationArgs>({
	"error.layout.view.unknown": ({ viewProviderName }) => ["没有此ViewProvider：", viewProviderName],

	// #region Layout
	"layout": "布局",
	"layout.view.fallback": "不明",

	"layout.view.category.name": delegate("layout.view.category.name", "category"),
	"layout.view.name": delegate("layout.view.name", "view"),

	"layout.view.category.name.test": "测试",
	"layout.view.name.test.swatch": "主题测试",
	"layout.view.name.test.error": "错误测试",
	"layout.view.name.test.translate.lorem": (_, translate) => translate("generic.lorem", {}),
	"layout.view.name.test.empty": "空",

	"layout.view.category.name.map": "地图",
	"layout.view.name.map.inspector": "Inspector",
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
	"contextmenu.item.name.viewport": "视口",
	"contextmenu.item.name.viewport.reset_camera": "重置相机",

	// #endregion
	
	"topbar.file": "文件",
	"contextmenu.item.name.topbar.file.save": "保存",

	"generic.position.x": "X位置",
	"generic.position.y": "Y位置",
	"generic.position.left": "左",
	"generic.position.top": "顶",
	"generic.position.right": "右",
	"generic.position.bottom": "底",
	"generic.position.width": "宽",
	"generic.position.height": "高",

	"generic.text": "文本",

	"generic.lorem": true
		? "半刃冒或平原家不合拉穿書背連三呀念鼻細。"
		: "半刃冒或平原家不合拉穿書背連三呀念鼻細。美坐給休朋南往像男天記哪交。黑聲士、人帶裏穿澡抱長，呢魚起歡在寸樹反旁月清害！目麻才給乾布果位車八半泉乾空主丟音肖。喝羊北。",
});