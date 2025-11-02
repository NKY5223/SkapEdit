import { Color } from "@common/color.ts";
import { vec2 } from "@common/vec2.ts";
import { Layout } from "@components/layout/layout";
import { makeSplitX, makeSplitY } from "@components/layout/layout";
import { makeView } from "@components/layout/LayoutView.tsx";
import { makeObstacle, SkapRoom, makeRoom, makeLava, makeText, SkapMap, objectWithIdArrayToMap } from "@editor/map.ts";

const actualLayout = makeSplitX(0.75,
	makeView("map.viewport"),
	makeView("map.inspector")
);
const testLayout = makeSplitY(0.1,
	makeView("ILLEGAL"),
	makeSplitX(0.75,
		makeView("map.viewport"),
		makeSplitY(0.8,
			makeView("map.inspector"),
			makeView("test.swatch")
		)
	)
);
const defaultLayout: Layout.Node = import.meta.env.DEV ? testLayout : actualLayout;
export const defaultLayoutTree: Layout.Tree = {
	node: defaultLayout
};
const defaultRoom: SkapRoom = makeRoom(
	"Default",
	{ left: 0, top: 0, right: 50, bottom: 25 },
	Color.hex(0x000a57, 0.8),
	Color.hex(0xe6e6e6),
	[
		makeObstacle(0, 0, 10, 10),
		makeObstacle(10, 10, 20, 20),
		makeLava(15, 15, 25, 50),
		makeLava(-10, 15, 40, 25),
		// also the windows 10 sc IME interprets "biang" as "bi'ang" so i had to google it
		makeText(15, 10, "a,    M_²[ℤ𰻞乙a"),
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
