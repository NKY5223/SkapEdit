import { createContext, useContext, useId } from "react";
import "./icon.css";
import { parser, parseSVG, parseSVGElement, reactize } from "./SVGParser.tsx";


type IconsContextType = {
	id: string;
	viewBox: string;
};

export const IconsContext = createContext<Map<string, IconsContextType>>(new Map());
export const useIcons = () => useContext(IconsContext);

type IconTemplateProps = {
	id: string;
	svg: string;
};

export function IconTemplate({
	id, svg,
}: IconTemplateProps) {
	// return convertSVGToReactNode(parseSVG(svg), { id });
	const svgDoc = parseSVG(svg);
	const tree = parseSVGElement(svgDoc);
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
	const nodes = Object.entries(icons).map(([name, svg]) =>
		(<IconTemplate key={name} id={`${id}-${name}`} svg={svg} />)
	);
	const ids: Map<string, IconsContextType> = new Map([...Object.entries(icons).map<[string, IconsContextType]>
		(([name, svg]) => [
			name,
			{ id: `${id}-${name}`, viewBox: parser.parseFromString(svg, "image/svg+xml").documentElement.getAttribute("viewBox") ?? "0 0 24 24" }
		]), ...(extend ? prevContext.entries() : [])]);
	return (
		<IconsContext.Provider value={ids}>
			<div className="iconDefs">
				{nodes}
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