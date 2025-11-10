import { Color } from "@common/color.ts";
import { vec2 } from "@common/vec2.ts";
import { Layout, makeSplitX, makeView } from "@components/layout/layout";
import { viewProviders } from "@components/layout/views.tsx";
import { makeCardinalGravityZone, makeFreeGravityZone, makeLava, makeObstacle, makeRoom, makeSpawner, makeSpawnerEntity, makeTeleporterPair, makeText, SkapMap, SkapRoom, toIdMap } from "@editor/map.ts";
import { CardinalDirection } from "@editor/object/Base.tsx";

const defaultLayout = makeSplitX(0.75,
	makeView(viewProviders["map.viewport"]),
	makeView(viewProviders["map.inspector"]),
);
export const defaultLayoutTree: Layout.Tree = {
	node: defaultLayout
};
const [tp1, tp2] = makeTeleporterPair(
	50, 5, 60, 25, CardinalDirection.Right,
	-10, 80, 0, 100, CardinalDirection.Left,
)
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
		makeText(15, 10, `a,    M_²[ℤ𰻞乙a`),
		tp1,
	]
);
const testRoom: SkapRoom = makeRoom(
	"Test 1",
	{ left: 0, top: 0, right: 100, bottom: 100, },
	Color.DEFAULT_OBSTACLE,
	Color.DEFAULT_BACKGROUND,
	[
		tp2,
		makeSpawner(0, 0, 100, 100, [
			makeSpawnerEntity("normal", 5, 5, 5),
			makeSpawnerEntity("spike", 10, 5, 3),
			makeSpawnerEntity("reverse", 1, 50, 1),
			makeSpawnerEntity("normal", 5, 5, 5),
		])
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
	]),
	edited: false,
};
