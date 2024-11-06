import { dark } from "./dark.ts";

type ThemeKey = [
	"background", "foreground",
	"primary", "secondary", "disabled",
	"yes", "no",
	"font",
	"borderWidth", "borderRadius",
	`seperator${0 | 1 | 2 | 3}`
][number];
export type Theme = Partial<Record<ThemeKey, string>>;

const themeNameMap = new Map<ThemeKey, string>([
	["borderWidth", "border-width"],
	["borderRadius", "border-radius"],
	["seperator0", "seperator-0"],
	["seperator1", "seperator-1"],
	["seperator2", "seperator-2"],
	["seperator3", "seperator-3"],
] as const);

const styleID = "theme-style";
function getThemeStyleElement(): HTMLStyleElement {
	const get = document.querySelector(`style#${styleID}`);
	if (get instanceof HTMLStyleElement) return get;

	const style = document.createElement("style");
	style.id = styleID;
	document.head.append(style);

	return style;
}
const style = getThemeStyleElement();

export function themeString(theme: Theme): string {
	return `:root {\n\t${Object.entries(theme).map(([key, value]) => 
		`--theme-${themeNameMap.get(key as ThemeKey) ?? key}: ${value};`
	).join("\n\t")}\n}`;
}

export function setTheme(theme: Theme) {
	style.innerHTML = themeString(theme);
}

export const themes = new Map<string, Theme>();
themes.set("dark", dark);