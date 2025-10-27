import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

declare global {
	interface ImportMeta {
	env: undefined | Record<`VITE_${string}`, string | undefined>;
}
}
// https://vitejs.dev/config/
export default defineConfig(() => {
	console.log("env:", import.meta.env);
	console.log("GITHUB:", import.meta.env?.VITE_IS_GITHUB);

	const base = import.meta.env?.VITE_IS_GITHUB === "true" 
		? "/SkapEdit/" 
		: "/";
	console.log("Base:", base);

	return {
		plugins: [react()],
		base,
		resolve: {
			alias: {
				"@common": path.join(__dirname, "./src/common"),
				"@components": path.join(__dirname, "./src/components"),
				"@hooks": path.join(__dirname, "./src/hooks"),
				"@icon": path.join(__dirname, "./src/components/icon/icon"),
				"@editor": path.join(__dirname, "./src/editor"),
			}
		}
	};
});