import { BoundsInput } from "@components/form/BoundsInput.tsx";
import { FormSection } from "@components/form/FormSection.tsx";
import { FormTitle } from "@components/form/FormTitle.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Bounds } from "@editor/bounds.ts";
import { useDispatchSkapMap } from "@editor/reducer.ts";
import { BaseObject, makeObjectProperties } from "./Base.tsx";
import { Fragment } from "react/jsx-runtime";
import { TextInput } from "@components/form/TextInput.tsx";
import { NumberInput } from "@components/form/NumberInput.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Button } from "@components/form/Button.tsx";
import { TableInput } from "@components/form/TableInput.tsx";
import { makeSpawnerEntity } from "@editor/map.ts";
import { entityToTextureName, isKnownEntityType } from "@components/view/viewport/renderer/spawner.ts";
import { entityTextures } from "@common/entityTextures.ts";

export type SkapSpawner = BaseObject<"spawner", {
	bounds: Bounds;
	entities: {
		type: string;
		count: number;
		speed: number;
		radius: number;
	}[];
}>;

export const spawnerProperties = makeObjectProperties<SkapSpawner>("spawner", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => 0,
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
			const updateSpawner = (f: (spawner: SkapSpawner) => SkapSpawner) => dispatchMap({
				type: "replace_object",
				target: id,
				replacement: obj => obj.type === "spawner"
					? f(obj)
					: obj,
			});
			const updateEntity = (i: number, entity: SkapSpawner["entities"][number]) => updateSpawner(obj => ({
				...obj,
				entities: obj.entities.with(i, entity)
			}));
			const addEntity = () => updateSpawner(obj => ({
				...obj, entities: [
					...obj.entities,
					makeSpawnerEntity("normal", 5, 5, 5),
				]
			}));
			const removeEntity = (i: number) => updateSpawner(obj => ({
				...obj,
				entities: obj.entities.toSpliced(i, 1),
			}));
			return (
				<>
					<h2><Translate k="object.name.spawner" /></h2>
					<FormSection>
						<FormTitle><Translate k="generic.position" /></FormTitle>
						<BoundsInput bounds={bounds} setBounds={bounds => dispatchMap({
							type: "replace_object",
							target: id,
							replacement: obj => ({ ...obj, bounds })
						})} />
					</FormSection>
					<FormTitle>Entities</FormTitle>
					<TableInput values={object.entities}
						summary={ent => {
							const { type, count, speed, radius } = ent;
							const url = isKnownEntityType(type)
								? entityTextures[entityToTextureName(type)]
								: undefined;
							return [
								url
									? <><img src={url} style={{
										display: "inline-block",
										width: "1em",
										height: "1em",
										verticalAlign: "middle",
										marginInlineEnd: ".5em",
									}} />{type}</>
									: type,
								<>×{count}</>,
								<>r={radius}</>,
								<>{speed}u/s</>,
							];
						}}
						details={(ent, i) => {
							const { type, count, speed, radius } = ent;
							return (<>
								<FormSection row>
									<TextInput value={type}
										label={"Type"}
										onInput={type => updateEntity(i, { type, count, speed, radius })}
									/>
								</FormSection>
								<FormSection row>
									<NumberInput value={count}
										min={0} step={1}
										label={"Count"}
										onInput={count => updateEntity(i, { type, count, speed, radius })}
									/>
									<NumberInput value={radius}
										min={0}
										label={"Radius"}
										onInput={radius => updateEntity(i, { type, count, speed, radius })}
									/>
									<NumberInput value={speed}
										min={0}
										label={"Speed"}
										onInput={speed => updateEntity(i, { type, count, speed, radius })}
									/>
								</FormSection>
							</>);
						}}
						// header={[
						// 	"Type",
						// 	"Count",
						// 	"Speed",
						// 	"Radius"
						// ]}
						removeItem={removeEntity}
						addItem={addEntity}
					/>
				</>
			);
		}
	}
});