import { Dispatch, FC } from "react";
import { ViewportAction } from "./Viewport.tsx";
import { ID } from "@common/uuid.ts";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { SkapMap } from "@editor/map.ts";

type ViewportRoomSwitcherProps = {
	dispatchView: Dispatch<ViewportAction>;
	map: SkapMap;
	selectedRoom: ID | null;
};
export const ViewportRoomSwitcher: FC<ViewportRoomSwitcherProps> = ({
	dispatchView,
	map,
	selectedRoom,
}) => {
	return (
		<DropdownSelect<ID | null>
			options={
				map.rooms.entries()
					.map(([id, room]) => makeOption(
						`option-${id}`,
						id,
						(room.name),
					))
					.toArray()
			} initialValue={selectedRoom}
			onSelect={value => dispatchView({
				type: "set_current_room_id",
				currentRoomId: value,
			})}
			fallbackLabel={"(none)"}
		/>
	);
}