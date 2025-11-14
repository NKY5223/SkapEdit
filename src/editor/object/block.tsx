import { Color } from "@common/color.ts";
import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { CheckboxInput } from "@components/form/CheckboxInput.tsx";
import { ColorInput } from "@components/form/ColorInput.tsx";
import { makeOption } from "@components/form/dropdown/Dropdown.ts";
import { DropdownSelect } from "@components/form/dropdown/DropdownSelect.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { useDispatchSkapMap } from "@editor/reducer.ts";

export type SkapBlock = BaseObject<"block", {
	bounds: Bounds;
	color: Color;
	layer: 0 | 1;
	solid: boolean;
}>;

export const blockProperties = makeObjectProperties<SkapBlock>("block", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: obj => obj.layer === 0 ? 11 : 23,
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
			const { type, id, bounds, color, solid, layer } = object;
			return (
				<>
					<h2><Translate k="object.name.block" /></h2 >
					<FormSection>
						<FormTitle><Translate k="generic.position" /></FormTitle>
						<BoundsInput value={bounds} onInput={bounds => dispatchMap({
							type: "replace_object",
							target: id,
							replacement: obj => ({ ...obj, bounds })
						})} />
					</FormSection>
					<FormSection row>
						<ColorInput value={color}
							onInput={
								color => dispatchMap({
									type: "replace_object",
									target: id,
									replacement: obj => ({ ...obj, color })
								})}
							label={<Icon icon="colors" title="Color" />}
							alpha
						/>
					</FormSection>
					<FormSection row>
						<CheckboxInput value={solid}
							onInput={
								solid => dispatchMap({
									type: "replace_object",
									target: id,
									replacement: obj => ({ ...obj, solid })
								})}
							label={"Solid"}
						/>
					</FormSection>
					<FormSection row>
						<DropdownSelect<SkapBlock["layer"]> value={layer}
							options={
								[
									makeOption("0", 0, "Back"),
									makeOption("1", 1, "Front"),
								]}
							onInput={
								layer => dispatchMap({
									type: "replace_object",
									target: id,
									replacement: obj => ({ ...obj, layer })
								})}
						/>
					</FormSection>
				</>
			);
		}
	}
});