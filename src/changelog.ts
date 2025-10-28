import { RichText } from "@components/translate/translate.ts";

export type Changelog = {
	version: string;
	message: RichText;
}
/** 
 * Changelogs, in reverse chronological order
 * (most recent first)
 */
export const changelogs: Changelog[] = [
	{
		version: "0.1.0",
		message: "Initial version, where changelogs and versions were first added.",
	}
];

export const currentVersion = changelogs[0]?.version ?? "X.X.X";