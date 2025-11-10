import { Vec2 } from "@common/vec2.ts";
import { FormSection } from "@components/form/FormSection.tsx";
import { TextInput } from "@components/form/TextInput.tsx";
import { Vec2Input } from "@components/form/Vec2Input.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { useTranslate } from "@components/translate/translationArgs.ts";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

export type SkapText = BaseObject<"text", {
	pos: Vec2;
	text: string;
}>;

export const textRadius = 5;
export const textProperties = makeObjectProperties<SkapText>("text", {
	bounds: obj => new Bounds({ topLeft: obj.pos, bottomRight: obj.pos }),
	transform: {
		affine: (obj, scale, translate) => ({ ...obj, pos: obj.pos.mul(scale).add(translate) }),
	},
	selection: {
		zIndex: () => 22,
		clickbox: (obj, pos) => obj.pos.sub(pos).mag() <= textRadius,
	},
	inspector: {
		Component: ({ object }) => {
			const { type, id, text, pos } = object;
			const dispatchMap = useDispatchSkapMap();
			const translate = useTranslate();
			return (
				<>
					<h2><Translate k="object.name.text" /></h2>
					<FormSection row>
						<TextInput value={text} label={<Icon icon="text_fields" title={translate("generic.text")} />}
							onInput={text => dispatchMap({
								type: "replace_object",
								target: id,
								replacement: obj => ({
									...obj,
									text,
								}),
							})} />
					</FormSection>
					<Vec2Input vec={pos} setVec={pos => dispatchMap({
						type: "replace_object",
						target: id,
						replacement: obj => ({
							...obj,
							pos,
						}),
					})} />
				</>
			);
		}
	}
});