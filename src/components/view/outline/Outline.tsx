import { Layout, makeStatelessViewProvider } from "@components/layout/layout.ts";
import css from "./Outline.module.css";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { useSkapMap } from "@editor/reducer.ts";
import { Translate } from "@components/translate/Translate.tsx";
import { makeObjectSelectionItem, useDispatchSelection, useEditorSelection } from "@components/editor/selection.ts";
import { toClassName } from "@components/utils.tsx";
import { FC, MouseEventHandler, ReactNode, useState } from "react";
import { SkapObject } from "@editor/map.ts";
import { Icon } from "@components/icon/Icon.tsx";

const Outline: Layout.ViewComponent = ({
	viewSwitcher,
}) => {
	const map = useSkapMap();
	const selection = useEditorSelection();
	const dispatchSelection = useDispatchSelection();
	const lastSelection = selection.at(-1);
	const selectObject = (obj: SkapObject) => dispatchSelection({
		type: "set_selection",
		selection: [makeObjectSelectionItem(obj)],
	});
	const addSelectObject = (obj: SkapObject) => dispatchSelection({
		type: "add_item",
		item: makeObjectSelectionItem(obj),
	});

	const roomComps = map.rooms.values().map(room => {
		const { id, name, objects } = room;
		const objectComps = objects.values().map(object => {
			const { id } = object;
			const selected = selection.some(s => s.type === "object" && s.id === id);
			const last = lastSelection?.type === "object" && lastSelection.id === id;

			const onClick: MouseEventHandler = e => {
				if (e.ctrlKey) {
					addSelectObject(object);
					return;
				}
				selectObject(object);
			}

			const className = toClassName(
				css["object"],
				selected && css["selected"],
				last && css["last"],
			);
			return (
				<div key={id} className={className} onClick={onClick}>
					<Translate k="object.individual_name" {...{ object, room, map }} />
				</div>
			);
		}).toArray();

		const selected = selection.some(s => s.type === "room" && s.id === id);
		const last = lastSelection?.type === "room" && lastSelection.id === id;
		const classList = [
			css["room"],
			selected && css["selected"],
			last && css["last"],
		].filter(s => s !== false);
		return (
			<Details key={id} classList={classList}>
				<div className={css["room-summary"]}>
					{name} ({objects.size})
				</div>
				<div className={css["room-objects"]}>
					{objectComps}
				</div>
			</Details>
		);
	}).toArray();
	return (
		<div className={css["outline"]}>
			<ViewToolbar>{viewSwitcher}</ViewToolbar>
			<Details classList={css["rooms"]}>
				<div>{map.name} ({map.rooms.size})</div>
				{roomComps}
			</Details>
		</div>
	);
}


type DetailsProps = {
	children: [summary: ReactNode, content: ReactNode];
	classList?: false | null | undefined | string | string[];
};
const Details: FC<DetailsProps> = ({
	children: [summary, content],
	classList,
}) => {
	const [open, setOpen] = useState(false);
	const className = toClassName(
		css["details"],
		open && css["open"],
		classList,
	);
	const toggle = () => {
		setOpen(o => !o);
	};
	return (
		<div className={className}>
			<div className={css["summary"]} tabIndex={0}
				onKeyDown={e => {
					if (e.code === "Space" || e.code === "Enter") toggle();
				}}
			>
				<div className={css["arrow"]}
					onClick={toggle}>
					<Icon icon={open ? "arrow_drop_down" : "arrow_right"} size={1.25} />
				</div>
				{summary}
			</div>
			{open && <div className={css["details-content"]}>{content}</div>}
		</div>
	);
}

export const OutlineVP = makeStatelessViewProvider({
	name: "map.outline",
	icon: "account_tree",
	Component: Outline,
});