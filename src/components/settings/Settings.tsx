import { useTranslate } from "@components/translate/translationArgs.ts";
import { FC, useEffect, useId, useRef } from "react";
import css from "./Settings.module.css";
import { Settings, useSetSetting, useSettings, useSettingsWithSet } from "./settings.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { Translate } from "@components/translate/Translate.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { languages } from "@components/translate/languages.ts";
import { Icon } from "@components/icon/Icon.tsx";

type SettingsProps = {
	setOpen: (open: () => void) => void;
};
export const SettingsMenu: FC<SettingsProps> = ({
	setOpen
}) => {
	const settings = useSettings();
	const setSetting = useSetSetting();

	const ref = useRef<HTMLDialogElement>(null);
	const translate = useTranslate();

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;

		setOpen(() => () => dialog.showModal());
	}, [ref.current]);

	return (
		<dialog ref={ref} className={css["settings"]}>
			<button className={css["close-button"]} title={translate("generic.action.close")}
				onClick={() => {
					const dialog = ref.current;
					if (!dialog) return;

					dialog.requestClose();
				}}
			><Icon icon="close" /></button>
			<h3><Translate k="settings" /></h3>
			<FormSection>
				<FormSection row>
					<Translate k="settings.language" />
					<DropdownSelect<Settings["language"]>
						value={settings.language}
						options={languages.map(l => makeOption(l.code, l.code, l.name))}
						onInput={value => setSetting("language", value)}
					/>
				</FormSection>
			</FormSection>
		</dialog>
	);
}