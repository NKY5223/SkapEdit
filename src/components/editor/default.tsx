import { Color } from "@common/color.ts";
import { vec2 } from "@common/vec2.ts";
import { Layout } from "@components/layout/Layout.tsx";
import { makeSplitX, makeSplitY } from "@components/layout/LayoutSplit.tsx";
import { makeView } from "@components/layout/LayoutView.tsx";
import { mkObstacle, SkapRoom, mkRoom, mkLava, mkText, SkapMap, objectWithIdArrayToMap } from "@editor/map.ts";

const actualLayout = makeSplitX(0.75,
	makeView("map.viewport"),
	makeView("map.inspector")
);
const testLayout = makeSplitY(0.2,
	makeSplitX(0.5,
		makeView("test.empty"),
		makeView("ILLEGAL"),
	),
	makeSplitX(0.4,
		makeView("map.viewport"),
		makeSplitY(0.6,
			makeView("map.inspector"),
			makeView("test.swatch")
		)
	)
);
const defaultLayout: Layout.Node = true ? testLayout : actualLayout;
export const defaultLayoutRoot: Layout.Root = {
	tree: {
		node: defaultLayout
	}
};
export const obj1 = mkObstacle(0, 0, 10, 10);
const defaultRoom: SkapRoom = mkRoom(
	"Default",
	{ left: 0, top: 0, right: 50, bottom: 25 },
	Color.hex(0x000a57, 0.8),
	Color.hex(0xe6e6e6),
	[
		obj1,
		mkObstacle(10, 10, 20, 20),
		mkLava(15, 15, 25, 50),
		mkLava(-10, 15, 40, 25),
		// i can't even read that
		// also the windows 10 sc IME interprets "biang" as "bi'ang" so i had to google it
		mkText(15, 10, "a,    M_²[ℤ𰻞乙a"),
	]
);
export const defaultMap: SkapMap = {
	spawn: {
		room: defaultRoom.id,
		position: vec2(5, 5),
	},
	rooms: objectWithIdArrayToMap([
		defaultRoom,
	])
};
