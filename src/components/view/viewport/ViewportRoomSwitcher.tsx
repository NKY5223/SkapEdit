import { ID } from "@common/uuid.ts";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { SkapMap } from "@editor/map.ts";
import { FC, memo, useMemo } from "react";

type RoomSelectProps = {
	map: SkapMap;
	value: ID | null;
	onInput: (value: ID) => void;
};
export const RoomSelect: FC<RoomSelectProps> = memo(({
	map,
	value,
	onInput,
}) => {
	const options = useMemo(() =>
		map.rooms.entries()
			.map(([id, room]) => makeOption(
				`option-${id}`,
				id,
				(room.name)
			))
			.toArray(),
		[map.rooms]
	);
	return (
		<DropdownSelect<ID | null>
			value={value}
			options={options}
			onInput={value => {
				if (value === null) return;
				onInput(value);
			}}
			fallbackLabel={<Translate k="viewport.room_fallback" />}
		/>
	);
}, (prev, next) => {
	if (!Object.is(prev.value, next.value)) return false;
	if (!Object.is(prev.map, next.map)) return false;
	return true;
});

RoomSelect.displayName = "ViewportRoomSwitcher";