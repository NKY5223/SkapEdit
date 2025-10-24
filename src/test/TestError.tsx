import { Layout } from "@components/layout/layout";

export const TestError: Layout.ViewComponent = () => {
	throw new Error("Test error", {
		cause: [
			new RangeError("rangeerror"),
			new Error("caused error", { cause: 1 })
		]
	});
	return <></>;
};

export const TestErrorVP: Layout.ViewProvider = {
	name: "test.error",
	Component: TestError,
	icon: "error",
};