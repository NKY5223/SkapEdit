import { createContext, useContext, useId } from "react";
import "./icon.css";
import { parser, parseSVG, parseSVGElement, reactize } from "./svgParser.tsx";


type IconsContextType = {
	id: string;
	viewBox: string;
};

export const IconsContext = createContext<Map<string, IconsContextType>>(new Map());
export const useIcons = () => useContext(IconsContext);

type IconTemplateProps = {
	id: string;
	tree: ReturnType<typeof parseSVGElement>;
};

export function IconTemplate({
	id, tree,
}: IconTemplateProps) {
	const node = reactize(tree, { id }, id);
	return node;
}

type IconProviderProps = {
	icons: Record<string, string>;
	extend?: boolean;
};
export function IconProvider({
	children,
	icons,
	extend,
}: React.PropsWithChildren<IconProviderProps>) {
	const id = useId();
	const prevContext = useIcons();
	const data = Object.entries(icons).map(([name, svg]) =>{
		const svgDoc = parseSVG(svg);
		const tree = parseSVGElement(svgDoc);
		const width = "width" in tree ? tree.width : "24"; 
		const height = "height" in tree ? tree.height : "24"; 
		const nodeId = `${id}-${name}`;
		return { 
			node: (<IconTemplate key={name} id={nodeId} tree={tree} />),
			width, height,
			name, id: nodeId,
		};
	});
	const ids: Map<string, IconsContextType> = new Map([...data.map<[string, IconsContextType]>
		(({ width, height, name, id }) => [
			name,
			{ 
				id, 
				viewBox: `0 0 ${width} ${height}` 
			}
		]), ...(extend ? prevContext.entries() : [])]);
	return (
		<IconsContext.Provider value={ids}>
			<div className="iconDefs">
				{data.map(({ node }) => node)}
			</div>
			{children}
		</IconsContext.Provider>
	);
}


type IconProps = {
	icon: string;
	width?: number;
	height?: number;
	style?: Record<string, string | number>;
	attrs?: Record<string, string | number>;
};
export function Icon({
	icon,
	width = 24,
	height = 24,
	style,
	attrs,
}: IconProps) {
	const context = useIcons();
	const { id, viewBox } = context.get(icon) ?? { viewBox: "0 0 24 24" };

	return id ? (
		<svg {...attrs} width={width} height={height} style={style} viewBox={viewBox}>
			<use href={`#${id}`}></use>
		</svg>
	) : (
		<i title={`${icon} @ ${width}×${height}`}>?</i>
	);
}