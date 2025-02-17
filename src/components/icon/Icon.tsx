import { createContext, useContext, useId } from "react";
import css from "./icon.module.css";
import { parseSVG, parseSVGElement, reactize } from "./svgParser.tsx";
import type { IconAutocomplete } from "./icons.ts";


export type IconsContextType = {
	id: string;
	viewBox: string;
	canonicalName: string;
};

export const IconsContext = createContext<Map<string, IconsContextType>>(new Map());
export const useIcons = () => useContext(IconsContext);

type IconTemplateProps = {
	id: string;
	tree: ReturnType<typeof parseSVGElement>;
	ids: Map<string, IconsContextType>
};

export function IconTemplate({
	id, tree, ids
}: IconTemplateProps) {
	const node = reactize(tree, id, ids, { id }, id);
	return node;
}

type IconProviderProps = {
	icons: Record<string, string>;
	aliases?: Record<string, string>;
	extend?: boolean;
};
export function IconProvider({
	children,
	icons,
	aliases,
	extend,
}: React.PropsWithChildren<IconProviderProps>) {
	const id = useId();
	const prevContext = useIcons();
	const data = Object.entries(icons).map(([name, svg]) => {
		const svgDoc = parseSVG(svg);
		const tree = parseSVGElement(svgDoc);
		const width = "width" in tree ? tree.width : "24";
		const height = "height" in tree ? tree.height : "24";
		const nodeId = `${id}-${name}`;
		return {
			tree,
			width, height,
			name, id: nodeId,
		};
	});
	const initContextData: Map<string, IconsContextType> = new Map(data.map<[string, IconsContextType]>(
		({ width, height, name, id }) => [
			name,
			{
				id,
				viewBox: `0 0 ${width} ${height}`,
				canonicalName: name,
			}
		]
	));
	const contextData: Map<string, IconsContextType> = new Map([
		...(extend ? prevContext.entries() : []),
		...initContextData.entries(),
		...(aliases ? Object.entries(aliases).map(([alias, icon]) => [
			alias, initContextData.get(icon)
		] as const).filter((x): x is [string, IconsContextType] => !!x[1]) : [])
	]);
	const nodes = data.map(({ name, id, tree }) =>
		(<IconTemplate key={name} id={id} ids={contextData} tree={tree} />)
	);

	return (
		<IconsContext.Provider value={contextData}>
			<div className={css.defs}>
				{nodes}
			</div>
			{children}
		</IconsContext.Provider>
	);
}

export type IconName = IconAutocomplete | string & {};

type IconProps = {
	icon: IconName;
	title?: string;
	width?: number | string;
	height?: number | string;
	style?: Record<string, string | number>;
	attrs?: Record<string, string | number>;
	vars?: Partial<{
		color: string;
		"template-opacity": number;
	}> & Record<string, string | number>
};
export function Icon({
	icon,
	title,
	width = "1.5em",
	height = "1.5em",
	style,
	attrs,
	vars,
}: IconProps) {
	const context = useIcons();
	const { id, viewBox } = context.get(icon) ?? { viewBox: "0 0 24 24" };

	const combined = {
		"--icon-color": "currentColor",
		"--icon-template-opacity": 0,
		...style,
		...(vars && Object.fromEntries(
			Object.entries(vars)
				.map(([name, value]) => [`--icon-${name}`, value])
		))
	};

	return id ? (
		<div className={css.title} title={title}>
			<svg {...attrs} width={width} height={height} style={combined} viewBox={viewBox}>
				<use href={`#${id}`}></use>
			</svg>
		</div>
	) : (
		<i title={`${icon} @ ${width}×${height}`}>?</i>
	);
}