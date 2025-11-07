import { Color } from "@common/color.ts";
import { vec2 } from "@common/vec2.ts";
import { Layout, makeSplitX, makeView } from "@components/layout/layout";
import { viewProviders } from "@components/layout/views.tsx";
import { makeBlock, makeLava, makeObstacle, makeRoom, makeText, SkapMap, SkapRoom, toIdMap } from "@editor/map.ts";

const defaultLayout = makeSplitX(0.75,
	makeView(viewProviders["map.viewport"]),
	makeView(viewProviders["map.inspector"]),
);
export const defaultLayoutTree: Layout.Tree = {
	node: defaultLayout
};
const homeRoom: SkapRoom = makeRoom(
	"Home",
	{ left: 0, top: 0, right: 50, bottom: 25 },
	Color.DEFAULT_OBSTACLE,
	Color.DEFAULT_BACKGROUND,
	[
		makeObstacle(0, 0, 10, 10),
		makeObstacle(10, 10, 20, 20),
		makeLava(15, 15, 25, 50),
		makeLava(-10, 15, 40, 25),
		// also the windows 10 sc IME interprets "biang" as "bi'ang" so i had to google it
		makeText(15, 10, "a,    M_²[ℤ𰻞乙a"),
	]
);
const testRoom: SkapRoom = makeRoom(
	"Test 1",
	{ left: 0, top: 0, right: 100, bottom: 100, },
	Color.DEFAULT_OBSTACLE,
	Color.DEFAULT_BACKGROUND,
	[
		makeText(50, 50, "test"),
		makeBlock(0, 0, 75, 50, Color.hex(0x2080ff, 0.5), 0, true),
		makeBlock(25, 0, 100, 50, Color.hex(0xd01000, 0.5), 0, true),

		makeBlock(25, 50, 100, 100, Color.hex(0xd01000, 0.5), 0, true),
		makeBlock(0, 50, 75, 100, Color.hex(0x2080ff, 0.5), 0, true),
	]
);
export const defaultMap: SkapMap = {
	author: "SkapEdit",
	name: "Default SkapEdit Map",
	version: 1,
	spawn: {
		room: homeRoom.id,
		position: vec2(5, 5),
	},
	rooms: toIdMap([
		homeRoom,
		testRoom
	])
};
