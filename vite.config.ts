import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@common": path.join(__dirname, "./src/common"),
			"@components": path.join(__dirname, "./src/components"),
			"@hooks": path.join(__dirname, "./src/hooks"),
			"@icon": path.join(__dirname, "./src/components/icon/icon"),
			"@editor": path.join(__dirname, "./src/editor"),
		}
	}
});