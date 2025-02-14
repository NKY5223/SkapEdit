import { Key, ReactNode } from "react";
import { PathData, parsePath, pathToString } from "./pathParser.ts";

export const parser = new DOMParser();

export const ifNaN = (x: unknown, fallback: number = 0) => !isNaN(Number(x)) ? Number(x) : fallback;

export function parseSVG(str: string) {
	return parser.parseFromString(str, "application/xml").documentElement;
}

type CommonAttrName = (typeof commonAttrNames)[number];
type CommonAttrs = Partial<Record<CommonAttrName, string>>;

type C = { common?: CommonAttrs; };
type ParsedSVG = {
	type: "svg";
	width: string;
	height: string;
	viewBox: string;
	children: ParsedSVGEl[];
} & C;

type ParsedGroup = {
	type: "g";
	children: ParsedSVGEl[];
} & C;

type ParsedPath = {
	type: "path";
	d: PathData[];
} & C;

type ParsedError = {
	type: "error";
	message: string;
} & C;

type ParsedSVGEl = (
	| ParsedSVG
	| ParsedGroup
	| ParsedPath
	| ParsedError
);

const commonAttrNames = ["transform", "fill", "stroke", "strokeWidth", "strokeOpacity"] as const;

const commonToSvg: Partial<Record<CommonAttrName, string>> = {
	strokeWidth: "stroke-width",
	strokeOpacity: "stroke-opacity",
};

function getCommonAttrs(el: Element): CommonAttrs {
	return Object.fromEntries(
		commonAttrNames
			.map(attr => [attr, el.getAttribute(commonToSvg[attr] ?? attr)])
			.filter(([, value]) => value !== null),
	);
}
function setCommonAttrs<T extends ParsedSVGEl>(el: Element, attrs: T): T {
	return Object.assign(attrs, { 
		common: getCommonAttrs(el) 
	});
}
function stripEnd(str: string, target: string) {
	if (str.endsWith(target)) return str.slice(0, -target.length);
	return str;
}
export function parseSVGElement(el: Element): ParsedSVGEl {
	if (el.querySelector("parsererror")) {
		return {
			type: "error",
			message: `DOMParser error: ${el.innerHTML}`,
		};
	}
	switch (el.tagName.toLowerCase()) {
		case "svg": {
			const width = stripEnd(el.getAttribute("width") ?? "24", "px");
			const height = stripEnd(el.getAttribute("height") ?? "24", "px");
			const viewBox = el.getAttribute("viewBox") ?? `0 0 ${width} ${height}`;

			const children = [...el.children].map(el => parseSVGElement(el));
			return setCommonAttrs(el, {
				type: "svg",
				width, height,
				viewBox,
				children,
			});
		}
		case "g": {
			const children = [...el.children].map(el => parseSVGElement(el));
			return setCommonAttrs(el, {
				type: "g",
				children,
			});
		}
		case "path": {
			const d = parsePath(el.getAttribute("d") ?? "");
			return setCommonAttrs(el, {
				type: "path",
				d,
			});
		}
		default: {
			return {
				type: "error",
				message: `Could not parse element: ${el.outerHTML}`,
			};
		}
	}
}
// i couldn't think of a better name
export function reactize(el: ParsedSVGEl, attrs: Record<string, string> = {}, key?: Key): ReactNode {
	switch (el.type) {
		case "svg": {
			return (
				<svg key={key} {...el.common} width={el.width} height={el.height} viewBox={el.viewBox} {...attrs}>
					{el.children.map((child, i) => reactize(child, {}, i))}
				</svg>
			);
		}
		case "g": {
			return (
				<g key={key} {...el.common} {...attrs}>
					{el.children.map((child, i) => reactize(child, {}, i))}
				</g>
			);
		}
		case "path": {
			return (
				<path key={key} {...el.common} d={pathToString(el.d)}{...attrs} />
			);
		}
		default: {
			return <text>:( cannot make</text>;
		}
	}
}
