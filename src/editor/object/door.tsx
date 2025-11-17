import { ID } from "@common/uuid.ts";
import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { CheckboxInput } from "@components/form/CheckboxInput.tsx";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { TableInput } from "@components/form/TableInput.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";

type Connection = {
	objectId: ID;
	hidden: boolean;
	invert: boolean;
};

export type SkapDoor = BaseObject<"door", {
	bounds: Bounds;
	connections: readonly Connection[];
}>;

export const doorProperties = makeObjectProperties<SkapDoor>("door", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => 9,
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
			const { type, id, bounds, connections } = object;
			const map = useSkapMap();
			const dispatchMap = useDispatchSkapMap();
			const room = map.rooms.values().find(r => r.objects.has(id));
			if (!room) return "Error: could not find room of door";

			const update = (f: (obj: SkapDoor) => SkapDoor) => dispatchMap({
				type: "replace_object",
				target: id,
				replacement: obj => obj.type !== type ? obj : f(obj),
			});
			const updateConnection = (i: number, f: (connection: Connection) => Connection) => update(obj => ({
				...obj,
				connections: obj.connections.with(i, f(obj.connections[i]))
			}));
			const inputs = room.objects.values()
				.filter(obj => obj.type === "button" /* || obj.type === "switch" */)
				.toArray();

			return (
				<>
					<h2><Translate k="object.name" type={type} /></h2 >
					<FormSection>
						<FormTitle><Translate k="generic.position" /></FormTitle>
						<BoundsInput value={bounds} onInput={bounds => update(obj => ({ ...obj, bounds }))} />
					</FormSection>
					<TableInput value={connections}
						details={(connection, i) => {
							const { objectId, hidden, invert } = connection;
							return (<>
								<DropdownSelect value={objectId}
									options={inputs.map(obj =>
										makeOption(obj.id, obj.id, (<>Button '{obj.name}'</>))
									)}
									onInput={objectId => updateConnection(i, c => ({ ...c, objectId }))}
									fallbackLabel={"Unknown"}
								/>
								<FormSection row>
									<CheckboxInput value={hidden}
										onInput={hidden => updateConnection(i, c => ({ ...c, hidden }))}
										label={"Hidden"}
									/>
									<CheckboxInput value={invert}
										onInput={invert => updateConnection(i, c => ({ ...c, invert }))}
										label={"Invert"}
									/>
								</FormSection>
							</>);
						}}
						summary={connection => {
							const { objectId, hidden, invert } = connection;
							const input = room.objects.get(objectId);
							const name = !input || input.type !== "button" /* && input.type !== "switch" */
								? (<em>??</em>)
								: (<>Button '{input.name}'</>);
							return [
								name,
								hidden ? "Hidden" : "Visible",
								invert ? "Inverted" : "Normal",
							];
						}}
						addItem={() => update(obj => ({
							...obj, connections: [...obj.connections, {
								objectId: inputs[0]?.id ?? id,
								hidden: false,
								invert: false,
							}]
						}))}
					/>
					{/* <pre>{JSON.stringify(connections, null, "\t")}</pre> */}
				</>
			);
		}
	}
});