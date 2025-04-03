import { ViewFC } from "../components/layout/LayoutView.tsx";

export const TestError: ViewFC = () => {
	throw new Error("Test error", {
		cause: [
			new RangeError("rangeerror"),
			new Error("caused error", { cause: 1 })
		]
	});
	return <></>;
};
