import { KeyboardEventHandler } from "react";

export type Keybind = {
	/** Should be from {@linkcode KeyboardEvent.code}. */
	key: string;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	meta: boolean;
};

export const keybindStr = (str: string): Keybind => {
	const matches = str.match(/^(?<ctrl>ctrl\+)?(?<shift>shift\+)?(?<alt>alt\+)?(?<meta>meta\+)?(?<key>.+)$/);
	if (!matches) throw new Error(`Invalid keybind ${str}`);
	if (!matches.groups) throw "??";
	const { ctrl, shift, alt, meta, key } = matches.groups;
	return {
		key: key,
		ctrl: !!ctrl,
		shift: !!shift,
		alt: !!alt,
		meta: !!meta,
	};
}

type KeyboardEventish = Pick<KeyboardEvent, "code" | `${string}Key` & keyof KeyboardEvent>;

export const keybindMatches = (event: KeyboardEventish, keybind: Keybind) => {
	const { code, ctrlKey, shiftKey, altKey, metaKey } = event;
	const { key, ctrl, shift, alt, meta } = keybind;
	return key === code
		&& ctrl === ctrlKey
		&& shift === shiftKey
		&& alt === altKey
		&& meta === metaKey;
}

type Hotkey = [
	keybind: Keybind | Keybind[],
	handler: (event: React.KeyboardEvent) => void,
	options?: {
		preventDefault?: boolean;
		stopPropagation?: boolean;
	}
];

export const hotkeysHandler = (hotkeys: Hotkey[]): KeyboardEventHandler => (
	event => {
		for (const [keybinds, onKeybind, options] of hotkeys) {
			const matches =
				Array.isArray(keybinds)
					? keybinds.some(k => keybindMatches(event, k))
					: keybindMatches(event, keybinds);
			if (!matches) continue;
			if (options) {
				if (options.preventDefault) event.preventDefault();
				if (options.stopPropagation) event.stopPropagation();
			}
			onKeybind(event);
		}
	}
);