import { Vec2 } from "@common/vec2.ts";
import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { TableInput } from "@components/form/TableInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

type MovingPoint = {
	pos: Vec2;
	/** The time in the cycle this point is at */
	time: number;
}
type Moving<T extends string> = BaseObject<T, {
	bounds: Bounds;
	period: number;
	points: [MovingPoint, ...MovingPoint[]];
}>;


const movingProperties = <T extends Moving<string>>(type: T["type"], zIndex: number) =>
	makeObjectProperties<T>(type, {
		bounds: obj => obj.bounds,
		selection: {
			zIndex: () => zIndex,
			clickbox: (obj, pos) => obj.bounds.contains(pos),
		},
		transform: {
			affine: (obj, scale, translate) => ({
				...obj,
				bounds: obj.bounds.affine(scale, translate),
				points: obj.points.map(point => ({
					...point,
					pos: point.pos.mul(scale).add(translate),
				})),
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
				const { type, id, bounds, period, points } = object;
				return (
					<>
						<h2>Moving Lava</h2>
						<FormSection>
							<FormTitle><Translate k="generic.position" /></FormTitle>
							<BoundsInput value={bounds} onInput={bounds =>
								update(obj => ({ ...obj, bounds }))
							} />
						</FormSection>
						<FormTitle>Points</FormTitle>
						<NumberInput value={period}
							onInput={period => update(obj => ({ ...obj, period }))}
							label={"Period"}
						/>
						<TableInput value={points}
							details={(point, i) => {
								const updatePoint = (f: (point: MovingPoint) => MovingPoint) => {
									update(obj => ({ ...obj, points: obj.points.with(i, f(obj.points[i])) }))
								}
								return (
									<>
										<NumberInput value={point.time}
											onInput={time => updatePoint(point => ({ ...point, time }))}
											label={"Time"} />
										<Vec2Input value={point.pos}
											onInput={pos => updatePoint(point => ({ ...point, pos }))} />
									</>
								);
							}}
							summary={point => [
								<>t={point.time}</>,
								<><Translate k="generic.vec2" vector={point.pos} /></>
							]}
						/>
					</>
				);
			}
		}
	});

export type SkapMovingObstacle = Moving<"movingObstacle">;
export const movingObstacleProperties = movingProperties<SkapMovingObstacle>("movingObstacle", 2.7);

export type SkapMovingLava = Moving<"movingLava">;
export const movingLavaProperties = movingProperties<SkapMovingLava>("movingLava", 4.7);

export type SkapMovingSlime = Moving<"movingSlime">;
export const movingSlimeProperties = movingProperties<SkapMovingSlime>("movingSlime", 6.7);

export type SkapMovingIce = Moving<"movingIce">;
export const movingIceProperties = movingProperties<SkapMovingIce>("movingIce", 5.7);