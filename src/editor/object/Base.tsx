import { ID } from "@common/uuid.ts";
import { Vec2 } from "@common/vec2.ts";
import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { useDispatchSkapMap } from "@editor/reducer.ts";
import { FC } from "react";

export type BaseObject<T extends string, P> = {
	type: T;
	id: ID;
} & P;
export type SkapObjectProperties<T extends string, O extends BaseObject<T, {}>> = {
	type: T;
	bounds: (obj: O) => Bounds;
	selection: {
		zIndex: (obj: O) => number;
		/** Iff a click at pos would click on the object, return true */
		clickbox: (obj: O, pos: Vec2) => boolean;
	};
	transform: {
		/** 
		 * Apply an affine transformation onto an object:  
		 * Scale the object by `scale` centered on the origin, then
		 * translate the object by `translate`.
		 * 
		 * A point on the object should undergo `x ↦ x * s + t`.
		 */
		affine: (obj: O, scale: Vec2, translate: Vec2) => O;
	};
	inspector: {
		Component: FC<{
			object: O;
		}>
	};
};

export const makeObjectProperties = <O extends BaseObject<string, {}>>(
	type: O["type"], properties: Omit<SkapObjectProperties<O["type"], O>, "type">): SkapObjectProperties<O["type"], O> =>
	({ type, ...properties });


/** ObjectProperties for simple bounds-type object */
export const makeSimpleBoundsObjectProperties = <O extends BaseObject<string, { bounds: Bounds }>>(
	type: O["type"],
	zIndex: number,
) => makeObjectProperties<O>(type, {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => zIndex,
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

			const { type, id, bounds } = object;
			return (
				<>
					<h2><Translate k="object.name" type={type} /></h2 >
					<FormSection>
						<FormTitle><Translate k="generic.position" /> </FormTitle>
						<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
							type: "replace_object",
							target: id,
							replacement: obj => ({ ...obj, bounds })
						})} />
					</FormSection>
				</>
			);
		}
	}
});

export type CardinalDirection = 0 | 1 | 2 | 3;
export const CardinalDirection: {
    readonly Down: 0;
    readonly Left: 1;
    readonly Up: 2;
    readonly Right: 3;
    readonly 0: "down";
    readonly 1: "left";
    readonly 2: "up";
    readonly 3: "right";
} = {
	Down: 0,
	Left: 1,
	Up: 2,
	Right: 3,

	0: `down`,
	1: `left`,
	2: `up`,
	3: `right`,
};