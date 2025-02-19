import { CSSProperties, Key, ReactNode } from "react";
import { PathData, parsePath, pathToString } from "./pathParser.ts";
import { IconsContextType } from "./Icon.tsx";

export const parser = new DOMParser();

export const ifNaN = (x: unknown, fallback: number = 0) => !isNaN(Number(x)) ? Number(x) : fallback;

export function parseSVG(str: string) {
	return parser.parseFromString(str, "application/xml").documentElement;
}

type CommonAttrName = (typeof commonAttrNames)[number];
type CommonAttrs = Partial<Record<CommonAttrName, string>>;
type C = {
	common?: CommonAttrs;
	id?: string;
	mask?: string | Href;
	style?: CSSProperties;
};
type Href = {
	refExt?: string;
	refInt?: string;
};

// #region parsed types
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
type ParsedDefs = {
	type: "defs";
	children: ParsedSVGEl[];
} & C;
// type ParsedMask = {
// 	type: "mask";
// 	children: ParsedSVGEl[];
// } & C;
type ParsedUse = {
	type: "use";
	href: Href;
} & C;
type ParsedPath = {
	type: "path";
	d: PathData[];
} & C;
type ParsedCircle = {
	type: "circle";
	cx?: string;
	cy?: string;
	r?: string;
} & C;
type ParsedError = {
	type: "error";
	message: string;
} & C;

type ParsedSVGEl = (
	| ParsedSVG
	| ParsedGroup
	| ParsedDefs
	// | ParsedMask
	| ParsedUse
	| ParsedPath
	| ParsedCircle
	| ParsedError
);
// #endregion

const commonAttrNames = [
	"transform",
	"opacity",
	"fill",
	"stroke", "strokeWidth", "strokeOpacity",
] as const;

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
function parseCSSStyle(style: string): CSSProperties {
	return Object.fromEntries(style
		.split(";")
		.map(str => str.split(":"))
		.map(([prop, val]) => [prop.trim(), val?.trim()])
		.filter(([prop, val]) => prop && val)
		.map(([prop, val]) => [
			prop.replaceAll(/-\w/g, s => s[1].toUpperCase()),
			val
		])
	);
}
function setCommonAttrs<T extends ParsedSVGEl>(el: Element, attrs: T): T {
	const style = el.getAttribute("style") ?? undefined;
	const mask = el.getAttribute("mask") ?? undefined;
	return Object.assign(attrs, {
		common: getCommonAttrs(el),
		id: el.getAttribute("id") ?? undefined,
		style: style !== undefined ? parseCSSStyle(style) : undefined,
		mask: mask && (parseHref(mask) ?? mask),
	} satisfies C);
}
function stripEnd(str: string, target: string) {
	if (str.endsWith(target)) return str.slice(0, -target.length);
	return str;
}
function parseHref(href: string | null): Href {
	if (!href) throw ({
		type: "error",
		message: `Could not parse null href`
	});
	if (!(href.includes("#") || href.includes("@"))) throw ({
		type: "error",
		message: `Could not parse href becasue it is missing a # or @: \n\t${href}`
	});

	const [icon, id] = href.split("#");
	if (href.startsWith("@")) {
		return {
			refExt: icon.slice(1),
			refInt: id ?? undefined,
		};
	}
	return {
		refInt: id,
	};
}
function hrefToId(el: Href, ids: Map<string, IconsContextType>, id: string): string {
	return el.refExt
		? el.refInt
			? `${ids.get(el.refExt)?.id}-${el.refInt}`
			: `${ids.get(el.refExt)?.id}`
		: `${id}-${el.refInt}`;
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
		case "defs": {
			const children = [...el.children].map(el => parseSVGElement(el));
			return setCommonAttrs(el, {
				type: "defs",
				children,
			});
		}
		// case "mask": {
		// 	const children = [...el.children].map(el => parseSVGElement(el));
		// 	return setCommonAttrs(el, {
		// 		type: "mask",
		// 		children,
		// 	});
		// }
		case "g": {
			const children = [...el.children].map(el => parseSVGElement(el));
			return setCommonAttrs(el, {
				type: "g",
				children,
			});
		}
		case "use": {
			const href = parseHref(el.getAttribute("href"));
			return setCommonAttrs(el, {
				type: "use",
				href,
			});
		}
		case "path": {
			const d = parsePath(el.getAttribute("d") ?? "");
			return setCommonAttrs(el, {
				type: "path",
				d,
			});
		}
		case "circle": {
			return setCommonAttrs(el, {
				type: "circle",
				cx: el.getAttribute("cx") ?? undefined,
				cy: el.getAttribute("cy") ?? undefined,
				r: el.getAttribute("r") ?? undefined,
			});
		}
		default: {
			return {
				type: "error",
				message: `Could not parse element: \n\t${el.outerHTML}`,
			};
		}
	}
}
// i couldn't think of a better name
export function reactize(el: ParsedSVGEl, id: string, ids: Map<string, IconsContextType>, attrs: Record<string, string> = {}, key?: Key): ReactNode {
	const cAttrs = {
		...(el.common ?? {}),
		id: el.id ? `${id}-${el.id}` : undefined,
		// mask: el.mask === undefined ? undefined :
		// 	`url(${typeof el.mask === "object"
		// 		? `"#${hrefToId(el.mask, ids, id)}"`
		// 		: el.mask
		// 	})`,
		style: el.style,
	};
	switch (el.type) {
		case "svg": {
			return (
				<svg key={key} {...cAttrs}
					width={el.width} height={el.height} viewBox={el.viewBox}
					{...attrs}
				>
					{el.children.map((child, i) => reactize(child, id, ids, {}, i))}
				</svg>
			);
		}
		case "defs": {
			return (
				<defs key={key} {...cAttrs}
					{...attrs}
				>
					{el.children.map((child, i) => reactize(child, id, ids, {}, i))}
				</defs>
			);
		}
		// case "mask": {
		// 	return (
		// 		<mask key={key} {...cAttrs}
		// 			{...attrs}
		// 		>
		// 			{el.children.map((child, i) => reactize(child, id, ids, {}, i))}
		// 		</mask>
		// 	);
		// }
		case "g": {
			return (
				<g key={key} {...cAttrs}
					{...attrs}
				>
					{el.children.map((child, i) => reactize(child, id, ids, {}, i))}
				</g>
			);
		}
		case "use": {
			return (
				<use key={key} {...cAttrs}
					href={"#" + hrefToId(el.href, ids, id)}
					{...attrs}
				/>
			)
		}
		case "path": {
			return (
				<path key={key} {...cAttrs}
					d={pathToString(el.d)}
					{...attrs}
				/>
			);
		}
		case "circle": {
			return (
				<circle key={key} {...cAttrs}
					cx={el.cx} cy={el.cy} r={el.r}
					{...attrs}
				/>
			);
		}
		case "error": {
			return (
				<text key={key}>Error: {el.message}</text>
			)
		}
		// default: {
		// 	return <text key={key}>:( cannot make: {JSON.stringify(el)}</text>;
		// }
	}
}
