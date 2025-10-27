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

console.warn(
	"%cWARNING:%c\n\tYou should not paste %cany %ccode you do not understand into this console %cUNDER ANY CIRCUMSTANCES.", 
	"font-size: 2.5em;", 
	"font-size: 1.5em;", 
	"font-size: 1.5em; font-style: italic;", 
	"font-size: 1.5em;", 
	"font-size: 1.5em; font-weight: bold;",
);