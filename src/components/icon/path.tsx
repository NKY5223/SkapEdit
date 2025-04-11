import { Command } from "./math.ts";
import { stringifyPath } from "./stringify.tsx";

export const path = (commands: Command[]) => {
	const [d] = stringifyPath(commands);
	
	return <path d={d} />;
}