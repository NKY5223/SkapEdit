import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
	const env = loadEnv(mode, false);
	console.log("env:", env);
	console.log("GITHUB:", env.VITE_IS_GITHUB);

	const base = env.VITE_GITHUB_REPO_NAME !== undefined
		? `/${env.VITE_GITHUB_REPO_NAME}/` 
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