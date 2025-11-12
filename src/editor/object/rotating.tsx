import { Color } from "@common/color.ts";
import { Vec2 } from "@common/vec2.ts";
import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { CheckboxInput } from "@components/form/CheckboxInput.tsx";
import { ColorInput } from "@components/form/ColorInput.tsx";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { SkapObject } from "@editor/map.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

type Rotating<T extends string> = BaseObject<T, {
	bounds: Bounds;
	rotation: {
		center: Vec2;
		/** Initial angle, in degrees clockwise */
		initial: number;
		/** Rotation speed, in degrees/second clockwise */
		speed: number;
	}
}>;

const rotatingProperties = <T extends Rotating<string>>(type: T["type"], zIndex: number) =>
	makeObjectProperties<T>(type, {
		bounds: obj => obj.bounds,
		selection: {
			zIndex: obj => zIndex,
			clickbox: (obj, pos) => obj.bounds.contains(pos),
		},
		transform: {
			affine: (obj, scale, translate) => ({
				...obj,
				bounds: obj.bounds.affine(scale, translate),
				rotation: {
					...obj.rotation,
					center: obj.rotation.center.mul(scale).add(translate),
				}
			}),
		},
		inspector: {
			Component: ({ object }) => {
				const dispatchMap = useDispatchSkapMap();
				const update = (f: (val: T) => T) => dispatchMap({
					type: "replace_object",
					target: id,
					replacement: obj => obj.type === type ? f(obj as T) as SkapObject : obj,
				});
				const { type, id, bounds, rotation: { center, initial, speed } } = object;
				return (
					<>
						<h2>Rotating Lava</h2>
						<FormSection>
							<FormTitle><Translate k="generic.position" /> </FormTitle>
							<BoundsInput bounds={bounds} setBounds={bounds =>
								update(obj => ({ ...obj, bounds }))
							} />
						</FormSection>
						<FormTitle>Rotation</FormTitle>
						<Vec2Input vec={center} setVec={center =>
							update(obj => ({ ...obj, rotation: { ...obj.rotation, center } }))
						} />
						<FormSection row>
							<NumberInput value={initial} min={0} max={360} onInput={initial =>
								update(obj => ({ ...obj, rotation: { ...obj.rotation, initial } }))}
								label={"Initial Angle"}
							/>°
						</FormSection>
						<FormSection row>
							<NumberInput value={speed} onInput={speed =>
								update(obj => ({ ...obj, rotation: { ...obj.rotation, speed } }))}
								label={"Speed"}
							/>°/s
						</FormSection>
					</>
				);
			}
		}
	});

export type SkapRotatingObstacle = Rotating<"rotatingObstacle">;
export const rotatingObstacleProperties = rotatingProperties<SkapRotatingObstacle>("rotatingObstacle", 2.5);

export type SkapRotatingLava = Rotating<"rotatingLava">;
export const rotatingLavaProperties = rotatingProperties<SkapRotatingLava>("rotatingLava", 4.5);

export type SkapRotatingSlime = Rotating<"rotatingSlime">;
export const rotatingSlimeProperties = rotatingProperties<SkapRotatingSlime>("rotatingSlime", 6.5);

export type SkapRotatingIce = Rotating<"rotatingIce">;
export const rotatingIceProperties = rotatingProperties<SkapRotatingIce>("rotatingIce", 5.5);