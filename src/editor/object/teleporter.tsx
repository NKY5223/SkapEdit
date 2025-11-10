import { ID } from "@common/uuid.ts";
import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { CardinalDirectionInput } from "@components/form/CardinalDirectionInput.tsx";
import { makeOption, makeOptionSection } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { CardinalDirection } from "./Base.tsx";

export type SkapTeleporter = BaseObject<"teleporter", {
	bounds: Bounds;
	target: null | {
		type: "room";
		roomId: ID;
	} | {
		type: "teleporter";
		teleporterId: ID;
	};
	direction: CardinalDirection;
}>;

export const teleporterProperties = makeObjectProperties<SkapTeleporter>("teleporter", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => 3,
		clickbox: (obj, pos) => obj.bounds.contains(pos),
	},
	transform: {
		affine: (obj, scale, translate) => ({
			...obj,
			bounds: obj.bounds.affine(scale, translate)
		}),
	},
	inspector: {
		Component: ({ object }) => {
			const map = useSkapMap();
			const dispatchMap = useDispatchSkapMap();
			const { type, id, bounds, direction, target } = object;

			const targetSelector = target === null
				? "null target"
				: target.type === "room"
					? "room target"
					: (
						<DropdownSelect initialValue={target.teleporterId}
							options={map.rooms.values().map(room => makeOptionSection(
								room.id, room.name, null,
								room.objects.values().filter(obj => obj.type === "teleporter")
									.map((tp) => makeOption(
										tp.id, tp.id,
										<Translate k="object.teleporter.name" object={tp} room={room} />
									)).toArray()
							)).toArray()}
							nowrap />
					);
			return (
				<>
					<h2><Translate k="object.name.teleporter" /></h2>
					<FormSection>
						<FormTitle><Translate k="generic.position" /></FormTitle>
						<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
							type: "replace_object",
							target: id,
							replacement: obj => ({ ...obj, bounds })
						})} />
					</FormSection>
					<FormSection row>
						<CardinalDirectionInput value={direction}
							onInput={dir => dispatchMap({
								type: "replace_object",
								target: id,
								replacement: obj => (obj.type === "teleporter" ? {
									...obj, direction: dir,
								} : obj)
							})}
						/>
					</FormSection>
					{targetSelector}
				</>
			);
		}
	}
});