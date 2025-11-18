import { Color } from "@common/color.ts";
import { vec2 } from "@common/vec2.ts";
import { Layout, makeSplitX, makeView } from "@components/layout/layout";
import { viewProviders } from "@components/layout/views.tsx";
import { makeButton, makeCardinalGravityZone, makeCircularLava, makeDoor, makeFreeGravityZone, makeLava, makeMovePoint, makeMovingLava, makeObstacle, makeReward, makeRoom, makeRotatingLava, makeSpawner, makeSpawnerEntity, makeSwitch, makeTeleporterPair, makeText, makeTurret, SkapMap, SkapRoom, toIdMap } from "@editor/map.ts";
import { CardinalDirection } from "@editor/object/Base.tsx";
import { Power } from "@editor/object/reward.tsx";

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
);
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
const button = makeButton(95, 0, 100, 20, "Button", CardinalDirection.Right, 5);
const switchObj = makeSwitch(95, 40, 100, 60, "Switch", CardinalDirection.Right);
const testRoom: SkapRoom = makeRoom(
	"Test 1",
	{ left: 0, top: 0, right: 100, bottom: 100, },
	Color.DEFAULT_OBSTACLE,
	Color.DEFAULT_BACKGROUND,
	[
		tp2,
		makeTurret(50, 50,
			0, 0, 100, 100,
			2, 0.1, 10, 4, 4,
		),
		makeDoor(90, 80, 100, 100, [{
			objectId: button.id,
			invert: true,
			hidden: true,
		}, {
			objectId: switchObj.id,
			invert: false,
			hidden: false,
		}]),
		button,
		switchObj,
		makeReward(50, 80, [
			Power.Boom,
		]),
	]
);
export const defaultMap: SkapMap = {
	author: "SkapEdit",
	name: "Default SkapEdit Map",
	version: 0,
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
