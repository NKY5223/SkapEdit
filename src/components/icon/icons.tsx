import { chevronDown, chevronLeft, chevronRight, chevronUp } from "./icon/chevron.ts";
import { IconName, IconInfo } from "./Icon.tsx";
import { path } from "./path.tsx";
import { toMap } from "@components/translate/constructors.tsx";

declare global {
	namespace Registry {
		export interface Icon {
			"chevron-left": {};
			"chevron-right": {};
			"chevron-up": {};
			"chevron-down": {};

			"split-x": {};
			"split-y": {};

			"position-left": {};
			"position-top": {};
			"position-right": {};
			"position-bottom": {};

			"size-width": {};
			"size-height": {};

			"reset": {};
		}
	}
}
export const nicons = toMap<IconInfo, IconName>({
	"chevron-left": {
		content: path(chevronLeft),
	},
	"chevron-right": {
		content: path(chevronRight),
	},
	"chevron-up": {
		content: path(chevronUp),
	},
	"chevron-down": {
		content: path(chevronDown),
	},
});
