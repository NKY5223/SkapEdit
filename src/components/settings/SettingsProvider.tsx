import { FC, PropsWithChildren, useState } from "react";
import { defaultSettings, Settings, settingsContext, SettingsSchema } from "./settings.ts";
import { maybeConst } from "@common/maybeConst.ts";
import "./testing.ts";

type SettingsProviderProps = {
	localStorageKey: string;
};
export const SettingsProvider: FC<PropsWithChildren<SettingsProviderProps>> = ({
	localStorageKey,
	children,
}) => {
	const [settings, setSettingsInternal] = useState<Settings>(() => {
		const local = localStorage.getItem(localStorageKey);
		const json = local
			? JSON.parse(local)
			: {};
		const result = SettingsSchema.safeParse(json);
		if (result.success) {
			return result.data;
		} else {
			console.error("Error parsing settings:", result.error);
			return defaultSettings;
		}
	});
	const setSettings: typeof setSettingsInternal = action => {
		setSettingsInternal(settings => {
			const newSettings = maybeConst(action, settings);
			// console.log("Update settings", newSettings);
			localStorage.setItem(localStorageKey, JSON.stringify(newSettings));
			return newSettings;
		});
	}
	return (
		<settingsContext.Provider value={[settings, setSettings]}>
			{children}
		</settingsContext.Provider>
	);
}