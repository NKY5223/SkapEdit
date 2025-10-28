import { useBaseTranslationString } from "./translate.ts";

export type TranslationArgs = {
	// #region Layout
	"error.layout.view.unknown": { viewProviderName: string; };

	"layout": {};
	"layout.view.fallback": {};
	"layout.view.name": { "view": string; };
	"layout.view.category.name": { "category": string; };

	"layout.view.category.name.test": {};
	"layout.view.name.test.swatch": {};
	"layout.view.name.test.error": {};
	"layout.view.name.test.translate.lorem": {};
	"layout.view.name.test.empty": {};

	"layout.view.category.name.map": {};
	"layout.view.name.map.inspector": {};
	"layout.view.name.map.viewport": {};
	// #endregion

	// #region Context Menu
	"contextmenu.item.name": { "name": string; };
	"contextmenu.item.name.layout": {};
	"contextmenu.item.name.layout.split-x": {};
	"contextmenu.item.name.layout.split-y": {};

	"contextmenu.item.name.layout.dissolve-left": {};
	"contextmenu.item.name.layout.dissolve-right": {};
	"contextmenu.item.name.layout.dissolve-up": {};
	"contextmenu.item.name.layout.dissolve-down": {};

	"contextmenu.item.name.layout.swap-x": {};
	"contextmenu.item.name.layout.swap-y": {};
	"contextmenu.item.name.viewport": {};
	"contextmenu.item.name.viewport.reset_camera": {};

	// #endregion
	
	"topbar.file": {};
	"contextmenu.item.name.topbar.file.save": {};

	"generic.position.x": {};
	"generic.position.y": {};
	"generic.position.left": {};
	"generic.position.top": {};
	"generic.position.right": {};
	"generic.position.bottom": {};
	"generic.position.width": {};
	"generic.position.height": {};
	"generic.text": {};
	"generic.lorem": {};
};

type EmptyKeys<T, K extends keyof T = keyof T> = K extends K 
	? T[K] extends {} ? K : never
	: never;

export const useTranslation = () => {
	const base = useBaseTranslationString<TranslationArgs>();
	function translate<K extends EmptyKeys<TranslationArgs>>(key: K): string;
	function translate<K extends keyof TranslationArgs>(key: K, args: TranslationArgs[K]): string;
	function translate<K extends keyof TranslationArgs>(key: K, args?: TranslationArgs[K]): string {
		if (args === undefined) {
			return base(key, {} as never);
		}
		return base(key, args);
	}
	return translate;
}