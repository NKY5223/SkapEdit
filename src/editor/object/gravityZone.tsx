import { mod } from "@common/number.ts";
import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { CardinalDirectionInput } from "@components/form/CardinalDirectionInput.tsx";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, CardinalDirection, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

export type SkapGravityZone = BaseObject<"gravityZone", {
	bounds: Bounds;
	direction: {
		type: "cardinal";
		direction: CardinalDirection;
	} | {
		type: "free";
		/** Direction, in degrees. 0 = down, 90 = left, etc. */
		direction: number;
	}
}>;

export const gravityZoneProperties = makeObjectProperties<SkapGravityZone>("gravityZone", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => 20,
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
			const dispatchMap = useDispatchSkapMap();
			const { type, id, bounds, direction } = object;
			return (
				<>
					<h2><Translate k="object.name.gravityZone" /></h2>
					<FormSection>
						<FormTitle><Translate k="generic.position" /></FormTitle>
						<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
							type: "replace_object",
							target: id,
							replacement: obj => ({ ...obj, bounds })
						})} />
						<FormTitle><Translate k="generic.direction" /></FormTitle>
						<FormSection row>
							<DropdownSelect<SkapGravityZone["direction"]["type"]> value={direction.type}
								options={[
									makeOption("cardinal", "cardinal", <Translate k="generic.direction.cardinal" />),
									makeOption("free", "free", <Translate k="generic.direction.free" />),
								]}
								onInput={type => dispatchMap({
									type: "replace_object",
									target: id,
									replacement: obj => (obj.type === "gravityZone" ? {
										...obj, direction:
											convertGravityZoneDirection(
												"direction" in obj
													? obj.direction
													: object.direction,
												type
											),
									} : obj)
								})}
							/>
							{object.direction.type === "cardinal"
								? (<CardinalDirectionInput value={object.direction.direction}
									onInput={dir => dispatchMap({
										type: "replace_object",
										target: id,
										replacement: obj => (obj.type === "gravityZone" ? {
											...obj, direction: {
												type: "cardinal",
												direction: dir,
											}
										} : obj)
									})}
								/>)
								: (<>
									<NumberInput value={object.direction.direction}
										label={<Icon icon="360" />}
										min={0} max={360} step={1}
										onInput={dir => dispatchMap({
											type: "replace_object",
											target: id,
											replacement: obj => (obj.type === "gravityZone" ? {
												...obj, direction: {
													type: "free",
													direction: dir,
												}
											} : obj)
										})}
									/>°
								</>)}
						</FormSection>
					</FormSection>
				</>
			);
		}
	}
});

const toCardinalDirection = (dir: number): CardinalDirection => {
	if (dir === 0 || dir === 1 || dir === 2 || dir === 3) return dir;
	return 0;
}

export const convertGravityZoneDirection = (direction: SkapGravityZone["direction"], type: SkapGravityZone["direction"]["type"]):
	SkapGravityZone["direction"] => {
	if (direction.type === type) return direction;
	if (type === "cardinal") {
		return {
			type,
			direction: toCardinalDirection(mod(Math.round(direction.direction / 90), 4)),
		};
	}
	return {
		type,
		direction: direction.direction * 90
	};
}