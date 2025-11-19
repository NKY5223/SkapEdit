import { vec2, Vec2 } from "@common/vec2.ts";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { TableInput } from "@components/form/TableInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";
import { centeredBounds } from "./moving.tsx";
import { powerTextures } from "@common/powerTextures.ts";
import { Icon } from "@components/icon/Icon.tsx";
import { TextInput } from "@components/form/TextInput.tsx";
import { rewardRadius } from "./reward.tsx";

export type SkapHatReward = BaseObject<"hatReward", {
	pos: Vec2;
	hatReward: string;
}>;
export const hatNames = [
	"crown",
	"cowboy",
	"sakura",
] as const;

export const hatRewardProperties = makeObjectProperties<SkapHatReward>("hatReward", {
	bounds: obj => new Bounds({ topLeft: obj.pos, bottomRight: obj.pos }),
	transform: {
		affine: (obj, scale, translate) => ({ ...obj, pos: obj.pos.mul(scale).add(translate) }),
	},
	selection: {
		zIndex: () => 17,
		clickbox: (obj, pos) => centeredBounds(obj.pos, vec2(2 * rewardRadius)).contains(pos),
	},
	inspector: {
		Component: ({ object }) => {
			const { type, id, hatReward, pos } = object;
			const dispatchMap = useDispatchSkapMap();
			const update = (f: (obj: typeof object) => typeof object) => dispatchMap({
				type: "replace_object",
				target: id,
				replacement: obj => obj.type !== type ? obj : f(obj),
			});
			return (
				<>
					<h2><Translate k="object.name" type={type} /></h2>
					<Vec2Input value={pos}
						onInput={pos => update(obj => ({ ...obj, pos }))}
					/>
					<TextInput value={hatReward}
						onInput={hatReward => update(obj => ({ ...obj, hatReward }))}
						label={"Hat"}
					/>
				</>
			);
		}
	}
});