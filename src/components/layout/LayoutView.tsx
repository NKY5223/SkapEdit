import { FC, memo, ReactNode } from "react";
import css from "./LayoutView.module.css";
import { LayoutDescView, LayoutFC, useView } from "./Layout.tsx";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { classList } from "../utils.tsx";
import { Translate } from "../translate/Translate.tsx";
import { ViewSelector } from "./LayoutViewToolbar.tsx";
import { createId } from "../../common/uuid.ts";
import { section, single, submenu } from "../contextmenu/ContextMenu.tsx";
import { useContextMenu } from "@components/contextmenu/hook.tsx";

type ViewProps = {
	children: ReactNode;
};
export type ViewFC = FC<ViewProps>;

type LayoutViewProps = {
};
export const LayoutView: LayoutFC<LayoutDescView, LayoutViewProps> = ({
	desc, dispatch,
}) => {
	const createContextMenu = useContextMenu({
		items: [
			single("single0", "Test 0", () => console.log("clicked test 0")),
			section("section0", "Section Title", [
				single("section0.single0", "UwU"),
			]),
			section("section1", null, [
				single("section1.single0", "Titleless Section"),
				submenu("section1.submenu0", "Submenu", [
					single("section1.submenu0.single0", "Test In Submenu", () => console.log("clicked test in submenu")),
					submenu("section1.submenu0.submenu0", "Submenu²", [
						single("section1.submenu0.submenu0.single0", "Test In Submenu²", () => console.log("clicked test in submenu²")),
					]),
				]),
				submenu("section1.submenu1", "Submenu", [
					single("section1.submenu1.single0", "Test In Submenu", () => console.log("clicked test in submenu")),
					submenu("section1.submenu1.submenu0", "Submenu²", [
						single("section1.submenu1.submenu0.single0", "Test In Submenu²", () => console.log("clicked test in submenu²")),
					]),
				]),
			]),
		]
	});

	const { view } = desc;
	const View = useView(view);
	if (!View) {
		const className = classList(
			css["view"],
			css["unknown"]
		);
		return (
			<div className={className}>
				<ViewSelector view={desc} dispatch={dispatch} />
				<h1><Translate values={{ view }}>error.layout.view.unknown</Translate></h1>
			</div>
		);
	}
	return (
		<ErrorBoundary location={`View "${desc.view}"`}>
			<div className={css.view} onContextMenu={createContextMenu}>
				<View>
					<ViewSelector view={desc} dispatch={dispatch} />
				</View>
			</div>
		</ErrorBoundary>
	);
}
export const LayoutViewMemo = memo(LayoutView, ({ desc: a }, { desc: b }) => (a === b));

export const makeLayoutView = (view: string): LayoutDescView => ({
	type: "view",
	id: createId(),
	view,
});