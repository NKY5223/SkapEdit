import { toMap } from "@common/toMap.tsx";
import { ContextMenuProvider } from "@components/contextmenu/ContextMenuProvider.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { SkapMapProvider } from "@editor/map.ts";
import { FC } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";
import { views } from "../layout/views.tsx";
import { defaultLayoutTree, defaultMap } from "./default.tsx";
import { SelectionProvider } from "./selection.ts";
import { LayoutRoot } from "@components/layout/Layout.tsx";
import { TranslationProvider } from "@components/translate/TranslationProvider.tsx";
import { translator_en_US } from "@components/translate/translation/en_US.ts";
import { translator_zh_Hans } from "@components/translate/translation/zh_Hans.ts";

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	return (
		<ErrorBoundary location="Editor">
			<ThemeProvider>
				<TranslationProvider value={translator_en_US}>
					<ContextMenuProvider>
						<SkapMapProvider initialValue={defaultMap}>
							<SelectionProvider initialValue={null}>
								<LayoutRoot layout={defaultLayoutTree} viewProviders={toMap(views)} />
							</SelectionProvider>
						</SkapMapProvider>
					</ContextMenuProvider>
				</TranslationProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}