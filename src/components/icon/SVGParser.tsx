import { Key, ReactNode } from "react";
import { PathData, parsePath, pathToString } from "./PathData.ts";

export const parser = new DOMParser();

export const ifNaN = (x: unknown, fallback: number = 0) => !isNaN(Number(x)) ? Number(x) : fallback;

export function parseSVG(str: string) {
	return parser.parseFromString(str, "application/xml").documentElement;
}

type CommonAttrs = {
	transform?: string;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	strokeOpacity?: number;
};

type ParsedSVG = {
	type: "svg";
	width: number;
	height: number;
	children: ParsedSVGEl[];
} & CommonAttrs;

type ParsedGroup = {
	type: "g";
	children: ParsedSVGEl[];
} & CommonAttrs;

type ParsedPath = {
	type: "path";
	d: PathData[];
} & CommonAttrs;

type ParsedError = {
	type: "error";
	message: string;
} & CommonAttrs;

type ParsedSVGEl = (
	| ParsedSVG
	| ParsedGroup
	| ParsedPath
	| ParsedError
);

const commonAttrNames = ["transform", "fill", "stroke", "strokeWidth", "strokeOpacity"] as const;
const commonToSvg: Partial<Record<keyof CommonAttrs, string>> = {
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
	return Object.assign(attrs, getCommonAttrs(el));
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
			const width = ifNaN(Number(el.getAttribute("width")), 24);
			const height = ifNaN(Number(el.getAttribute("height")), 24);

			const children = [...el.children].map(el => parseSVGElement(el));
			return setCommonAttrs(el, {
				type: "svg",
				width, height,
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
export function reactize(el: ParsedSVGEl, attrs: Record<string, string> = {}, key?: Key): ReactNode {
	const commonAttrs: CommonAttrs = Object.fromEntries(
		Object.entries(el)
			.filter(([attr]) =>
				// stupid filter typecast because you have to for some stupid reason
				(commonAttrNames as unknown as readonly string[]).includes(attr)
			)
	);
	switch (el.type) {
		case "svg": {
			return (
				<svg key={key} {...commonAttrs} viewBox={`0 0 ${el.width} ${el.height}`} {...attrs}>
					{el.children.map((child, i) => reactize(child, {}, i))}
				</svg>
			);
		}
		case "g": {
			return (
				<g key={key} {...commonAttrs} {...attrs}>
					{el.children.map((child, i) => reactize(child, {}, i))}
				</g>
			);
		}
		case "path": {
			return (
				<path key={key} {...commonAttrs} d={pathToString(el.d)}{...attrs} />
			);
		}
		default: {
			return <text>:( cannot make</text>;
		}
	}
}
