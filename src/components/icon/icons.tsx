import { IconName, IconInfo, IconProvider } from "./Icon.tsx";
import { toMap } from "@common/toMap.tsx";
import { arrowBars } from "./icon/arrow-bar.ts";
import { arrowBidis } from "./icon/arrow-bidi.ts";
import { arrowCircles } from "./icon/arrow-circle.ts";
import { arrows } from "./icon/arrow.ts";
import { chevrons } from "./icon/chevron.ts";
import { splits } from "./icon/split.ts";
import { FC, PropsWithChildren } from "react";

const iconsObj = {
	"chevron-left": chevrons.left,
	"chevron-right": chevrons.right,
	"chevron-up": chevrons.up,
	"chevron-down": chevrons.down,

	"arrow-left": arrows.left,
	"arrow-right": arrows.right,
	"arrow-up": arrows.up,
	"arrow-down": arrows.down,

	"arrowbar-left": arrowBars.left,
	"arrowbar-right": arrowBars.right,
	"arrowbar-up": arrowBars.up,
	"arrowbar-down": arrowBars.down,

	"arrow-x": arrowBidis.x,
	"arrow-y": arrowBidis.y,

	"arrow-clockwise": arrowCircles.clockwise,
	"arrow-counterclockwise": arrowCircles.counterclockwise,
	"arrow-clockwise-large": arrowCircles.largeClockwise,
	"arrow-counterclockwise-large": arrowCircles.largeCounterclockwise,

	"split-x": splits.x,
	"split-y": splits.y,
} satisfies Record<string, IconInfo>;
type IconKeys = {
	[i in keyof typeof iconsObj]: "@components/icon/icons.tsx";
}
declare global {
	namespace Registry {
		export interface Icon extends IconKeys {
			// cheating, but it's fiiine
			"position-left": null;
			"position-top": null;
			"position-right": null;
			"position-bottom": null;

			"size-width": null;
			"size-height": null;
		}
	}
}
export const icons = toMap<IconInfo, IconName>(iconsObj);
export const Icons: FC<PropsWithChildren> = ({
	children
}) => (<IconProvider value={icons}>{children}</IconProvider>);