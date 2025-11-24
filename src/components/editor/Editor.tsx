import { Topbar } from "@components/editor/topbar/Topbar.tsx";
import { LayoutRoot } from "@components/layout/Layout.tsx";
import { SettingsMenu } from "@components/settings/Settings.tsx";
import { FC, useEffect, useEffectEvent, useState } from "react";
import { changelog } from "./changelog/changelog.ts";
import { Changelog } from "./changelog/Changelog.tsx";
import css from "./Editor.module.css";
import { useSkapMap } from "@editor/reducer.ts";

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	const map = useSkapMap();
	const [openChangelog, setOpenChangelog] = useState(() => () => console.error("Did not set open changelog"));
	const [openSettings, setOpenSettings] = useState(() => () => console.error("Did not set open settings"));

	const onUnload = useEffectEvent((e: BeforeUnloadEvent) => {
		if (map.edited) e.preventDefault();
	});

	useEffect(() => {
		window.addEventListener("beforeunload", onUnload);
		return () => window.removeEventListener("beforeunload", onUnload);
	}, []);

	return (
		<>
			<title>{import.meta.env.DEV ? `🛠 SkapEdit (DEV)` : `SkapEdit`}</title>
			<div className={css["editor"]}>
				<Topbar openChangelog={openChangelog} openSettings={openSettings} />
				<LayoutRoot />
				<Changelog changelog={changelog} setOpen={setOpenChangelog} />
				<SettingsMenu setOpen={setOpenSettings} />
			</div>
		</>
	);
}