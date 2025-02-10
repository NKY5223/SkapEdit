import { createContext, Key, useContext, useId } from "react";
import "./icon.css";


type IconsContextType = {
	id: string;
	viewBox: string;
};

export const IconsContext = createContext<Map<string, IconsContextType>>(new Map());
export const useIcons = () => useContext(IconsContext);

const parser = new DOMParser();

type IconTemplateProps = {
	id: string;
	svg: string;
};

export function IconTemplate({
	id, svg,
}: IconTemplateProps) {
	return convertSVGToReactNode(
		parser.parseFromString(svg, "image/svg+xml").documentElement, { id }
	);
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
	attrs?: Record<string, string>;
};
export function Icon({
	icon,
	width = 24,
	height = 24,
	attrs
}: IconProps) {
	const context = useIcons();
	const { id, viewBox } = context.get(icon) ?? { viewBox: "0 0 24 24" };
	return id ? (
		<svg width={width} height={height} viewBox={viewBox} {...attrs}>
			<use href={`#${id}`}></use>
		</svg>
	) : (
		<i title={`${icon} @ ${width}×${height}`}>?</i>
	);
}

function convertSVGToReactNode(
	el: Element,
	extraAttrs?: Record<string, string>,
	key?: Key,
): React.ReactNode {
	if (el.namespaceURI !== "http://www.w3.org/2000/svg") {
		throw new Error("not svg ns??");
	}
	const attrs = Object.assign(Object.fromEntries([...el.attributes].map(attr =>
		[svgAttrToReactAttr(attr.name), attr.value]
	)), extraAttrs);
	switch (el.tagName.toLowerCase()) {
		case "svg": {
			return (
				<svg key={key} {...attrs}>
					{[...el.children].map((el, i) => convertSVGToReactNode(el, {}, i))}
				</svg>
			);
		}
		case "g": {
			return (
				<g key={key} {...attrs}>
					{[...el.children].map((el, i) => convertSVGToReactNode(el, {}, i))}
				</g>
			);
		}
		case "path": {
			return (
				<path key={key} {...attrs} />
			);
		}
		default: {
			return (
				<text key={key} fontSize="10" color="#f00" stroke="none">
					Could not find {el.tagName}
				</text>
			);
		}
	}
}
function svgAttrToReactAttr(name: string): string {
	return name.replaceAll(/-\w/g, s => s[1].toUpperCase());
}

const svgPathSplitter = /\s+|(?<=[a-zA-Z])(?=[\d-])|(?<=\d)(?=[a-zA-Z\-])|(?<=\.\d*)(?=\.)/g;
// console.log(`m10 20h9.006c1.65 0 2.994-1.347 2.994-3.009v-9.982c0-1.673-1.341-3.009-2.994-3.009h-14.012c-1.65 0-2.994 1.347-2.994 3.009v9.982c0 1.673 1.341 3..994 3.009h2.006v-9c0-.552.447-1 1-1h6v-3.5l5.5 5-5.5 5v-3.5h-4z`.split(svgPathSplitter));