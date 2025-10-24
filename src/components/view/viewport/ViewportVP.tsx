import { Layout } from "@components/layout/layout.ts";
import { Viewport } from "./Viewport.tsx";


export const ViewportVP: Layout.ViewProvider = {
	name: "map.viewport",
	Component: Viewport,
	icon: "monitor",
};
