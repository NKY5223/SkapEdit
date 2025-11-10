import { RichText } from "@components/translate/richtext";

export type ChangelogEntry = {
	version: string;
	message: RichText;
	time?: Date;
}
/** 
 * Changelogs, in reverse chronological order
 * (most recent first)
 */
export const changelog: ChangelogEntry[] = [
	{
		version: "0.1.3",
		message: [
			`Added blocks, gravity zones, teleporters.`,
		],
		time: new Date(`2030-11-04`),
	},
	{
		version: "0.1.2",
		message: [
			`Added importing and exporting.`,
		],
		time: new Date(`2025-11-04`),
	},
	{
		version: "0.1.1",
		message: [
			`Added multi-select.`,
		],
		time: new Date(`2025-11-02`),
	},
	{
		version: "0.1.0",
		message: [
			"Initial version. Added changelog and version.",
		],
		time: new Date(`2025-10-28`),
	},
];

export const currentVersion = changelog[0]?.version ?? "X.X.X";