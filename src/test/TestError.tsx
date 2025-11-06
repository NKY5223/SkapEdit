import { Layout, makeStatelessViewProvider } from "@components/layout/layout";

const TestError: Layout.ViewComponent = () => {
	throw new Error("Test error", {
		cause: [
			new RangeError("rangeerror"),
			new Error("caused error", { cause: 1 })
		]
	});
	return <></>;
};

export const TestErrorVP: Layout.ViewProvider = makeStatelessViewProvider({
	name: "test.error",
	Component: TestError,
	icon: "error",
});