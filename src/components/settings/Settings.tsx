import { useTranslate } from "@components/translate/translationArgs.ts";
import { FC, useEffect, useId, useRef } from "react";
import css from "./Settings.module.css";
import { Settings, useSetSetting, useSettings, useSettingsWithSet } from "./settings.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { Translate } from "@components/translate/Translate.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { languages } from "@components/translate/languages.ts";

type SettingsProps = {
	setOpen: (open: () => void) => void;
};
export const SettingsMenu: FC<SettingsProps> = ({
	setOpen
}) => {
	const settings = useSettings();
	const setSetting = useSetSetting();

	const id = useId();
	const ref = useRef<HTMLDivElement>(null);
	const translate = useTranslate();

	useEffect(() => {
		const popover = ref.current;
		if (!popover) return;

		setOpen(() => () => popover.showPopover());
	}, [ref.current]);

	return (
		<div id={id} ref={ref} className={css["settings"]} popover="auto">
			<button className={css["close-button"]} title={translate("generic.action.close")}
				popoverTarget={id} popoverTargetAction="hide"
			></button>
			<h3><Translate k="settings" /></h3>
			<FormSection>
				<FormSection row>
					<Translate k="settings.language" />
					<DropdownSelect<Settings["language"]>
						initialValue={settings.language}
						options={languages.map(l => makeOption(l.code, l.code, l.name))}
						onSelect={value => setSetting("language", value)}
					/>
				</FormSection>
			</FormSection>
		</div>
	);
}