import { createContext, Dispatch, SetStateAction, useContext } from "react";
import * as z from "zod";

const Language = z.literal(["en-US", "zh-Hans"]).default("en-US");
const Theme = z.literal(["dark", "light"]).default("dark");
const Grid = z.number().default(5);

// All values should be optional.
// Updating an entry should only be done via widening its type.
// This ensures upgrading versions does NOT throw an error.
// BEFORE ADDING SOMETHING, MAKE A COPY OF YOUR OWN SETTINGS TO ENSURE IT UPGRADES PROPERLY
// ^ reminder for nky
export const SettingsSchema = z.object({
	language: Language,
	theme: Theme,
	grid: Grid,
});
export type Settings = z.infer<typeof SettingsSchema>;
export const defaultSettings: Settings = SettingsSchema.parse({});

type SettingsContextType = [
	settings: Settings,
	setSettings: Dispatch<SetStateAction<Settings>>
];
export const settingsContext = createContext<SettingsContextType | null>(null);
Object.assign(settingsContext.Provider, { name: "SettingsProvider" });

export const useSettingsWithSet = (): SettingsContextType => {
	const val = useContext(settingsContext);
	if (!val) throw new Error("Cannot use settings without a settings provider.");
	return val;
}
export const useSettings = (): Settings => {
	const [settings,] = useSettingsWithSet();
	return settings;
}
export const useSetting = <K extends keyof Settings>(key: K): Settings[K] => {
	const [settings,] = useSettingsWithSet();
	return settings[key];
}
export const useSetSetting = () => {
	const [, setSettings] = useSettingsWithSet();
	return <K extends keyof Settings>(key: K, value: Settings[K]) => {
		setSettings(settings => ({ ...settings, [key]: value }));
	}
}