import { useContextMenu } from "@components/contextmenu/context.tsx";
import { section, single } from "@components/contextmenu/ContextMenu.tsx";
import { FC, memo, ReactNode } from "react";
import { createId } from "../../common/uuid.ts";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { Translate } from "../translate/Translate.tsx";
import { classList } from "../utils.tsx";
import { emptyViewProvider, Layout, LayoutFC, useViewProvider, useViewState } from "./Layout.tsx";
import { makeSplitX, makeSplitY } from "./LayoutSplit.tsx";
import css from "./LayoutView.module.css";
import { ViewSelector } from "./LayoutViewToolbar.tsx";

type ViewProps = {
	children: ReactNode;
};
export type ViewFC = FC<ViewProps>;

type LayoutViewProps = {
};
export const LayoutView: LayoutFC<Layout.NodeView, LayoutViewProps> = ({
	node, dispatchLayout,
}) => {
	const handleContextMenu = useContextMenu([
		section("layout", (<Translate k="layout" />), null, [
			single("split-x", (<Translate k="layout.view.split-x" />), "split-x", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitX(0.5,
					node,
					makeView(emptyViewProvider),
				)
			})),
			single("split-y", (<Translate k="layout.view.split-y" />), "split-y", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitY(0.5,
					node,
					makeView(emptyViewProvider),
				)
			})),
		])
	]);

	const id = node.id;

	// goofy ass polymorphismn't???
	type State = "State";
	type Action = "Action";

	const provider = (useViewProvider(node.providerName) as Layout.ViewProvider<State, Action> | undefined);

	if (!provider) {
		const className = classList(
			css["view"],
			css["unknown"],
		);
		return (
			<div className={className} onContextMenu={handleContextMenu}>
				<ViewSelector view={node} dispatch={dispatchLayout} />
				<h1><Translate k="error.layout.view.unknown" view={id} /></h1>
			</div>
		);
	}
	const state = node.state;
	const {
		name,
		valid, validAction,
		reducer,
		Component: ViewComp,
	} = provider;

	if (!(valid ?? ((state): state is State => true))(state)) {
		const className = classList(
			css["view"],
		);
		return (
			<div className={className} onContextMenu={handleContextMenu}>
				<ViewSelector view={node} dispatch={dispatchLayout} />
				<h1><Translate k="error.layout.view.unknown" view={id} />invalid viewstate</h1>
			</div>
		)
	}

	const dispatchThis: React.Dispatch<Action> = action => {
		dispatchLayout({
			type: "update_state",
			targetNode: id,
			state: reducer(state, action),
		})
	};

	const dispatchTo = <A,>(id: string, action: A): boolean => {
		return true;
	}
	return (
		<ErrorBoundary location={`LayoutView(${JSON.stringify(id)})`}>
			<div className={css.view} onContextMenu={handleContextMenu}>
				<ViewComp
					state={state}
					dispatchThis={dispatchThis}
					dispatchTo={dispatchTo}
					dispatchLayout={dispatchLayout}
					viewSwitch={<ViewSelector view={node} dispatch={dispatchLayout} />}
				/>
			</div>
		</ErrorBoundary>
	);
}
export const LayoutViewMemo = memo(LayoutView, ({ node: a }, { node: b }) => (a === b));

export const makeView = <State,>(provider: Layout.ViewProvider<State>):
	Layout.NodeView => {

	const id = createId("viewState_");
	const state = provider.new(id);
	return {
		type: "view",
		id: createId("viewNode_"),
		providerName: provider.name,
		state,
	};
};