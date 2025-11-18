import { Vec2 } from "@common/vec2.ts";
import { FormSection } from "@components/form/FormSection.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { TableInput } from "@components/form/TableInput.tsx";
import { TextInput } from "@components/form/TextInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

export type SkapReward = BaseObject<"reward", {
	pos: Vec2;
	reward: readonly number[];
}>;
export const powerNames: ReadonlyMap<number, string> = new Map([
	[0, "shrinker"],
	[1, "boom"],
]);
export const Power = {
	Shrinker: 0,
	Boom: 1,
} as const;

export const rewardRadius = 5;
export const rewardProperties = makeObjectProperties<SkapReward>("reward", {
	bounds: obj => new Bounds({ topLeft: obj.pos, bottomRight: obj.pos }),
	transform: {
		affine: (obj, scale, translate) => ({ ...obj, pos: obj.pos.mul(scale).add(translate) }),
	},
	selection: {
		zIndex: () => 16,
		clickbox: (obj, pos) => obj.pos.sub(pos).mag() <= rewardRadius,
	},
	inspector: {
		Component: ({ object }) => {
			const { type, id, reward, pos } = object;
			const dispatchMap = useDispatchSkapMap();
			const update = (f: (obj: SkapReward) => SkapReward) => dispatchMap({
				type: "replace_object",
				target: id,
				replacement: obj => obj.type !== type ? obj : f(obj),
			});
			const updateReward = (i: number, f: (pow: number) => number) => update(obj => ({
				...obj,
				reward: obj.reward.with(i, f(obj.reward[i])),
			}));
			return (
				<>
					<h2><Translate k="object.name" type={type} /></h2>
					<Vec2Input value={pos} onInput={pos => update(obj => ({ ...obj, pos, }))} />
					<TableInput value={reward}
						summary={r => [
							powerNames.get(r) ?? <em>??</em>,
							<code>{r}</code>,
						]}
						details={(r, i) => (<>
							<NumberInput value={r} onInput={r => updateReward(i, () => r)} />
						</>)}

					/>
				</>
			);
		}
	}
});