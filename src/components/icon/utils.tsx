import { vec2, Vec2 } from "@common/vec2.ts";
import { IconInfo } from "./Icon.tsx";
import { Command } from "./math.ts";
import { stringifyPath } from "./stringify.tsx";

export const path = (commands: Command[]) => {
	const [d] = stringifyPath(commands);
	
	return <path d={d} />;
}

export const info = (commands: Command[], viewBox: Vec2 = vec2(24)): IconInfo => {
	return {
		content: path(commands),
		viewBox,
		aspectRatio: viewBox[0] / viewBox[1],
	}
}