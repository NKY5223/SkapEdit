// Should this just check if `document.direction === "rtl"`?

export function elementIsRtl(target: Element) {
	return window.getComputedStyle(target).direction === "rtl";
}