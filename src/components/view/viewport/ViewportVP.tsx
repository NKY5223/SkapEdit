import { Layout } from "@components/layout/Layout.tsx";
import { Viewport } from "./Viewport.tsx";


export const ViewportVP: Layout.ViewProvider = {
	name: "map.viewport",
	Component: Viewport,
};
