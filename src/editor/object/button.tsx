import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { CardinalDirectionInput } from "@components/form/CardinalDirectionInput.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { TextInput } from "@components/form/TextInput.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, CardinalDirection, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

export type SkapButton = BaseObject<"button", {
	name: string;
	bounds: Bounds;
	dir: CardinalDirection;
	timer: number;
}>;

export const buttonProperties = makeObjectProperties<SkapButton>("button", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => 7,
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
			const { type, id, name, bounds, dir, timer } = object;
			const dispatchMap = useDispatchSkapMap();

			const update = (f: (obj: SkapButton) => SkapButton) => dispatchMap({
				type: "replace_object",
				target: id,
				replacement: obj => obj.type !== type ? obj : f(obj),
			});
			return (
				<>
					<h2><Translate k="object.name" type={type} /></h2 >
					<TextInput value={name} onInput={name => update(obj => ({ ...obj, name }))} />
					<FormSection>
						<FormTitle><Translate k="generic.position" /></FormTitle>
						<BoundsInput value={bounds} onInput={bounds => update(obj => ({ ...obj, bounds }))} />
					</FormSection>
					<CardinalDirectionInput value={dir} onInput={dir => update(obj => ({ ...obj, dir }))} />
					<NumberInput value={timer} onInput={timer => update(obj => ({ ...obj, timer }))} />
				</>
			);
		}
	}
});