import { toMap } from "@common/toMap.tsx";
import { ContextMenuProvider } from "@components/contextmenu/ContextMenuProvider.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { LayoutProvider, ViewInfoStatesProvider, ViewProvidersProvider } from "@components/layout/layout.ts";
import { LayoutRoot } from "@components/layout/Layout.tsx";
import { Topbar } from "@components/Topbar.tsx";
import { translator_en_US } from "@components/translate/translation/en_US.ts";
import { translator_zh_Hans } from "@components/translate/translation/zh_Hans.ts";
import { TranslationProvider } from "@components/translate/TranslationProvider.tsx";
import { SkapMapProvider } from "@editor/map.ts";
import { FC } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";
import { views } from "../layout/views.tsx";
import { defaultLayoutTree, defaultMap } from "./default.tsx";
import css from "./Editor.module.css";
import { SelectionProvider } from "./selection.ts";

// use chinese on dev (for testing!!)
// if anything shows up in english it is probably untranslated.
// except inspector i couldn't find a translation for that
const translator = import.meta.env.DEV 
	? translator_zh_Hans 
	: translator_en_US;

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	return (
		<ErrorBoundary location="Editor">
			<ThemeProvider>
				<TranslationProvider value={translator}>
					<ContextMenuProvider>
						<SkapMapProvider initialValue={defaultMap}>
							<SelectionProvider initialValue={null}>

								<ViewInfoStatesProvider value={new Map()}>
									<ViewProvidersProvider value={toMap(views)}>
										<LayoutProvider initialValue={defaultLayoutTree}>
											<div className={css["editor"]}>
												<Topbar />
												<LayoutRoot />
											</div>
										</LayoutProvider>
									</ViewProvidersProvider>
								</ViewInfoStatesProvider>

							</SelectionProvider>
						</SkapMapProvider>
					</ContextMenuProvider>
				</TranslationProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}