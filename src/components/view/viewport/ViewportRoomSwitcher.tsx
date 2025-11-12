import { Dispatch, FC } from "react";
import { ViewportAction } from "./Viewport.tsx";
import { ID } from "@common/uuid.ts";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { SkapMap } from "@editor/map.ts";
import { Translate } from "@components/translate/Translate.tsx";
import { useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { useDispatchSelection } from "@components/editor/selection.ts";

type ViewportRoomSwitcherProps = {
	dispatchView: Dispatch<ViewportAction>;
	selectedRoom: ID | null;
};
export const ViewportRoomSwitcher: FC<ViewportRoomSwitcherProps> = ({
	dispatchView,
	selectedRoom,
}) => {
	const map = useSkapMap();
	const dispatchSelection = useDispatchSelection();
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
			} value={selectedRoom}
			onInput={value => {
				dispatchView({
					type: "set_current_room_id",
					currentRoomId: value,
				});
				dispatchSelection({
					type: "clear_selection",
				});
			}}
			fallbackLabel={<Translate k="viewport.room_fallback" />}
			nowrap
		/>
	);
}