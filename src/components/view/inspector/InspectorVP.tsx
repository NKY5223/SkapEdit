import { Layout } from "@components/layout/layout.ts";
import { Inspector } from "./Inspector.tsx";


export const InspectorVP: Layout.ViewProvider = {
	name: "map.inspector",
	Component: Inspector,
	icon: "frame_inspect",
};
