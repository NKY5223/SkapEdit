import { FC, Fragment, useEffect, useRef } from "react";
import { ChangelogEntry } from "./changelog.ts";
import css from "./Changelog.module.css";
import { RichTextComponent } from "@components/translate/RichText.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { Icon } from "@components/icon/Icon.tsx";

type ChangelogProps = {
	changelog: ChangelogEntry[];
	setOpen: (open: () => void) => void;
};
export const Changelog: FC<ChangelogProps> = ({
	changelog, setOpen,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const translate = useTranslate();

	useEffect(() => {
		const popover = ref.current;
		if (!popover) return;
		setOpen(() => () => popover.showPopover());
	}, [ref.current]);

	return (
		<div ref={ref} className={css["changelog"]} popover="auto">
			<button className={css["close-button"]} title={translate("generic.action.close")} onClick={() => {
				ref.current?.hidePopover();
			}}>
				<Icon icon="close" />
			</button>
			<h2><Translate k="changelog" /></h2>
			{changelog.map((entry, i) => (
				<div key={i}>
					<h3><Translate k="changelog.version-name-time" version={entry.version} time={entry.time} /></h3>
					<p><RichTextComponent text={entry.message} /></p>
				</div>
			))}
		</div>
	)
}