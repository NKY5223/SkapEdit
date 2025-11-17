import { Vec2 } from "@common/vec2.ts";
import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { TextInput } from "@components/form/TextInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { Bounds } from "@editor/bounds.ts";
import { SkapObject } from "@editor/map.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

export type SkapTurret = BaseObject<"turret", {
	pos: Vec2;
	region: Bounds;

	bulletRadius: number;
	/** Speed of bullets shot, in u/s */
	bulletSpeed: number;
	/** Time between bullets, in s
	 * > Note: Bullet interval does not take effect on the last bullet.
	 */
	bulletInterval: number;
	/** Number of bullets in a group */
	groupSize: number;
	/** Time between groups, in s
	 * > Note: This time does not include the duration of the group firing.
	 */
	groupInterval: number;
}>;

const turretRadius = 3;

export const turretProperties = makeObjectProperties<SkapTurret>("turret", {
	bounds: obj => new Bounds({ topLeft: obj.pos, bottomRight: obj.pos }),
	transform: {
		affine: (obj, scale, translate) => ({ ...obj, pos: obj.pos.mul(scale).add(translate) }),
	},
	selection: {
		zIndex: () => 13,
		clickbox: (obj, pos) => obj.pos.sub(pos).mag() <= turretRadius,
	},
	inspector: {
		Component: ({ object }) => {
			const { type, id, pos, region, bulletRadius, bulletSpeed, bulletInterval, groupSize, groupInterval } = object;
			const dispatchMap = useDispatchSkapMap();
			const translate = useTranslate();
			const update = (f: (obj: SkapTurret) => SkapTurret) => dispatchMap({
				type: "replace_object",
				target: id,
				replacement: obj => obj.type !== type ? obj : f(obj),
			});
			return (
				<>
					<h2><Translate k="object.name" type={type} /></h2>
					<Vec2Input value={pos} onInput={pos => update(obj => ({ ...obj, pos }))} />
					<BoundsInput value={region} onInput={region => update(obj => ({ ...obj, region }))} />
					{JSON.stringify({
						bulletRadius,
						bulletSpeed,
						bulletInterval,
						groupSize,
						groupInterval,
					})}
				</>
			);
		}
	}
});