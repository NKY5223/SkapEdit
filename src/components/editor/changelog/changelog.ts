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
		version: "0.1.4",
		message: [
			`Added objects: rotating lava, circular objects, moving objects. `,
		],
		time: new Date(`2025-11-17`),
	},
	{
		version: "0.1.3",
		message: [
			`Added objects: blocks, gravity zones, teleporters, spawners. `,
			`Added room switching.`,
		],
		time: new Date(`2025-11-11`),
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