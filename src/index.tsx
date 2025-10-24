import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Test } from "./test/Test.tsx";

const root = document.getElementById("app_root");
if (!root) {
	throw new Error("No root element, cannot render anything :(");
}
createRoot(root).render((
	<StrictMode>
		<Test />
	</StrictMode>
));