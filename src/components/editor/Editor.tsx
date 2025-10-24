import { toMap } from "@common/toMap.tsx";
import { ContextMenuProvider } from "@components/contextmenu/ContextMenuProvider.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { DefaultTranslationProvider } from "@components/translate/DefaultTranslationProvider.tsx";
import { SkapMapProvider } from "@editor/map.ts";
import { FC } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";
import { views } from "../layout/views.tsx";
import { defaultLayoutTree, defaultMap, obj1 } from "./default.tsx";
import { SelectionProvider } from "./selection.ts";
import { LayoutRoot } from "@components/layout/Layout.tsx";

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	return (
		<ErrorBoundary location="Editor">
			<ThemeProvider>
				<DefaultTranslationProvider>
					<ContextMenuProvider>
						<SkapMapProvider initialValue={defaultMap}>
							<SelectionProvider initialValue={obj1.id}>
								<LayoutRoot layout={defaultLayoutTree} viewProviders={toMap(views)} />
							</SelectionProvider>
						</SkapMapProvider>
					</ContextMenuProvider>
				</DefaultTranslationProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}