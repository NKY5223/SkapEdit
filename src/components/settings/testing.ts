import { treeifyError } from "zod";
import { SettingsSchema } from "./settings.ts";

const vø = {};

const results = Object.entries({
	vø
}).map(([k, v]) => [k, SettingsSchema.safeParse(v)] as const);

console.log(
	"Settings upgrade testing\n" +
	results.flatMap(([k, r]) => r.success
		? [`%c· ${k.padEnd(10, " ")} Passed%c`]
		: [`%c! ${k.padEnd(10, " ")} Failed%c`, treeifyError(r.error)]
	).join("\n"),
	...results.flatMap(([, r]) => r.success
		? [`color: #c0ffc0`, ``]
		: [`color: #ffc0c0`, ``]
	)
);
if (results.some(([, r]) => !r.success)) {
	throw new Error("Settings upgrade testing failed");
}