import { ID } from "@common/uuid.ts";
import { useBaseTranslationString } from "./translate.ts";
import { SkapTeleporter } from "@editor/object/teleporter.ts";
import { SkapRoom } from "@editor/map.ts";

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
	"contextmenu.item.name.viewport.add_object": {};
	"contextmenu.item.name.viewport.add_object.obstacle": {};
	"contextmenu.item.name.viewport.add_object.lava": {};
	"contextmenu.item.name.viewport.add_object.slime": {};
	"contextmenu.item.name.viewport.add_object.ice": {};
	"contextmenu.item.name.viewport.add_object.text": {};
	// #endregion

	// #region Viewport
	"viewport.no_room_selected": {};
	"viewport.no_room_with_id": { id: ID; };
	"viewport.room_fallback": {};
	// #endregion

	// #region Topbar
	"topbar.app": {};
	"contextmenu.item.name.topbar.app.settings": {};
	"contextmenu.item.name.topbar.app.changelog": {};
	"contextmenu.item.name.topbar.app.test_toast": {};
	"topbar.file": {};
	"contextmenu.item.name.topbar.file.save": {};
	"contextmenu.item.name.topbar.file.export_skap": {};
	"contextmenu.item.name.topbar.file.import_skap": {};
	// #endregion

	// #region Settings
	"settings": {};
	"settings.language": {};
	// #endregion

	// #region Changelog
	"changelog": {};
	"changelog.version-title": { version: string; time?: Date; };
	"changelog.current-build": {
		mode: string;
		version: string;
		github: {
			repoOwner: string;
			repoName: string;
			repoUrl: string;
			commitSha: string;
			commitUrl: string;
		} | null;
	};
	// #endregion

	// #region Objects
	"object.name": { type: string; };
	"object.name.obstacle": {};
	"object.name.lava": {};
	"object.name.slime": {};
	"object.name.ice": {};
	"object.name.text": {};
	"object.name.block": {};
	"object.name.gravityZone": {};
	"object.name.teleporter": {};
	"object.name.spawner": {};
	
	"object.teleporter.name": { object: SkapTeleporter; room: SkapRoom; };
	// #endregion
	
	// #region Room
	"room": {};
	// #endregion

	// #region Map Import
	"import.message": { message: string; object?: string; room?: string; };
	"import.message.no_spawn_room": { message: string; object?: string; room?: string; };
	"import.message.broken_teleporter": { message: string; object?: string; room?: string; };
	"import.message.single_teleporter": { message: string; object?: string; room?: string; };
	// #endregion

	"generic.position": {};
	"generic.position.x": {};
	"generic.position.y": {};
	"generic.position.left": {};
	"generic.position.top": {};
	"generic.position.right": {};
	"generic.position.bottom": {};
	"generic.position.width": {};
	"generic.position.height": {};

	"generic.direction": {};
	"generic.direction.down": {};
	"generic.direction.left": {};
	"generic.direction.right": {};
	"generic.direction.up": {};
	"generic.direction.cardinal": {};
	"generic.direction.free": {};

	"generic.action.open": {};
	"generic.action.close": {};

	"generic.list_string": { strings: string[]; };

	"generic.text": {};
	"generic.lorem": {};
	"generic.none_selected": {};
};

type EmptyKeys<T, K extends keyof T = keyof T> = K extends K
	? T[K] extends {} ? K : never
	: never;

export const useTranslate = () => {
	const base = useBaseTranslationString<TranslationArgs>();
	function translate<K extends EmptyKeys<TranslationArgs>>(key: K): string;
	function translate<K extends keyof TranslationArgs>(key: K, args: TranslationArgs[K]): string;
	function translate<K extends keyof TranslationArgs>(key: K, args?: TranslationArgs[K]): string {
		if (args === undefined) {
			// @ts-expect-error satisfies overload so it's fine
			return base(key, {});
		}
		return base(key, args);
	}
	return translate;
}