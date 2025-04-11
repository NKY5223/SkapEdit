import { FC, memo, ReactNode } from "react";
import css from "./LayoutView.module.css";
import { LayoutDescView, LayoutFC, useView } from "./Layout.tsx";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { classList } from "../utils.tsx";
import { Translate } from "../translate/Translate.tsx";
import { ViewSelector } from "./LayoutViewToolbar.tsx";
import { createId } from "../../common/uuid.ts";
import { section, single, submenu } from "../contextmenu/ContextMenu.tsx";
import { useContextMenu } from "@components/contextmenu/context.tsx";

type ViewProps = {
	children: ReactNode;
};
export type ViewFC = FC<ViewProps>;

type LayoutViewProps = {
};
export const LayoutView: LayoutFC<LayoutDescView, LayoutViewProps> = ({
	desc, dispatch,
}) => {
	const createContextMenu = useContextMenu([
		single("single", "Test 0"),
		section("section-title", "Section Title", [
			single("uwu", "UwU"),
		]),
		section("section-notitle", null, [
			single("single", "Titleless Section"),
			submenu("submenu0", "Submenu", [
				single("single", "Test In Submenu",
					() => console.log("clicked test in submenu")),
				submenu("submenu", "Submenu²", [
					single("single", "Test In Submenu²",
						() => console.log("clicked test in submenu²")),
				]),
			]),
			submenu("submenu1", "Submenu", [
				single("single", "Test In Submenu",
					() => console.log("clicked test in submenu")),
				submenu("submenu", "Submenu²", [
					single("single", "Test In Submenu²",
						() => console.log("clicked test in submenu²")),
				]),
			]),
		]),
	]);

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
				<h1><Translate k="error.layout.view.unknown" values={{ view }} /></h1>
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