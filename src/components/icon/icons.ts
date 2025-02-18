
import template from "./icon/template.svg?raw";
import test from "./icon/test.svg?raw";

import reset from "./icon/reset.svg?raw";
import reset2 from "./icon/reset2.svg?raw";

import position_left from "./icon/position/left.svg?raw";
import position_top from "./icon/position/top.svg?raw";
import position_right from "./icon/position/right.svg?raw";
import position_bottom from "./icon/position/bottom.svg?raw";

import size_width from "./icon/size/width.svg?raw";
import size_height from "./icon/size/height.svg?raw";

import position_top2 from "./icon/position/top2.svg?raw";
import size_width2 from "./icon/size/width2.svg?raw";

export const icons = {
	template,

	reset,
	reset2,

	position_left,
	position_top: position_top,
	position_right,
	position_bottom,

	size_width: size_width,
	size_height,
	
	position_top2,
	size_width2,
};
export const aliases = {
	pos_x: "position_left",
	pos_y: "position_top",
	size_x: "size_width",
	size_y: "size_height",
};
export type IconAutocomplete = keyof typeof icons | keyof typeof aliases;