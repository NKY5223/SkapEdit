import { Vec2 } from "@common/vec2.ts";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

type Circular<T extends string> = BaseObject<T, {
	pos: Vec2;
	radius: number;
}>;

export const circleBounds = (pos: Vec2, radius: number) => new Bounds({ topLeft: pos.sub(radius), bottomRight: pos.add(radius) });

const circularProperties = <T extends Circular<string>>(type: T["type"], zIndex: number) =>
	makeObjectProperties<T>(type, {
		bounds: obj => circleBounds(obj.pos, obj.radius),
		selection: {
			zIndex: () => zIndex,
			clickbox: (obj, pos) => obj.pos.sub(pos).mag() <= obj.radius,
		},
		transform: {
			affine: (obj, scale, translate) => ({
				...obj,
				pos: obj.pos.mul(scale).add(translate),
				radius: Math.min(...scale.mul(obj.radius)),
			}),
		},
		inspector: {
			Component: ({ object }) => {
				const dispatchMap = useDispatchSkapMap();
				const update = (f: (val: T) => T) => dispatchMap({
					type: "replace_object",
					target: id,
					// @ts-expect-error
					replacement: obj => obj.type === type ? f(obj) : obj,
				});
				const { type, id, pos, radius } = object;
				return (
					<>
						<h2>Circular Lava</h2>
						<FormSection>
							<FormTitle><Translate k="generic.position" /> </FormTitle>
							<Vec2Input value={pos}
								onInput={position => update(obj => ({ ...obj, pos: position }))}
							/>
							<NumberInput value={radius}
								min={0}
								onInput={radius =>
									update(obj => ({ ...obj, radius }))}
								label={"Radius"}
							/>
						</FormSection>
					</>
				);
			}
		}
	});

export type SkapCircularObstacle = Circular<"circularObstacle">;
export const circularObstacleProperties = circularProperties<SkapCircularObstacle>("circularObstacle", 2.6);

export type SkapCircularLava = Circular<"circularLava">;
export const circularLavaProperties = circularProperties<SkapCircularLava>("circularLava", 4.6);

export type SkapCircularSlime = Circular<"circularSlime">;
export const circularSlimeProperties = circularProperties<SkapCircularSlime>("circularSlime", 6.6);

export type SkapCircularIce = Circular<"circularIce">;
export const circularIceProperties = circularProperties<SkapCircularIce>("circularIce", 5.6);