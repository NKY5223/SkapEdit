export function elementIsRtl(target: Element) {
	return window.getComputedStyle(target).direction === "rtl";
}