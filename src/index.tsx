import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Editor } from "@components/editor/Editor.tsx";

const root = document.getElementById("app_root");
if (!root) {
	throw new Error("No root element, cannot render anything :(");
}
createRoot(root).render((
	<StrictMode>
		<Editor />
	</StrictMode>
));

console.warn(
	"%cWARNING:%c\n\tYou should not, %cUNDER ANY CIRCUMSTANCES%c, paste %cany%c code you do not understand into this console.", 
	"font-size: 2.5em;", 
	"font-size: 1.5em;", 
	"font-size: 1.5em; font-weight: bold;",
	"font-size: 1.5em;", 
	"font-size: 1.5em; font-style: italic;", 
	"font-size: 1.5em;", 
);